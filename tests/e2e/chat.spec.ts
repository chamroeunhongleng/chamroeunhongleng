import { test, expect, type Page, type Route } from '@playwright/test'

/**
 * Chat assistant — the site's only runtime backend (api/chat.ts).
 *
 * Every test mocks POST /api/chat at the network boundary. Two reasons:
 * the static build under test has no serverless function at all, and the real
 * endpoint costs Anthropic credits and needs an owner-managed key
 * (CLAUDE.md rule 6). Mocking also makes error paths testable on demand.
 *
 * What this covers is the CLIENT contract: that the widget sends what
 * api/chat.ts expects, and renders what it returns — including the failure
 * replies. The server's own logic is unit-tested in tests/chat/.
 */

// Runs on a desktop and a phone: the panel is responsive and the phone case is
// where a full-screen overlay would trap a visitor.
const DEVICES = ['laptop', 'mobile-android']

// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(!DEVICES.includes(testInfo.project.name), 'covered on laptop + one phone')
})

interface ChatReply {
  reply: string
  navigateTo: string | null
  suggested: string[]
}

/** Capture outgoing request bodies while serving a canned reply. */
function mockChat(page: Page, reply: Partial<ChatReply>, status = 200) {
  const requests: Array<{ message: string, history: Array<{ role: string, content: string }> }> = []

  const handler = async (route: Route) => {
    const body = route.request().postDataJSON()
    requests.push(body)
    if (status !== 200) return route.fulfill({ status, body: '{}' })
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: 'ok', navigateTo: null, suggested: [], ...reply })
    })
  }

  return page.route('**/api/chat', handler).then(() => requests)
}

/**
 * Open the panel, tolerating hydration.
 *
 * The launcher is server-rendered, so it is clickable before Vue attaches its
 * handler and a click landing in that window is silently swallowed — the same
 * race as openMobileMenu() in responsive.spec.ts. Retrying is safe because the
 * click is guarded by the panel's current visibility, so it never toggles an
 * already-open panel shut.
 */
const openPanel = async (page: Page) => {
  const launcher = page.getByRole('button', { name: 'Chat about this site' })
  const panel = page.getByRole('dialog', { name: 'Site assistant' })

  await expect(async () => {
    if (!(await panel.isVisible())) await launcher.click()
    await expect(panel).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 20_000 })
}

const ask = async (page: Page, text: string) => {
  await page.getByLabel('Ask about Chamroeun').fill(text)
  await page.getByRole('button', { name: 'Send' }).click()
}

test.describe('Chat widget shell', () => {
  test('launcher is present and the panel starts closed', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Chat about this site' })).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Site assistant' })).toBeHidden()
  })

  test('opens with a welcome message and starter questions', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    await expect(page.locator('.chat-messages')).toContainText('I can answer questions about')
    // The starter chips are the discoverability affordance — an empty panel
    // gives a visitor nothing to click.
    await expect(page.locator('.chat-chip').first()).toBeVisible()
  })

  test('Escape closes the panel and returns focus to the launcher', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Site assistant' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Chat about this site' })).toBeFocused()
  })

  test('the close button closes the panel', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    await page.getByRole('button', { name: 'Close chat' }).click()
    await expect(page.getByRole('dialog', { name: 'Site assistant' })).toBeHidden()
  })

  test('Send is disabled until something is typed', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    const send = page.getByRole('button', { name: 'Send' })
    await expect(send).toBeDisabled()
    await page.getByLabel('Ask about Chamroeun').fill('hello')
    await expect(send).toBeEnabled()
  })

  test('the input caps length at the contract maximum', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)
    // MAX_MESSAGE_LENGTH in shared/chat/contract.ts — the server 400s above it,
    // so the client must never let an honest visitor exceed it.
    await expect(page.getByLabel('Ask about Chamroeun')).toHaveAttribute('maxlength', '500')
  })
})

test.describe('Chat conversation', () => {
  test('sends the message and renders the reply with follow-ups', async ({ page }) => {
    const requests = await mockChat(page, {
      reply: 'He is fine-tuning Khmer speech models.',
      suggested: ['What is Kaskor ASR?', 'How can I contact him?']
    })

    await page.goto('/')
    await openPanel(page)
    await ask(page, 'What is he working on?')

    await expect(page.locator('.chat-messages')).toContainText('What is he working on?')
    await expect(page.locator('.chat-messages')).toContainText(
      'He is fine-tuning Khmer speech models.'
    )
    await expect(page.getByRole('button', { name: 'What is Kaskor ASR?' })).toBeVisible()

    expect(requests).toHaveLength(1)
    expect(requests[0]?.message).toBe('What is he working on?')
  })

  test('never sends the local welcome bubble as history', async ({ page }) => {
    const requests = await mockChat(page, { reply: 'first' })

    await page.goto('/')
    await openPanel(page)
    await ask(page, 'one')
    await expect(page.locator('.chat-messages')).toContainText('first')
    await ask(page, 'two')
    await expect.poll(() => requests.length).toBe(2)

    // The seed bubble is local text the API must never see; leaking it would
    // put words in the assistant's mouth as if it had said them.
    const history = requests[1]?.history ?? []
    expect(history.some((h) => h.content.includes('I can answer questions about'))).toBe(false)
    expect(history[0]).toEqual({ role: 'user', content: 'one' })
  })

  test('a starter chip sends without typing', async ({ page }) => {
    const requests = await mockChat(page, { reply: 'answer' })

    await page.goto('/')
    await openPanel(page)
    const chip = page.locator('.chat-chip').first()
    const chipText = (await chip.textContent())?.trim() ?? ''
    await chip.click()

    await expect.poll(() => requests.length).toBe(1)
    expect(requests[0]?.message).toBe(chipText)
  })
})

test.describe('Chat navigation', () => {
  test('follows navigateTo and offers a way back', async ({ page }) => {
    await mockChat(page, {
      reply: 'Here are the projects.',
      navigateTo: '/projects'
    })

    await page.goto('/about')
    await openPanel(page)
    await ask(page, 'show me projects')

    await expect(page).toHaveURL(/\/projects$/)
    // The panel must survive the jump, or the conversation is lost.
    await expect(page.getByRole('dialog', { name: 'Site assistant' })).toBeVisible()

    const back = page.getByRole('button', { name: /Back to where you were/ })
    await expect(back).toBeVisible()
    await back.click()
    await expect(page).toHaveURL(/\/about$/)
    // One-shot affordance — it must not become a back-and-forth toggle.
    await expect(back).toBeHidden()
  })

  test('ignores a non-path navigateTo', async ({ page }) => {
    await mockChat(page, {
      reply: 'Careful.',
      navigateTo: 'https://example.com/phishing'
    })

    await page.goto('/')
    await openPanel(page)
    await ask(page, 'go somewhere')

    await expect(page.locator('.chat-messages')).toContainText('Careful.')
    // The client only follows values starting with "/" — an absolute URL from
    // a compromised or confused reply must not move the visitor off-site.
    await expect(page).toHaveURL(/127\.0\.0\.1:3000\/$/)
  })
})

test.describe('Chat failure handling', () => {
  test('a server error becomes a friendly message, not a broken panel', async ({ page }) => {
    await mockChat(page, {}, 500)

    await page.goto('/')
    await openPanel(page)
    await ask(page, 'hello')

    await expect(page.locator('.chat-messages')).toContainText('could not reach the assistant')
    // The visitor must still be able to try again.
    await expect(page.getByLabel('Ask about Chamroeun')).toBeEnabled()
  })

  test('a rate limit says so specifically', async ({ page }) => {
    await mockChat(page, {}, 429)

    await page.goto('/')
    await openPanel(page)
    await ask(page, 'hello')

    await expect(page.locator('.chat-messages')).toContainText('a little fast')
  })

  test('a network failure is caught', async ({ page }) => {
    await page.route('**/api/chat', (route) => route.abort())

    await page.goto('/')
    await openPanel(page)
    await ask(page, 'hello')

    await expect(page.locator('.chat-messages')).toContainText('could not reach the assistant')
  })
})
