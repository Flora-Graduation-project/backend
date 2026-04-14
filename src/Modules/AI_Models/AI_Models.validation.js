import Joi from "joi";

export const chatSchema = Joi.object({
  message: Joi.string().trim().min(2).max(1000).required().messages({
    "string.empty": "message can't be empty",
    "string.max": "message is too long",
    "any.required": "message is required",
  }),
});
