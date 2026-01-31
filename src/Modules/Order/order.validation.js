import Joi from "joi";

export const confirmOrderSchema = Joi.object({
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