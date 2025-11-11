import jwt from "jsonwebtoken"

export const generateToken = async (payload)=>{
const token = jwt.sign(payload,process.env.JWT_KEY,{expiresIn:"5m"});
return token
}