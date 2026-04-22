import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 3 },
    image: { type: String, required: true },
    resume: { type: String, default: "" },          // original Cloudinary PDF URL
    optimizedCv: { type: String, default: "" },     // AI-generated optimized CV (markdown)
    skills: [{ type: String, trim: true }],
    bio: { type: String, trim: true },
    role: {
      type: String,
      enum: ["TalentSeeker", "TalentFinder"],
      default: "TalentSeeker",
    },
  },
  { timestamps: true }
);

// 🔒 Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
