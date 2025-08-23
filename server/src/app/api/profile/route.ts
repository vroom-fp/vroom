import { errorHandler } from "@/server/helpers/ErrorHandler"
import User from "@/server/models/User"
import { ObjectId } from "mongodb"
import { NextRequest } from "next/server"

export async function GET (req: NextRequest) {
  try {
    const id = req.headers.get('x-user-id') as string

    const user = await User.where('_id', new ObjectId(id)).first()
    
    return Response.json({user}, {status: 200})
  } catch (err : unknown) {
      const { message, status } = errorHandler(err)
      return Response.json({ message }, { status })
  }
}