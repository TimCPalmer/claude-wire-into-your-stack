const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const store = require('../db/store');

test.beforeEach(() => store.reset());

test('GET /posts returns the seeded list', async () => {
  const res = await request(app).get('/posts');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.equal(res.body.length, 2);
});

test('GET /posts/:id returns an existing post', async () => {
  const res = await request(app).get('/posts/1');
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'Hello world');
});

test('GET /posts/:id returns 400 for a non-integer id', async () => {
  const res = await request(app).get('/posts/abc');
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'id must be an integer' });
});

test('GET /posts/:id returns 404 for a missing post', async () => {
  const res = await request(app).get('/posts/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Post not found' });
});

test('POST /posts creates a post', async () => {
  const res = await request(app).post('/posts').send({ title: 'New', body: 'Fresh post.' });
  assert.equal(res.status, 201);
  assert.equal(res.body.title, 'New');
  assert.equal(res.body.body, 'Fresh post.');
  assert.ok(res.body.id);
});

test('POST /posts returns 400 when a field is missing', async () => {
  const res = await request(app).post('/posts').send({ title: 'No body' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'title and body are required' });
});

test('POST /posts returns 400 when a field is not a non-empty string', async () => {
  const res = await request(app).post('/posts').send({ title: 123, body: '   ' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'title and body are required' });
});

test('PUT /posts/:id updates an existing post', async () => {
  const res = await request(app).put('/posts/1').send({ title: 'Edited' });
  assert.equal(res.status, 200);
  assert.equal(res.body.title, 'Edited');
  assert.equal(res.body.body, 'The first post.');
});

test('PUT /posts/:id returns 400 for a non-integer id', async () => {
  const res = await request(app).put('/posts/abc').send({ title: 'Edited' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'id must be an integer' });
});

test('PUT /posts/:id returns 400 when no fields are given', async () => {
  const res = await request(app).put('/posts/1').send({});
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'title or body is required' });
});

test('PUT /posts/:id returns 400 when a field is not a non-empty string', async () => {
  const res = await request(app).put('/posts/1').send({ body: null });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'body must be a non-empty string' });
});

test('PUT /posts/:id returns 404 for a missing post', async () => {
  const res = await request(app).put('/posts/999').send({ title: 'Nobody' });
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Post not found' });
});

test('DELETE /posts/:id removes an existing post', async () => {
  const res = await request(app).delete('/posts/1');
  assert.equal(res.status, 204);
  const after = await request(app).get('/posts/1');
  assert.equal(after.status, 404);
});

test('DELETE /posts/:id returns 400 for a non-integer id', async () => {
  const res = await request(app).delete('/posts/abc');
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { error: 'id must be an integer' });
});

test('DELETE /posts/:id returns 404 for a missing post', async () => {
  const res = await request(app).delete('/posts/999');
  assert.equal(res.status, 404);
  assert.deepEqual(res.body, { error: 'Post not found' });
});
