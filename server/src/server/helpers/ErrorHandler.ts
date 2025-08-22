import { ZodError } from "zod"
import CustomError from "./CustomError"

export function errorHandler(err: unknown): { message: string, status: number } {
  console.log(err)
  if (err instanceof ZodError) {
    const errors = err.issues
    const message = errors.map(el => `${el.path}: ${el.message}`).toString()
    return { message, status: 400 }
  } else if (err instanceof CustomError) {
    const { message, status } = err
    return { message, status }
  } else {
    return { message: "Internal Server Error", status: 500 }
  }

}
