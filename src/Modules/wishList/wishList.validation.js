import joi from "joi";

const objectId = joi
  .string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "{{#label}} must be a valid ObjectId",
  });

export const AddOrRemoveFromWishList = joi.object({
  itemId: objectId.required().messages({
    "any.required": "Item ID is required",
    "string.base": "Item ID must be a string",
  })
});