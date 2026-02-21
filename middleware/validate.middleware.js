import { ZodError } from "zod";

/**
 * Zod schema validator middleware for Express
 * @param {ZodSchema} schema - The Zod schema to validate the request body
 * @param {"body" | "query" | "params"} [source="body"] - Where to pull the data from
 * @returns {Function} Express middleware
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    try {
      const data = req[source];
      const parsed = schema.parse(data);

      // If the source is body, query, or params, update the corresponding request object
      if (source === "body") {
        req.body = parsed;
      } else if (source === "params") {
        req.params = parsed;
      } else if (source === "query") {
        Object.assign(req.query, parsed);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {        
        // Map the errors to a custom format
        const formattedErrors = error.errors ? error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        })) : [];

        return res.status(400).json({
          status: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      return res.status(500).json({
        status: false,
        message: "Unexpected validation error",
        error: error.message,
      });
    }
  };
};