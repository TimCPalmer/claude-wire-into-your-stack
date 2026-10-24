---
name: add-api-endpoint
description: How to add or change an HTTP endpoint in this Course API (Express) so it follows the project's route, store, validation, error-format, test and docs conventions. Use when the user asks to add, create, scaffold or change a route, endpoint or resource (e.g. "add DELETE /users/:id", "add a /posts resource", "let users be filtered by email"). Do not use for non-endpoint work such as CI, lint config, README edits, refactoring db/store.js internals alone, or Claude/MCP setup.
---

# Adding or changing an endpoint

Every endpoint change in this repo touches the same four places, in this order. Do all four; a route without its store helper, test and docs entry is incomplete.

## 1. Store helper — `db/store.js`

All data access goes through the store. Routes never hold state or touch the arrays directly.

- Add a plain function next to the existing ones (`listUsers`, `getUser`, `createUser`, `updateUser`) and add it to `module.exports`.
- Return `undefined` when the record doesn't exist; the route turns that into a `404`.
- For a new resource, add its array and id counter to `seed()` so `reset()` restores it for the tests.

## 2. Route — `routes/<resource>.js`

One file per resource, exporting an Express router. Match the style of `routes/users.js`:

```js
// DELETE /users/:id — remove a user, or 404 if it doesn't exist.
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'id must be an integer' });
  }
  const removed = store.deleteUser(id);
  if (!removed) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(204).end();
});
```

Rules:
- A one-line `// METHOD /path — what it does.` comment above each handler.
- Validate input in the route, before calling the store:
  - `400` for bad input: missing fields, wrong types, empty strings, non-integer ids. `req.body` is untrusted, so check `typeof x === 'string' && x.trim() !== ''` rather than just truthiness.
  - `404` when the store returns `undefined`.
- Every error is JSON in exactly the shape `{ "error": "message" }`. Never send plain text or HTML.
- Success codes: `200` with the record for reads and updates, `201` with the created record for `POST`, `204` with no body for `DELETE`.
- Always `return res...` so a handler never responds twice.
- Keep handlers synchronous, like the existing ones (Express 4 doesn't catch rejected promises).

For a **new resource**, also mount the router in `server.js` under its base path, next to the existing `app.use('/users', usersRouter)`.

## 3. Tests — `tests/<resource>.test.js`

Node's built-in runner plus `supertest`, against the exported app (no port is opened):

```js
const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('DELETE /users/:id returns 404 for a missing user', async () => {
  const res = await request(app).delete('/users/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'User not found' });
});
```

Cover, for each new or changed endpoint:
- the success path (status and the relevant body fields),
- each `400` case the route validates,
- the `404` case when the endpoint takes an id.

Test names follow `'METHOD /path does X'`. Add to the existing file for that resource rather than creating a second one.

## 4. Docs — `docs/api.md`

Add or update a `### METHOD /path` section under the resource's `##` heading. One or two sentences: what the body takes, what it returns, and which `400`/`404` cases apply. Match the wording of the existing entries.

## Finish

Run `npm test` and `npm run lint`; both must pass (CI runs the same two).
