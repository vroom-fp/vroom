// import { errorHandler } from "@/server/helpers/ErrorHandler";
// import CustomError from "@/server/helpers/CustomError";
// import Trip from "@/server/models/Trip";
// import { NextRequest } from "next/server";
// import { ObjectId } from "mongodb";

// export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const userId = req.headers.get('x-user-id') as string;
//     if (!userId) {
//       throw new CustomError("Unauthorized", 401);
//     }

//     const body = await req.json();
//     const { lat, lng } = body;

//     if (!lat || !lng) {
//       throw new CustomError("Latitude and longitude are required", 400);
//     }

//     const trip = await Trip.findOne({
//       _id: new ObjectId(params.id),
//       userId: new ObjectId(userId)
//     });

//     if (!trip) {
//       throw new CustomError("Trip not found", 404);
//     }

//     // Add new point to path
//     trip.path.push({
//       lat,
//       lng,
//       timestamp: new Date()
//     });

//     await trip.save();

//     return Response.json({ 
//       message: "Path updated successfully",
//       trip 
//     }, { status: 200 });

//   } catch (err: unknown) {
//     const { message, status } = errorHandler(err);
//     return Response.json({ message }, { status });
//   }
// }