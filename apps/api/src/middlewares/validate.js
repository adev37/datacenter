export const validate = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues?.[0];
    const msg = issue?.message || "Validation failed";
    return next(Object.assign(new Error(msg), { status: 400 }));
  }

  const { body, query, params } = parsed.data;
  if (body) req.body = body;
  if (query) req.query = query;
  if (params) req.params = params;
  next();
};

// Optional helpers if you ever want them:
export const validateBody = (schema) =>
  validate({ safeParse: (i) => schema.safeParse({ body: i.body }) });
export const validateQuery = (schema) =>
  validate({ safeParse: (i) => schema.safeParse({ query: i.query }) });
export const validateParams = (schema) =>
  validate({ safeParse: (i) => schema.safeParse({ params: i.params }) });
