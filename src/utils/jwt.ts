import jwt from "jsonwebtoken"
import Types  from "mongoose"

type UserPayLoad = {
  id: Types.ObjectId
}

export function generateJWT(payload: UserPayLoad) { 
  const token = jwt.sign(payload, process.env.JWT_SECRET, { 
      expiresIn: "1d" 
    })
  return token
}
