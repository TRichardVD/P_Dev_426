import mongoose from "mongoose";
const { Schema, Types } = mongoose;

// Schéma pour le site
const SiteSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String },
    description: { type: String },
    country: [{ type: String }],
    likes: [{ type: Types.ObjectId, ref: "User", default: [] }],
    comments: [
        {
            type: Types.ObjectId,
            ref: "Comment",
            default: [],
        },
    ],
    coordinates: {
        lat: { type: Number },
        lon: { type: Number },
    },
});

SiteSchema.methods.toggleLike = async function (userId) {
    const hasLiked = this.likes.includes(userId);
    if (hasLiked) {
        this.likes = this.likes.filter((id) => !id.equals(userId));
    } else {
        this.likes.push(userId);
    }
    await this.save();
    return this.likes.length;
};

SiteSchema.index({ name: "text", description: "text", country: "text" });
// Modèle Mongoose pour le site
const Site = mongoose.model("Site", SiteSchema);

export default Site;
