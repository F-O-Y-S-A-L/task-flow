module.exports = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    return res.status(400).json({
      error: { message: "Validation failed", details: result.error.issues.map(i => ({
        path: i.path.join("."), message: i.message
      })) }
    });
  }
  req.validated = result.data;
  next();
};
