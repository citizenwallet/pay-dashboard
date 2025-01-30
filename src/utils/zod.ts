import { z } from 'zod';

/**
 * Validate data against a schema
 *
 * @param schema
 * @param data
 * @param t
 */
export const validate = async (
  schema: z.ZodTypeAny,
  data: object,
  t: (key: string, values?: Record<string, string | number>) => string
) => {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => ({
          path: err.path.join('.'),
          message: t(err.message)
        }))
      };
    }
    throw error; // throw if it's not a zod error
  }
};
