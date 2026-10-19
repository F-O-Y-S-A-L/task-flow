const { z } = require("zod");
const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const registerSchema = z.object({ body: z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().transform(v => v.toLowerCase()),
  password: z.string().min(10).max(128)
}), query: z.object({}), params: z.object({}) });
const loginSchema = z.object({ body: z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(1).max(128)
}), query: z.object({}), params: z.object({}) });
const refreshSchema = z.object({ body: z.object({ refreshToken: z.string().min(1) }), query: z.object({}), params: z.object({}) });

const register = asyncHandler(async (req, res) => res.status(201).json({ data: await authService.register(req.validated.body) }));
const login = asyncHandler(async (req, res) => res.json({ data: await authService.login(req.validated.body) }));
const refresh = asyncHandler(async (req, res) => res.json({ data: await authService.refresh(req.validated.body.refreshToken) }));
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.status(204).send();
});
const me = asyncHandler(async (req, res) => res.json({ data: authService.publicUser(req.user) }));

module.exports = { registerSchema, loginSchema, refreshSchema, register, login, refresh, logout, me };
