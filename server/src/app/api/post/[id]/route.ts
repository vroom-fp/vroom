import { errorHandler } from "@/server/helpers/ErrorHandler";
import Post from "@/server/models/Post";
import Trip from "@/server/models/Trip";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, context:  { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const post = await Post.where('_id', new ObjectId(id)).first();
    if (!post) {
      return Response.json({ message: "Post not found" }, { status: 404 });
    }
    // Ambil trip terkait
    const trip = post.tripId
      ? await Trip.where('_id', new ObjectId(post.tripId)).first()
      : null;
    return Response.json({ post: { ...post, trip } }, { status: 200 });
  } catch (err: unknown) {
    const { message, status } = errorHandler(err);
    return Response.json({ message }, { status});
  }
}