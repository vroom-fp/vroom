import { errorHandler } from "@/server/helpers/ErrorHandler";
import Post from "@/server/models/Post";
import Trip from "@/server/models/Trip";
import User from "@/server/models/User";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Bisa tambahkan filter, pagination, dsb jika perlu
    const posts = await Post.all();
    const postsWithTripAndUser = await Promise.all(posts.map(async post => {
      const trip = post.tripId
        ? await Trip.where('_id', new ObjectId(post.tripId)).first()
        : null;
      
      const user = post.userId
        ? await User.where('_id', new ObjectId(post.userId)).first()
        : null;
      
      // Hapus password dari user jika ada
      const userWithoutPassword = user ? (() => {
        const { password, ...rest } = user;
        return rest;
      })() : null;
      
      return { ...post, trip, user: userWithoutPassword };
    }));
    return Response.json({ posts: postsWithTripAndUser }, { status: 200 });
  } catch (err: unknown) {
    const { message, status } = errorHandler(err);
    return Response.json({ message }, { status });
  }
}