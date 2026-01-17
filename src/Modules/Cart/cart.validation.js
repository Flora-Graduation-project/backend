import joi from "joi";

export const AddToCartSchema = joi.object({
    plantId: joi.string().required().messages({
        "any.required": "Plant ID is required",
        "string.base": "Plant ID must be a string"
    }),
    quantity: joi.number().integer().min(1).default(1).messages({
        "number.base": "Quantity must be a number",
        "number.integer": "Quantity must be an integer",
        "number.min": "Quantity must be at least 1",
    }),
});

export const updateCartItemSchema = joi.object({
    plantId: joi.string().required().messages({
        "any.required": "Plant ID is required", 
        "string.base": "Plant ID must be a string"
    }),
    quantity: joi.number().integer().min(1).required().messages({
         "number.base": "Quantity must be a number",
        "number.integer": "Quantity must be an integer",
        "number.min": "Quantity must be at least 1",
    }),
});