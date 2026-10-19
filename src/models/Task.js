const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  description: { type: String, maxlength: 4000, default: "" },
  status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo", index: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  dueDate: { type: Date, default: null },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

taskSchema.index({ project: 1, status: 1, createdAt: -1 });
module.exports = mongoose.model("Task", taskSchema);
