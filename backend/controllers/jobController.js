import Job from "../models/Job.js";

export const getAllJobs = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { visible: true };

    if (search) filter.title = { $regex: search, $options: "i" };
    if (category) filter.category = category;

    const jobs = await Job.find(filter)
      .populate("companyId", "name email image")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch jobs" });
  }
};
