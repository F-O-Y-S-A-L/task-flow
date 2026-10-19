const { z } = require("zod");
const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/task.service");
const id = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");
const statuses = ["todo", "in_progress", "done"];
const priorities = ["low", "medium", "high"];
const paramsSchema = z.object({ projectId: id });
const listSchema = z.object({ body: z.object({}).optional(), params: paramsSchema, query: z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  status: z.enum(statuses).optional(),
  priority: z.enum(priorities).optional(),
  search: z.string().max(100).optional()
}) });
const createSchema = z.object({ body: z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().max(4000).optional(),
  status: z.enum(statuses).optional(),
  priority: z.enum(priorities).optional(),
  dueDate: z.coerce.date().optional(),
  assignee: id.optional()
}), query: z.object({}), params: paramsSchema });
const taskParams = z.object({ projectId: id, taskId: id });
const taskIdSchema = z.object({ body: z.object({}).optional(), query: z.object({}), params: taskParams });
const updateSchema = z.object({ body: z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().max(4000).optional(),
  status: z.enum(statuses).optional(),
  priority: z.enum(priorities).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  assignee: id.nullable().optional()
}).refine(v => Object.keys(v).length > 0, "At least one field is required"), query: z.object({}), params: taskParams });

const list = asyncHandler(async (req, res) => {
  const result = await service.listTasks(req.user.id, req.params.projectId, req.validated.query);
  if (!result) return res.status(404).json({ error: { message: "Project not found" } });
  res.json({ data: result });
});
const create = asyncHandler(async (req, res) => {
  const task = await service.createTask(req.user.id, req.params.projectId, req.validated.body);
  if (!task) return res.status(404).json({ error: { message: "Project not found" } });
  res.status(201).json({ data: task });
});
const update = asyncHandler(async (req, res) => {
  const result = await service.updateTask(req.user.id, req.params.projectId, req.params.taskId, req.validated.body);
  if (result?.missingProject) return res.status(404).json({ error: { message: "Project not found" } });
  if (!result) return res.status(404).json({ error: { message: "Task not found" } });
  res.json({ data: result });
});
const remove = asyncHandler(async (req, res) => {
  const result = await service.deleteTask(req.user.id, req.params.projectId, req.params.taskId);
  if (result?.missingProject) return res.status(404).json({ error: { message: "Project not found" } });
  if (!result) return res.status(404).json({ error: { message: "Task not found" } });
  res.status(204).send();
});
module.exports = { listSchema, createSchema, taskIdSchema, updateSchema, list, create, update, remove };
