import { errorHandler } from "@/server/helpers/ErrorHandler";
import Post, { IPost } from "@/server/models/Post";
import Trip from "@/server/models/Trip";
import User from "@/server/models/User";
import { ObjectId } from "mongodb";
import { NextRequest } from "next/server";
import CustomError from "@/server/helpers/CustomError";
import cloudinary from "@/config/cloudinary";


export async function GET(_req: NextRequest) { // Tambah underscore untuk unused variable
  try {
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
        const { password: _password, ...rest } = user; // Tambah underscore untuk unused variable
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

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id') as string;
    if (!userId) throw new CustomError("Unauthorized", 401);

    const formData = await req.formData();
    const tripId = formData.get('tripId') as string;
    const caption = formData.get('caption') as string;
    const images = formData.getAll('image') as File[];

    if (!tripId) {
      throw new CustomError("tripId is required", 400);
    }

    const trip = await Trip.where('_id', new ObjectId(tripId)).first();
    if (!trip || trip.userId.toString() !== userId) {
      throw new CustomError("Trip not found or not owned by user", 404);
    }

    let imageUrls: string[] = [];

    if (images && images.length > 0) {
      const uploadPromises = images.map(async (image) => {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);

        return new Promise<{ secure_url: string }>((resolve, reject) => { // Specify return type
          cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "vroom-posts"
            },
            (error, uploadResult) => {
              if (error) return reject(error);
              return resolve(uploadResult as { secure_url: string }); // Type assertion
            }
          ).end(buffer);
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map(result => result.secure_url);
    }

    const postData: {
      userId: string;
      tripId: string;
      imageUrls?: string[];
      caption?: string;
    } = {
      userId,
      tripId,
      imageUrls
    };

    if (caption) postData.caption = caption;

    const post = await Post.create(postData);

    return Response.json({ message: "Post created", post }, { status: 201 });
  } catch (err: unknown) {
    const { message, status } = errorHandler(err);
    return Response.json({ message }, { status });
  }
}