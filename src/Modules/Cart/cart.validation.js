import joi from "joi";

const objectId = joi
  .string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "{{#label}} must be a valid ObjectId",
  });

export const AddToCartSchema = joi.object({
  itemId: objectId.required().messages({
    "any.required": "Item ID is required",
    "string.base": "Item ID must be a string",
  }),
  quantity: joi.number().integer().min(1).default(1).messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
  }),
});

export const updateCartItemSchema = joi.object({
  itemId: objectId.required().messages({
    "any.required": "Item ID is required",
    "string.base": "Item ID must be a string",
  }),
  quantity: joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
  }),
});

export const removeItemSchema = joi.object({
  itemId: objectId.required().messages({
    "any.required": "Item ID is required",
    "string.base": "Item ID must be a string",
  }),
});
