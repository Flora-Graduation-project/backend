import { BAD_REQUEST } from "../Utils/statusCodes.js";


export const validate = (schema) => {
  return (req, res, next) => {
    const copyreqData = {...req.body,...req.params,...req.query};
    const result = schema.validate(copyreqData, { abortEarly: false });
    if (result.error) {
        const errorArray = result.error.details.map((detail) => detail.message);
     return next(new Error(errorArray,{cause:BAD_REQUEST}) );
    }
    return next();
  };
};
