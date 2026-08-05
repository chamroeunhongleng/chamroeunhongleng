# Contributing

This repository is both my GitHub profile page and the source of
[chamroeunhongleng.me](https://chamroeunhongleng.me). It is a personal site, so
I am not looking for feature contributions — but corrections are genuinely
welcome, especially to any claim that is wrong, overstated, or unsupported.

## What is most useful

- **Factual corrections.** A metric, date, award, or attribution that does not
  match its source. Open an issue with the evidence; that is the fastest path.
- **Accessibility and rendering bugs.** Especially on browsers or devices I
  cannot test locally — Safari and iOS in particular.
- **Broken links, typos, and Khmer-language errors.**

## Ground rules

The site is built on an evidence-first contract, enforced in code rather than
by convention. Read [`CLAUDE.md`](./CLAUDE.md) before changing anything; the
rules that matter most here:

1. **Every claim carries an evidence label.** Content lives in `content/*.json`
   and is validated against the zod schemas in `shared/schemas/`. Do not add a
   claim without a label, and do not upgrade a label without a source.
2. **Lifecycle status and deployment reality are separate.** Nothing that is not
   in production may be labelled Production — the schema rejects it.
3. **Never invent.** Qualifications, employment, users, revenue, awards, model
   performance, and results are off-limits unless documented. Missing facts keep
   their `[OWNER_INPUT_REQUIRED: …]` marker.
4. **No secrets.** `ANTHROPIC_API_KEY` and anything like it live in Vercel
   environment variables. Only `.env.example` is tracked.

## Local setup

```bash
npm ci
npm run dev
```

Full instructions, including the chat assistant, are in
[`docs/local-setup.md`](./docs/local-setup.md).

## Before opening a pull request

```bash
npm run verify   # the full pipeline — lint, types, schemas, tests, gates
```

If you touched `shared/chat/`, `api/chat.ts`, or `content/`, also run the
behavioural evals — the unit tests cannot see a broken guard:

```bash
npm run eval:chat
```

CI runs the same checks on every branch. A pull request that fails `verify`
will not be merged.

## Commit messages

Write the subject line as an instruction in the imperative mood, describing the
change from the reader's point of view — the style already in `git log`:

```
Move release gates into CI: verify on every branch, deploy job, chat evals
Fix five responsive layout bugs found by the device matrix
```

Not `updated stuff`, and not a Conventional Commits prefix — this repository
does not use them. Keep the subject under ~72 characters and explain the *why*
in the body when it is not obvious.

## Security

Do not open a public issue for a vulnerability. Follow
[`SECURITY.md`](./SECURITY.md).
