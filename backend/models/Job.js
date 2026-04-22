import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    level: {
      type: String,
      required: true,
    },
    description: { type: String, required: true },
    salary: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
    },
    tags: [{ type: String, trim: true }],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    date: { type: Number, required: true },
    visible: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;
