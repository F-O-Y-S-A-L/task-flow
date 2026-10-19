const Task = require("../models/Task");
const Project = require("../models/Project");

async function listTasks(userId, projectId, query) {
  const project = await Project.findOne({ _id: projectId, owner: userId }).lean();
  if (!project) return null;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const filter = { project: projectId };
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.search) filter.title = { $regex: escapeRegex(query.search), $options: "i" };
  const [items, total] = await Promise.all([
    Task.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Task.countDocuments(filter)
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
async function createTask(userId, projectId, data) {
  const project = await Project.findOne({ _id: projectId, owner: userId });
  if (!project) return null;
  return Task.create({ ...data, project: projectId, createdBy: userId });
}
async function updateTask(userId, projectId, taskId, data) {
  const project = await Project.findOne({ _id: projectId, owner: userId });
  if (!project) return { missingProject: true };
  const task = await Task.findOneAndUpdate({ _id: taskId, project: projectId }, data, { new: true, runValidators: true });
  return task;
}
async function deleteTask(userId, projectId, taskId) {
  const project = await Project.findOne({ _id: projectId, owner: userId });
  if (!project) return { missingProject: true };
  return Task.findOneAndDelete({ _id: taskId, project: projectId });
}
module.exports = { listTasks, createTask, updateTask, deleteTask };
