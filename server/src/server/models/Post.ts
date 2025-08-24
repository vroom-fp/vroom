import { IMongoloquentSchema, IMongoloquentTimestamps, Model } from "mongoloquent";
import Trip, { ITrip } from "./Trip";
import User from "./User";

export interface IPost extends IMongoloquentSchema, IMongoloquentTimestamps {
  userId: string;
  tripId: string;
  caption: string;
  trip?: ITrip
}

export default class Post extends Model<IPost> {
  public static $schema: IPost;
  protected $collection: string = 'posts';

  public trip () {
    return this.hasOne(Trip)
  }

  public user () {
    return this.hasOne(User)
  }
}