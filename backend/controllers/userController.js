import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import User from "../models/User.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import generateToken from "../src/utils/generateToken.js";

/** -------------------------------
 *  REGISTER USER (Talent Seeker)
 *  ------------------------------- */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, skills, bio } = req.body;
    const imageFile = req.file;

    if (!name || !email || !password || !imageFile) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.json({ success: false, message: "User already exists" });

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    // ⚠️ Don’t hash password here, let model pre-save do it
    const user = await User.create({
      name,
      email,
      password, // plain password
      image: imageUpload.secure_url,
      skills: skills ? skills.split(",") : [],
      bio: bio || "",
    });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: "Registration successful",
      userData: user,
      token,
    });
  } catch (error) {
    console.error("User registration failed:", error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};


/** -------------------------------
 *  LOGIN USER
 *  ------------------------------- */
export const loginUser = async (req, res) => {
  try {

    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

   

    const match = await bcrypt.compare(password, user.password);
 

    if (!match)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({ success: true, message: "Login successful", userData: user, token });

  } catch (error) {
    console.error("🔴 Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

/** -------------------------------
 *  FETCH USER PROFILE DATA
 *  ------------------------------- */
export const fetchUserData = async (req, res) => {
  try {
    const user = req.userData;
    res.status(200).json({ success: true, userData: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user data" });
  }
};

/** -------------------------------
 *  APPLY FOR A JOB
 *  ------------------------------- */
export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.userData._id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });

    const isApplied = await JobApplication.findOne({ userId, jobId });
    if (isApplied)
      return res.status(409).json({ success: false, message: "Already applied to this job" });

    const matchScore = calculateMatchScore(req.userData.skills, job.category);

    const application = await JobApplication.create({
      userId,
      companyId: job.companyId,
      jobId,
      status: "Pending",
      date: Date.now(),
      matchScore,
    });

    // Update analytics on Job
    job.applicantsCount = (job.applicantsCount || 0) + 1;
    await job.save();

    res.status(201).json({ success: true, message: "Job applied successfully", application });
  } catch (error) {
    console.error("Job application error:", error);
    res.status(500).json({ success: false, message: "Application failed" });
  }
};

// Simple AI-like match scoring based on skill/category keywords
function calculateMatchScore(userSkills = [], jobCategory = "") {
  const normalized = jobCategory.toLowerCase();
  const matched = userSkills.filter((s) => normalized.includes(s.toLowerCase()));
  return Math.min(100, matched.length * 20);
}

/** -------------------------------
 *  GET USER JOB APPLICATIONS
 *  ------------------------------- */
export const getUserAppliedJobs = async (req, res) => {
  try {
    const applications = await JobApplication.find({ userId: req.userData._id })
      .populate("companyId", "name email image")
      .populate("jobId", "title location category level salary");

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

/** -------------------------------
 *  UPLOAD RESUME
 *  ------------------------------- */
export const uploadResume = async (req, res) => {
  try {
    const userId = req.userData._id;
    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: "Resume file required" });

    const uploaded = await cloudinary.uploader.upload(file.path);
    const user = await User.findByIdAndUpdate(userId, { resume: uploaded.secure_url }, { new: true });

    res.json({ success: true, message: "Resume uploaded", resumeUrl: user.resume });
  } catch (error) {
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    // Fetch all users except passwords
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    if (!users.length) {
      return res.status(200).json({
        success: true,
        message: "No users found in the system.",
        users: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "All registered users fetched successfully.",
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
};