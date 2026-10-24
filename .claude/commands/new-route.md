---
description: Scaffold a new CRUD resource (store, route, mount, tests, docs) for this API
argument-hint: <resource> <field> [field...]   e.g. posts title body
---

Scaffold a new resource for this Course API from these arguments: `$ARGUMENTS`

The first word is the resource name: plural and lowercase, and also the base path (`posts` → `/posts`). Every word after it is a required string field on the record. Records also get a numeric `id`, assigned by the store.

Before writing anything:
- If no arguments were given, or only a resource name with no fields, stop and ask for them.
- If `routes/<resource>.js` already exists or `server.js` already mounts that path, stop and say so. This command only creates new resources.

Then build it following the project's `add-api-endpoint` skill (`.claude/skills/add-api-endpoint/SKILL.md`) and CLAUDE.md. Create the standard five endpoints:

| Endpoint | Success | Errors |
|---|---|---|
| `GET /<resource>` | `200`, the array | none |
| `GET /<resource>/:id` | `200`, the record | `400` non-integer id, `404` missing |
| `POST /<resource>` | `201`, the created record | `400` if any field is missing or not a non-empty string |
| `PUT /<resource>/:id` | `200`, the updated record | `400` non-integer id, `400` if no fields are given or any given field is not a non-empty string, `404` missing |
| `DELETE /<resource>/:id` | `204`, no body | `400` non-integer id, `404` missing |

Touch these places:
1. `db/store.js`: list/get/create/update/delete helpers for the resource, its array and id counter, and two seed records in `seed()` so `reset()` restores them. Export the helpers.
2. `routes/<resource>.js`: a new router in the same style as `routes/users.js`, with errors as `{ "error": "message" }`.
3. `server.js`: require the router and mount it under `/<resource>`, next to the existing mounts.
4. `tests/<resource>.test.js`: success, `400` and `404` cases for every endpoint, with `store.reset()` in `beforeEach`.
5. `docs/api.md`: a new `## <Resource>` section with the record shape and a `### METHOD /path` entry per endpoint.

Finish by running `npm test` and `npm run lint` and fixing anything that fails. Don't commit. Report the files changed and the test count.
