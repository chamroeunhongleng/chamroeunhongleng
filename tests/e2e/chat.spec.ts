import { test, expect, type Page, type Route } from '@playwright/test'

// Every test mocks POST /api/chat at the network boundary: the static build under
// test has no serverless function, and the real endpoint costs Anthropic credits.

// A desktop and a phone: the phone is where a full-screen overlay would trap a visitor.
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

// The launcher is server-rendered and clickable before Vue attaches its handler, so an
// early click is swallowed. Retry, guarded by panel visibility so it never closes it.
const openPanel = async (page: Page) => {
  const launcher = page.getByRole('button', { name: 'Chat about this site' })
  const panel = page.getByRole('dialog', { name: 'Portfolio assistant' })

  await expect(async () => {
    if (!(await panel.isVisible())) await launcher.click()
    await expect(panel).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 20_000 })
}

const ask = async (page: Page, text: string) => {
  await page.getByLabel('Ask about Chamroeun').fill(text)
  await page.getByRole('button', { name: 'Send', exact: true }).click()
}

test.describe('Chat widget shell', () => {
  test('launcher is present and the panel starts closed', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Chat about this site' })).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toBeHidden()
  })

  test('opens with a welcome message and starter questions', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    await expect(page.locator('.chat-messages')).toContainText('I answer questions about Chamroeun')
    await expect(page.locator('.chat-chip').first()).toBeVisible()
  })

  test('Escape closes the panel and returns focus to the launcher', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Chat about this site' })).toBeFocused()
  })

  test('opening dims the page behind the panel', async ({ page }) => {
    await page.goto('/')
    const scrim = page.locator('.chat-scrim')
    await expect(scrim).toBeHidden()

    await openPanel(page)
    await expect(scrim).toBeVisible()

    // The scrim must also cover the sticky header (z-index 50), or the logo stays bright behind it.
    const covers = await page.evaluate(() => {
      const s = document.querySelector('.chat-scrim')!.getBoundingClientRect()
      const h = document.querySelector('.site-header')!.getBoundingClientRect()
      return s.top <= h.top && s.bottom >= h.bottom && s.left <= h.left && s.right >= h.right
    })
    expect(covers, 'scrim does not cover the header').toBe(true)
  })

  test('clicking the dimmed area closes the panel', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    // Click top-left, far from the panel in the bottom-right corner.
    await page.locator('.chat-scrim').click({ position: { x: 20, y: 20 } })
    await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toBeHidden()
  })

  test('the page still scrolls while the panel is open', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    const before = await page.evaluate(() => window.scrollY)
    await page.mouse.wheel(0, 600)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(before)

    // No body scroll lock on purpose: the assistant scrolls to section anchors while
    // the panel stays open, so locking scroll would break its own navigation.
    await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toBeVisible()
  })

  test('the launcher is hidden while the panel is open, and returns on close', async ({ page }) => {
    await page.goto('/')
    const launcher = page.getByRole('button', { name: 'Chat about this site' })
    await expect(launcher).toBeVisible()

    await openPanel(page)
    // It would otherwise float over the panel with nothing useful to do.
    await expect(launcher).toBeHidden()

    await page.getByRole('button', { name: 'Close chat' }).click()
    await expect(launcher).toBeVisible()
  })

  test('Escape restores focus to the launcher even though it was removed', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    // Guards against: a synchronous focus() on a launcher that has not rendered yet.
    await page.keyboard.press('Escape')
    await expect(page.getByRole('button', { name: 'Chat about this site' })).toBeFocused()
  })

  test('the close button closes the panel', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    await page.getByRole('button', { name: 'Close chat' }).click()
    await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toBeHidden()
  })

  test('Send is disabled until something is typed', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    const send = page.getByRole('button', { name: 'Send', exact: true })
    await expect(send).toBeDisabled()
    await page.getByLabel('Ask about Chamroeun').fill('hello')
    await expect(send).toBeEnabled()
  })

  test('the header shows the assistant name and its scope', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)

    await expect(page.locator('.chat-title')).toHaveText('Portfolio assistant')
    await expect(page.locator('.chat-subtitle')).toContainText('Published evidence only')
    await expect(page.locator('.chat-subtitle')).toContainText('read-only')
  })

  test('reset clears the conversation back to the welcome message', async ({ page }) => {
    await mockChat(page, { reply: 'A specific answer about Kaskor.' })

    await page.goto('/')
    await openPanel(page)
    await ask(page, 'tell me about Kaskor')
    await expect(page.locator('.chat-messages')).toContainText('A specific answer about Kaskor.')

    await page.getByRole('button', { name: 'Start a new conversation' }).click()

    await expect(page.locator('.chat-messages')).not.toContainText('tell me about Kaskor')
    await expect(page.locator('.chat-messages')).not.toContainText('A specific answer about Kaskor.')
    await expect(page.locator('.chat-messages')).toContainText('I answer questions about Chamroeun')
    await expect(page.locator('.chat-chip').first()).toBeVisible()
  })

  test('reset genuinely clears the history sent to the API', async ({ page }) => {
    const requests = await mockChat(page, { reply: 'ok' })

    await page.goto('/')
    await openPanel(page)
    await ask(page, 'first question')
    await expect(page.locator('.chat-messages')).toContainText('ok')

    await page.getByRole('button', { name: 'Start a new conversation' }).click()
    await ask(page, 'second question')
    await expect.poll(() => requests.length).toBe(2)

    expect(requests[1]?.history ?? []).toEqual([])
  })

  test('the input caps length at the contract maximum', async ({ page }) => {
    await page.goto('/')
    await openPanel(page)
    // 500 is MAX_MESSAGE_LENGTH in shared/chat/contract.ts; the server 400s above it.
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

    const history = requests[1]?.history ?? []
    expect(history.some((h) => h.content.includes('I answer questions about Chamroeun'))).toBe(false)
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
    await expect(page.getByRole('dialog', { name: 'Portfolio assistant' })).toBeVisible()

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
    // Only values starting with "/" are followed, so a hostile reply cannot move the visitor off-site.
    await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:\d+\/$/)
  })
})

test.describe('Chat failure handling', () => {
  test('a server error becomes a friendly message, not a broken panel', async ({ page }) => {
    await mockChat(page, {}, 500)

    await page.goto('/')
    await openPanel(page)
    await ask(page, 'hello')

    await expect(page.locator('.chat-messages')).toContainText('could not reach the assistant')
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
