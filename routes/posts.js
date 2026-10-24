const express = require('express');
const store = require('../db/store');

const router = express.Router();

const FIELDS = ['title', 'body'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

// GET /posts — list all posts.
router.get('/', (req, res) => {
  res.json(store.listPosts());
});

// GET /posts/:id — fetch one post, or 404 if it doesn't exist.
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'id must be an integer' });
  }
  const post = store.getPost(id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json(post);
});

// POST /posts — create a post. Requires title and body.
router.post('/', (req, res) => {
  const { title, body } = req.body;
  if (!isNonEmptyString(title) || !isNonEmptyString(body)) {
    return res.status(400).json({ error: 'title and body are required' });
  }
  const post = store.createPost({ title, body });
  return res.status(201).json(post);
});

// PUT /posts/:id — update an existing post.
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'id must be an integer' });
  }
  const { title, body } = req.body;
  if (title === undefined && body === undefined) {
    return res.status(400).json({ error: 'title or body is required' });
  }
  const invalid = FIELDS.find(
    (field) => req.body[field] !== undefined && !isNonEmptyString(req.body[field]),
  );
  if (invalid) {
    return res.status(400).json({ error: `${invalid} must be a non-empty string` });
  }
  const post = store.updatePost(id, { title, body });
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json(post);
});

// DELETE /posts/:id — remove a post, or 404 if it doesn't exist.
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'id must be an integer' });
  }
  const removed = store.deletePost(id);
  if (!removed) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.status(204).end();
});

module.exports = router;
