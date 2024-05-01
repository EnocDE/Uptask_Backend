import bcrypt from "bcrypt"
import { IUser } from "../models/User"

export async function hashPassword(password: IUser['password']) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}

export async function checkPassword(enteredPassword: string, storedHash: string) {
  return await bcrypt.compare(enteredPassword, storedHash)
}