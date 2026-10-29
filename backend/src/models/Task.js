const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    // Every task belongs to exactly one user
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, default: '' },
    // When the task is scheduled to start / be worked on
    dateTime: { type: Date, default: Date.now },
    // When it has to be finished by
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, trim: true, default: 'General' },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
