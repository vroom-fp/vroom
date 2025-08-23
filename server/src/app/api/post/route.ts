import { errorHandler } from "@/server/helpers/ErrorHandler";
import CustomError from "@/server/helpers/CustomError";
import Post from "@/server/models/Post";
import Trip from "@/server/models/Trip";
import { NextRequest } from "next/server";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') as string;
    if (!userId) throw new CustomError("Unauthorized", 401);

    const body = await req.json();
    const { tripId, caption } = body;

    if (!tripId || !caption) {
      throw new CustomError("tripId and caption are required", 400);
    }

    // Pastikan trip ada dan milik user
    const trip = await Trip.where('_id', new ObjectId(tripId)).first();
    if (!trip || trip.userId !== userId) {
      throw new CustomError("Trip not found or not owned by user", 404);
    }

    const post = await Post.create({
      userId,
      tripId,
      caption
    });

    return Response.json({ message: "Post created", post }, { status: 201 });
  } catch (err: unknown) {
    const { message, status } = errorHandler(err);
    return Response.json({ message }, { status });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Bisa tambahkan filter, pagination, dsb jika perlu
    const posts = await Post.all();
    const postsWithTrip = await Promise.all(posts.map(async post => {
      const trip = post.tripId
        ? await Trip.where('_id', new ObjectId(post.tripId)).first()
        : null;
      return { ...post, trip };
    }));
    return Response.json({ posts: postsWithTrip }, { status: 200 });
    return Response.json({ posts }, { status: 200 });
  } catch (err: unknown) {
    const { message, status } = errorHandler(err);
    return Response.json({ message }, { status });
  }
}