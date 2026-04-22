import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import Company from "../models/Company.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import generateToken from "../src/utils/generateToken.js";
import Notification from "../models/Notification.js";

/** Register Company */
export const registerCompany = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const image = req.file;
    if (!name || !email || !password || !image)
      return res.json({ success: false, message: "All fields required" });

    if (await Company.findOne({ email }))
      return res.status(409).json({ success: false, message: "Company already exists" });

    const logo = await cloudinary.uploader.upload(image.path);

    const company = await Company.create({
      name,
      email,
      password,
      image: logo.secure_url,
    });

    const token = generateToken(company._id);
    res.status(201).json({ success: true, company, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

/** Login Company */
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const match = await bcrypt.compare(password, company.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid password" });

    const token = generateToken(company._id);
    res.json({ success: true, message: "Login successful", company, token });
  } catch {
    res.status(500).json({ success: false, message: "Login failed" });
  }
};


export const fetchCompanyData = async (req, res) => {
  try {
    const company = req.companyData;
    res.status(200).json({ success: true, companyData: company });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user data" });
  }
};


export const postJob = async (req, res) => {
  try {
    const { title, description, location, level, salary, category } = req.body;

    // 🔹 Validate required fields
    if (!title || !description || !location || !level || !salary || !category) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (title, description, location, level, salary, category).",
      });
    }

    // 🔹 Create job in database
    const job = await Job.create({
      title,
      description,
      location,
      level,
      salary,
      category,
      companyId: req.companyData._id, // from companyAuthMiddleware
      date: Date.now(),
      visible: true,
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully!",
      job,
    });
  } catch (error) {
    console.error("❌ Job Posting Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Job posting failed. Please try again.",
    });
  }
};

/** 5️⃣ Get all jobs posted by the logged-in company + applicant analytics */
export const getCompanyPostedAllJobs = async (req, res) => {
  try {
    const companyId = req.companyData._id; // from auth middleware

    // 🔹 Fetch all jobs for this company
    const jobs = await Job.find({ companyId }).select("title description salary location");

    if (!jobs.length) {
      return res.status(200).json({
        success: true,
        message: "No jobs found for this company.",
        jobs: [],
      });
    }
    console.log("jobs", jobs);
    
    // 🔹 Attach applicant count for each job
    const jobsWithApplicants = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.countDocuments({ jobId: job._id });
        return {
          id:job._id,
          title: job.title,
          location: job.location,
          applicants,
        };
      })
    );

    res.status(200).json({
      success: true,
      jobs: jobsWithApplicants,
    });
  } catch (error) {
    console.error("❌ Error in getCompanyPostedAllJobs:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch company jobs",
    });
  }
};


/** ✅ Close Job + Applications + Send Notifications */
export const closeJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required.",
      });
    }

    // ✅ 1. Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // ✅ 2. Update all related applications to 'Close'
    const applications = await JobApplication.find({ jobId });

    if (!applications.length) {
      // Still close job even if no applicants
      job.status = "Close";
      await job.save();
      return res.json({
        success: true,
        message: "Job closed. No applicants to notify.",
      });
    }

    await JobApplication.updateMany({ jobId }, { $set: { status: "Close" } });

    // ✅ 3. Update the Job status to 'Close'
    job.status = "Close";
    await job.save();

    // ✅ 4. Send notifications to all applicants
    const notifications = applications.map((app) => ({
      userId: app.userId,
      title: "Job Closed",
      message: `The job "${job.title}" has been closed by the company.`,
      type: "Job",
    }));

    await Notification.insertMany(notifications);

    res.json({
      success: true,
      message: `Job and ${applications.length} application(s) closed successfully.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to close job and notify applicants.",
      error: error.message,
    });
  }
};


/** Get Pending Applicants */
export const getCompanyJobApplicants = async (req, res) => {
  try {
    const applicants = await JobApplication.find({
      companyId: req.companyData._id,
      status: "Pending", // ✅ filter by status
    })
      .populate("userId", "name image resume skills bio")
      .populate("jobId", "title location level category");

    res.json({ success: true, applicants });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch pending applicants" });
  }
};


/** Get Shortlisted or Accepted Applicants */
export const getShortliestedApplicants = async (req, res) => {
  try {
    const applicants = await JobApplication.find({
      companyId: req.companyData._id,
      status: { $in: ["Shortlisted", "Accepted"] }, // ✅ match either status
    })
      .populate("userId", "name image resume skills bio")
      .populate("jobId", "title location level category");

    res.json({ success: true, applicants });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch shortlisted or accepted applicants",
      error: error.message,
    });
  }
};



/** ✅ Change Applicant Status (Pending → Shortlisted → Accepted/Rejected) */
export const changeStatus = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Application ID and status are required.",
      });
    }

    const validStatuses = ["Pending", "Shortlisted", "Rejected", "Accepted", "Close"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const updated = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("jobId", "title")
      .populate("companyId", "name email image");

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Job application not found.",
      });
    }

    // 🔔 Create a notification for the user
    await Notification.create({
      userId: updated.userId._id,
      companyId: updated.companyId._id,
      title: `Application ${status}`,
      message: `Your application for "${updated.jobId.title}" has been marked as ${status}.`,
      type: "Application",
    });

    res.status(200).json({
      success: true,
      message: `Status updated to '${status}' and notification sent.`,
      updated,
    });
  } catch (error) {
    console.error("❌ Error changing applicant status:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to change applicant status.",
    });
  }
};