import Joi from "joi";

export const confirmOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        plant: Joi.string().required().messages({
          "any.required": "Plant id is required",
          "string.empty": "Plant id cannot be empty",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "any.required": "Quantity is required",
          "number.base": "Quantity must be a number",
          "number.integer": "Quantity must be an integer",
          "number.min": "Quantity must be at least 1",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "any.required": "Items are required",
      "array.min": "Order must contain at least one item",
    }),

  address: Joi.object({
    fullName: Joi.string().required().messages({
      "any.required": "Full name is required",
    }),
    phone: Joi.string().required().messages({
      "any.required": "Phone number is required",
    }),
    country: Joi.string().required().messages({
      "any.required": "Country is required",
    }),
    governorate: Joi.string().required().messages({
      "any.required": "Governorate is required",
    }),
    fullAddress: Joi.string().required().messages({
      "any.required": "Full address is required",
    }),
    zipCode: Joi.string().required().messages({
      "any.required": "Zip code is required",
    }),
  })
    .required()
    .messages({
      "any.required": "Address is required",
    }),

  paymentMethod: Joi.string()
    .valid("visa", "cash", "wallet")
    .required()
    .messages({
      "any.required": "Payment method is required",
      "any.only": "Payment method must be visa, cash or wallet",
    }),
}); 
