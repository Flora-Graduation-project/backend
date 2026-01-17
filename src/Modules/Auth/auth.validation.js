import joi from "joi";

export const signUpSchema = joi
  .object({
    name: joi.string().min(3).max(20).required().messages({
      "string.base": "Name must be a string",
      "string.empty": "Name is required",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name must be less than or equal to 20 characters",
      "any.required": "Name is required",
    }),
    email: joi.string().email().required().messages({
      "string.email": "Email must be a valid email",
      "string.empty": "Email is required",
    }),
    password: joi.string().min(10).required().messages({
      "string.min": "Password must be at least 10 characters",
      "any.required": "Password is required",
    }),
    confirmPassword: joi
      .string()
      .valid(joi.ref("password"))
      .required()
      .messages({
        "any.only": "Confirm password must match password",
        "any.required": "Confirm password is required",
      }),
  })
  .required();

export const logInSchema = joi
  .object({
    email: joi.string().email().required().messages({
      "string.email": "Email must be a valid email",
      "string.empty": "Email is required",
    }),
    password: joi.string().required().messages({
      "any.required": "Password is required",
    }),
  })
  .required();

export const resetPasswordSchema = joi
  .object({
    newPassword: joi.string().min(10).required().messages({
      "any.required": "newPassword is required",
    }),
    confirmPassword: joi
      .string()
      .valid(joi.ref("newPassword"))
      .required()
      .messages({
        "any.only": "Confirm password must match newPassword",
        "any.required": "Confirm password is required",
      }),
  })
  .required();
