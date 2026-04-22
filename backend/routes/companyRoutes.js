import express from "express";
import upload from "../src/utils/upload.js";
import companyAuthMiddleware from "../middlewares/companyAuthMiddleware.js";
import {
  registerCompany,
  loginCompany,
  postJob,
  getCompanyPostedAllJobs,
  getCompanyJobApplicants,
  changeStatus,
  fetchCompanyData,
  getShortliestedApplicants,
  closeJobApplications 
} from "../controllers/companyController.js";

const router = express.Router();

router.post("/register-company", upload.single("image"), registerCompany);
router.post("/login-company", loginCompany);
router.get("/company-data", companyAuthMiddleware, fetchCompanyData);
router.post("/post-job", companyAuthMiddleware, postJob);
router.get("/company-jobs", companyAuthMiddleware, getCompanyPostedAllJobs);
router.get("/view-applicants", companyAuthMiddleware, getCompanyJobApplicants);
router.get("/shortlist-applicants", companyAuthMiddleware, getShortliestedApplicants);
router.post("/change-status", companyAuthMiddleware, changeStatus);
// ✅ Close Job and All Its Applications
router.put("/close-job/:jobId", companyAuthMiddleware, closeJobApplications);

export default router;
