const { z } = require("zod");
const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/project.service");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");
const listSchema = z.object({ body: z.object({}).optional(), params: z.object({}), query: z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional()
}) });
const createSchema = z.object({ body: z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().max(2000).optional()
}), query: z.object({}), params: z.object({}) });
const idSchema = z.object({ body: z.object({}).optional(), query: z.object({}), params: z.object({ projectId: objectId }) });
const updateSchema = z.object({ body: z.object({
  name: z.string().trim().min(2).max(120).optional(),
  description: z.string().max(2000).optional()
}).refine(v => Object.keys(v).length > 0, "At least one field is required"), query: z.object({}), params: z.object({ projectId: objectId }) });

const list = asyncHandler(async (req, res) => res.json({ data: await service.listProjects(req.user.id, req.validated.query) }));
const create = asyncHandler(async (req, res) => res.status(201).json({ data: await service.createProject(req.user.id, req.validated.body) }));
const get = asyncHandler(async (req, res) => {
  const project = await service.getOwnedProject(req.user.id, req.params.projectId);
  if (!project) return res.status(404).json({ error: { message: "Project not found" } });
  res.json({ data: project });
});
const update = asyncHandler(async (req, res) => {
  const project = await service.updateProject(req.user.id, req.params.projectId, req.validated.body);
  if (!project) return res.status(404).json({ error: { message: "Project not found" } });
  res.json({ data: project });
});
const remove = asyncHandler(async (req, res) => {
  const project = await service.deleteProject(req.user.id, req.params.projectId);
  if (!project) return res.status(404).json({ error: { message: "Project not found" } });
  res.status(204).send();
});
module.exports = { listSchema, createSchema, idSchema, updateSchema, list, create, get, update, remove };
