import mongoose from "mongoose";

const Schema = mongoose.Schema;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  Type: {
    type: String,
    enum: [
      "Workshops",
      "Talks",
      "Workshops & Talks",
      "Meetups",
      "Networking",
      "Fun",
      "Tech",
      "Other",
    ],
    required: true,
    default: "Other",
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  club: {
    type: Schema.Types.ObjectId,
    ref: "Club",
  },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: "Club",
    },
  ],
  regiteredUsers: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
