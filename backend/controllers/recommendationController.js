import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";

/**
 * AI-like Job Recommendation
 * Based on matching user skills with job title/category/level.
 */
export const getJobRecommendations = async (req, res) => {
  try {
    const user = req.userData;

    // 🧮 1. Fetch jobs that are visible and not yet applied by user
    const appliedJobs = await JobApplication.find({ userId: user._id }).distinct("jobId");
    const jobs = await Job.find({ visible: true, _id: { $nin: appliedJobs } }).populate(
      "companyId",
      "name image"
    );

    if (!user.skills?.length) {
      return res.status(200).json({
        success: true,
        message: "No skills found, showing latest jobs",
        recommendations: jobs.slice(-10),
      });
    }

    // 🧠 2. Compute match score for each job
    const recommendations = jobs
      .map((job) => {
        const jobText = `${job.title} ${job.category} ${job.level}`.toLowerCase();
        const matchedSkills = user.skills.filter((skill) =>
          jobText.includes(skill.toLowerCase())
        );
        const matchScore = Math.min(100, matchedSkills.length * 20);
        return { ...job._doc, matchScore };
      })
      .sort((a, b) => b.matchScore - a.matchScore || b.date - a.date) // sort by relevance & recency
      .slice(0, 10); // top 10 results

    res.json({
      success: true,
      message: "Recommended jobs fetched successfully",
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch recommendations" });
  }
};
