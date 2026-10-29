const express = require('express');
const Task = require('../models/Task');
const protect = require('../middleware/auth');

const router = express.Router();

// Everything below needs a logged-in user
router.use(protect);

// Only these fields can be set from the outside
const EDITABLE = ['title', 'description', 'dateTime', 'deadline', 'priority', 'category'];

function pickFields(body) {
  const data = {};
  EDITABLE.forEach((key) => {
    if (body[key] !== undefined) data[key] = body[key];
  });
  return data;
}

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ deadline: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not load your tasks.' });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const data = pickFields(req.body);
    if (!data.title || !data.title.trim()) {
      return res.status(400).json({ message: 'A task needs a title.' });
    }
    if (!data.deadline) {
      return res.status(400).json({ message: 'Please set a deadline.' });
    }
    const task = await Task.create({ ...data, user: req.user._id });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Could not create the task.' });
  }
});

// PATCH /api/tasks/:id  - edit task details
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      pickFields(req.body),
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Could not update the task.' });
  }
});

// PATCH /api/tasks/:id/toggle  - flip completed on/off
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: 'Could not update the task.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ id: req.params.id });
  } catch (err) {
    res.status(400).json({ message: 'Could not delete the task.' });
  }
});

module.exports = router;
