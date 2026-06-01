import mongoose from "mongoose"

const WaitlistSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  source: { type: String, default: "website" }, // website, instagram, whatsapp
  position: { type: Number }, // queue position
  earlyAccess: { type: Boolean, default: false }, // first 100 get perks
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Waitlist || mongoose.model("Waitlist", WaitlistSchema)
