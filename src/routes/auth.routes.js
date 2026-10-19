const router = require("express").Router();
const c = require("../controllers/auth.controller");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");

router.post("/register", validate(c.registerSchema), c.register);
router.post("/login", validate(c.loginSchema), c.login);
router.post("/refresh", validate(c.refreshSchema), c.refresh);
router.post("/logout", requireAuth, c.logout);
router.get("/me", requireAuth, c.me);
module.exports = router;
