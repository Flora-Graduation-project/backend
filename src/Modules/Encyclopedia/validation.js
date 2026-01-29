import joi from "joi";

const objectId = joi
  .string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "id must be a valid ObjectId",
  });

export const checkId = joi.object({
  id: objectId
});