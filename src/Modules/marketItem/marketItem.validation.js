import Joi from "joi";

export const MarketItemSchema = Joi.object({
  image: Joi.string().uri().required().messages({
    "any.required": "Item image is required",
    "string.empty": "Item image cannot be empty",
    "string.uri": "Item image must be a valid URL",
  }),

  name: Joi.string().min(2).required().messages({
    "any.required": "Item name is required",
    "string.empty": "Item name cannot be empty",
    "string.min": "Item name must be at least 2 characters",
  }),

  price: Joi.number().positive().required().messages({
    "any.required": "Price is required",
    "number.base": "Price must be a number",
    "number.positive": "Price must be greater than 0",
  }),

  quantity: Joi.number().integer().min(1).required().messages({
    "any.required": "Quantity is required",
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
  }),

  subtitle: Joi.string().min(3).required().messages({
    "any.required": "Subtitle is required",
    "string.empty": "Subtitle cannot be empty",
    "string.min": "Subtitle must be at least 3 characters",
  }),

  description: Joi.string().min(10).required().messages({
    "any.required": "Description is required",
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least 10 characters",
  }),

  type: Joi.string().valid("indoor", "outdoor").required().messages({
    "any.required": "Type is required",
    "any.only": "Type must be either indoor or outdoor",
    "string.empty": "Type cannot be empty",
  }),
});
