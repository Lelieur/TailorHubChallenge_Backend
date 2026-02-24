import { Schema, model } from "mongoose";

const reviewSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Add your username"],
    },
    date: {
      type: String,
      required: [true, "Add a date"],
    },
    rating: {
      type: Number,
      required: [true, "Add your rating"],
    },
    comments: {
      type: String,
      required: [true, "Add your comments"],
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  },
  { timestamps: true }
);

const Review = model("Review", reviewSchema);

export default Review;
