const router = require("express").Router();
const c = require("../controllers/project.controller");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

router.use(requireAuth);
router.get("/", validate(c.listSchema), c.list);
router.post("/", validate(c.createSchema), c.create);
router.get("/:projectId", validate(c.idSchema), c.get);
router.patch("/:projectId", validate(c.updateSchema), c.update);
router.delete("/:projectId", validate(c.idSchema), c.remove);
module.exports = router;
