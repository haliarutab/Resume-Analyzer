import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Company from "../models/Company.js";

const hybridAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.token;
    if (!authHeader)
      return res.status(401).json({ success: false, message: "Unauthorized. Token missing." });

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try finding user
    let account = await User.findById(decoded.id).select("-password");
    let accountType = "user";

    // Try company if user not found
    if (!account) {
      account = await Company.findById(decoded.id).select("-password");
      accountType = "company";
    }

    if (!account)
      return res.status(404).json({ success: false, message: "Account not found." });

    // ✅ Attach to req for next middleware/controller
    req.userData = account;  // <-- changed this key
    req.accountType = accountType;

    next();
  } catch (err) {
    console.error("🔴 HybridAuth Error:", err.message);
    return res.status(401).json({ success: false, message: "Unauthorized or invalid token." });
  }
};

export default hybridAuth;
