import { BAD_REQUEST } from "../Utils/statusCodes.js";


// export const validate = (schema) => {
//   return (req, res, next) => {
//     const copyreqData = {...req.body,...req.params,...req.query};
//     const result = schema.validate(copyreqData, { abortEarly: false });
//     if (result.error) {
//         const errorArray = result.error.details.map((detail) => detail.message);
//      const err = new Error(errorArray.join(", "));
//       err.statusCode  = BAD_REQUEST; 
//       return next(err);
//     }
//     return next();
//   };
// };

export const validate = (schema) => {
  return (req, res, next) => {
    // بنجمع البيانات من كل الحتت، ولو فيه file بنحطه تحت اسم image
    const copyreqData = {
      ...req.body,
      ...req.params,
      ...req.query,
      ...(req.file ? { image: req.file } : {}) // لو فيه ملف، ضيفه للأوبجكت باسم image
    };

    const result = schema.validate(copyreqData, { abortEarly: false });
    
    if (result.error) {
      const errorArray = result.error.details.map((detail) => detail.message);
      const err = new Error(errorArray.join(", "));
      err.statusCode = BAD_REQUEST; 
      return next(err);
    }
    return next();
  };
};
