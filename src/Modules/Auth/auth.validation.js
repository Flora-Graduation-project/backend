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
    password: joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required",
    }),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
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

