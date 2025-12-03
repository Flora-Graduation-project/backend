import joi from "joi";

export const editUserSchema = joi.object({
  name: joi.string().min(3).max(20).messages({
    "string.base": "Name must be a string",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name must be less than or equal to 20 characters",
  }),
});
