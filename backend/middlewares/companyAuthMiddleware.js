import jwt from "jsonwebtoken";
import Company from "../models/Company.js";
import User from "../models/User.js";

const companyAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;
    if (!authHeader) {
      console.log("🚫 No Authorization header found");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    console.log("🟢 Received Token:", token ? "exists" : "missing");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🟢 Decoded Token:", decodedToken);

    let company = await Company.findById(decodedToken.id).select("-password");
    let user = null;

    if (!company) {
      user = await User.findById(decodedToken.id).select("-password");
    }

    if (!company && !user) {
      console.log("🚫 No company or user found with this token id");
      return res.status(401).json({ success: false, message: "Invalid token ID" });
    }

    req.companyData = company || user;
    req.role = company ? "company" : "user";
    console.log("✅ Auth Success | Role:", req.role);

    next();
  } catch (error) {
    console.error("🔴 Auth Middleware Error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please login again.",
    });
  }
};

export default companyAuthMiddleware;
