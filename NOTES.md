# Notes: wiring Claude into the Course API

## Server (MCP)

I connected **Context7** (`https://mcp.context7.com/mcp`) at project scope in `.mcp.json`. It serves current library docs, which matters here because Claude's built-in knowledge of Express 4, `supertest`, `node:test` and ESLint 9 flat config can be out of date. It's free and needs no key, so nothing secret is committed. The rule in `.claude/settings.json` allows only its two read-only lookup tools, `mcp__context7__resolve-library-id` and `mcp__context7__query-docs`, rather than blanket-allowing the server. I used it to check `routes/users.js` against the Express 4 docs. That found three gaps: malformed JSON gets an HTML 400 instead of `{ "error" }`, body fields aren't type-checked, and a non-numeric id gets a 404 instead of a 400.

## Skill

`.claude/skills/add-api-endpoint/SKILL.md` captures how an endpoint is added in this repo. Every endpoint touches the same four places in order: a store helper in `db/store.js`, the route (validation in the route, `400`/`404`, errors as `{ "error": "message" }`), `node:test` + `supertest` tests with `store.reset()`, and an entry in `docs/api.md`. The description names this project and the actions ("add, create, scaffold or change a route, endpoint or resource"), gives example requests in the user's own words ("add DELETE /users/:id"), and lists what it's *not* for (CI, lint config, README edits, store-only refactors, Claude/MCP setup). I confirmed it by asking "add an api endpoint" without naming the skill. It fired and produced `DELETE /users/:id`.

## Command

`/new-route <resource> <field...>` (`.claude/commands/new-route.md`) scaffolds a whole CRUD resource: five endpoints, store helpers with seed data, the mount in `server.js`, tests and docs. Then it runs `npm test` and `npm run lint`. That's about 20 coordinated edits across 5 files that I'd otherwise re-explain every time. It takes `$ARGUMENTS`, refuses to run without fields or over an existing resource, and points at the skill for conventions instead of duplicating them. I ran it twice: with no arguments it stopped and asked, and `/new-route posts title body` built `/posts` with 15 passing tests.

## Hook

A **PostToolUse** hook, so it reacts after the fact rather than preventing anything. Its matcher is `Edit|Write|MultiEdit`, and it runs `.claude/hooks/format.js`, which formats the edited file with Prettier. ESLint here has no formatting rules, so I added Prettier with a config that matches the existing style; no original file changed. The hook is limited to `.js`, because Prettier would have reflowed all the existing Markdown. It never fails an edit. I triggered it by asking Claude to add `const   x={a:1,b:2}`, and the file was saved as `const x = { a: 1, b: 2 };`.

## Headless

I ran a docs-vs-routes audit with `claude -p`:

```
claude -p "Check that docs/api.md documents every route in routes/*.js, with the same status codes and 400/404 cases. List any mismatches as file:line with a one-line suggested fix. If everything matches, say so. Do not edit any files." --allowedTools "Read,Grep,Glob"
```

The task only needs to find and read files, so I allowed `Read`, `Grep` and `Glob`. There's no `Edit`/`Write`, so it can't change anything, and no `Bash`, so it can't run commands. In `-p` mode any tool outside the list is denied rather than prompted. The project's own allow rules still apply, so the read-only Context7 tools were available too. Result: TODO, paste the summary here.
