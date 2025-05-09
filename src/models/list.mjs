import mongoose from "mongoose";
import { type } from "os";
const { Schema, Types } = mongoose;

const listSchema = new Schema({
  name: { type: String },
  color: { type: String },
  sites: [{ type: Types.ObjectId, ref: "Site", default: [] }],
  user: { type: Types.ObjectId, ref: "user" },
});

const List = mongoose.model("List", listSchema);

export default List;
