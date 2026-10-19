const Project = require("../models/Project");
const Task = require("../models/Task");
const redis = require("../config/redis");

const cacheKey = (userId, query) => `projects:${userId}:${JSON.stringify(query)}`;
async function listProjects(userId, query) {
  const key = cacheKey(userId, query);
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const filter = { owner: userId };
  const [items, total] = await Promise.all([
    Project.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Project.countDocuments(filter)
  ]);
  const result = { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  await redis.set(key, JSON.stringify(result), "EX", 60);
  return result;
}
async function createProject(userId, data) {
  const project = await Project.create({ ...data, owner: userId });
  await invalidateProjectCache(userId);
  return project;
}
async function getOwnedProject(userId, projectId) {
  return Project.findOne({ _id: projectId, owner: userId });
}
async function updateProject(userId, projectId, data) {
  const project = await Project.findOneAndUpdate({ _id: projectId, owner: userId }, data, { new: true, runValidators: true });
  if (project) await invalidateProjectCache(userId);
  return project;
}
async function deleteProject(userId, projectId) {
  const project = await Project.findOneAndDelete({ _id: projectId, owner: userId });
  if (project) {
    await Task.deleteMany({ project: projectId });
    await invalidateProjectCache(userId);
  }
  return project;
}
async function invalidateProjectCache(userId) {
  const keys = await redis.keys(`projects:${userId}:*`);
  if (keys.length) await redis.del(...keys);
}
module.exports = { listProjects, createProject, getOwnedProject, updateProject, deleteProject };
