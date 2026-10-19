const router = require("express").Router();
const c = require("../controllers/task.controller");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);
router.get("/projects/:projectId/tasks", validate(c.listSchema), c.list);
router.post("/projects/:projectId/tasks", validate(c.createSchema), c.create);
router.patch("/projects/:projectId/tasks/:taskId", validate(c.updateSchema), c.update);
router.delete("/projects/:projectId/tasks/:taskId", validate(c.taskIdSchema), c.remove);
module.exports = router;
