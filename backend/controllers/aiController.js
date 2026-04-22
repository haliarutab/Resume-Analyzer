import fetch from "node-fetch";
import Job from "../models/Job.js";
import User from "../models/User.js";
import JobApplication from "../models/JobApplication.js";

/**
 * Fetch and extract plain text from a Cloudinary-hosted PDF URL.
 * Uses pdf-parse to read the PDF buffer server-side.
 */
async function extractTextFromPdfUrl(pdfUrl) {
  // Dynamically import pdf-parse (CommonJS module)
  const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;

  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF from Cloudinary: ${response.statusText}`);
  }
  const buffer = await response.buffer();
  const parsed = await pdfParse(buffer);
  return parsed.text || "";
}

/**
 * POST /ai/analyze-resume
 * Body: { jobId }
 * Auth: userAuthMiddleware (sets req.userData)
 *
 * Fetches the user's resume from Cloudinary, extracts text,
 * then calls the Anthropic Claude API to perform ATS analysis
 * against the target job description. Returns structured JSON.
 */
export const analyzeResume = async (req, res) => {
  try {
    const { jobId } = req.body;
    const user = req.userData;

    // ── 1. Validate inputs ────────────────────────────────────────────────
    if (!jobId) {
      return res.status(400).json({ success: false, message: "jobId is required." });
    }
    if (!user.resume) {
      return res.status(400).json({
        success: false,
        message: "No resume found. Please upload your resume first.",
      });
    }

    // ── 2. Fetch job data ─────────────────────────────────────────────────
    const job = await Job.findById(jobId).select("title description category level");
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    // ── 3. Extract resume text from Cloudinary PDF ────────────────────────
    let resumeText;
    try {
      resumeText = await extractTextFromPdfUrl(user.resume);
    } catch (err) {
      console.error("PDF extraction error:", err.message);
      return res.status(422).json({
        success: false,
        message: "Could not parse your PDF. Please re-upload a text-based PDF.",
      });
    }

    if (!resumeText.trim()) {
      return res.status(422).json({
        success: false,
        message: "Resume appears to be empty or image-only. Please upload a text-based PDF.",
      });
    }

    // ── 4. Build the prompt ───────────────────────────────────────────────
    const systemPrompt = `You are an expert ATS (Applicant Tracking System) Specialist and Career Coach with 15 years of experience reviewing resumes for top companies. You provide precise, actionable analysis that helps candidates dramatically improve their interview chances.`;

    const userPrompt = `Analyze the candidate's resume against the job description below and return ONLY a valid JSON object — no markdown, no explanation, no preamble.

JOB DETAILS:
- Job Title: ${job.title}
- Category: ${job.category}
- Level: ${job.level}
- Job Description:
${job.description.replace(/<[^>]*>/g, " ").trim()}

CANDIDATE RESUME:
${resumeText.slice(0, 6000)}

Return EXACTLY this JSON structure:
{
  "ats_score": <integer 0-100>,
  "score_breakdown": {
    "keyword_density": <integer 0-100>,
    "formatting_compatibility": <integer 0-100>,
    "skill_relevance": <integer 0-100>
  },
  "missing_keywords": [<array of up to 10 high-impact missing keywords/phrases>],
  "matched_keywords": [<array of keywords already present in resume>],
  "suggested_experience_bullets": [<3-5 rewritten bullet points using action verbs + metrics>],
  "suggested_education_highlights": [<2-3 suggestions for relevant coursework or projects>],
  "optimized_cv_markdown": "<full ATS-friendly CV in markdown, no tables/images/columns>",
  "quick_wins": [<3 immediate changes that will most improve ATS score>]
}`;

    // ── 5. Call Anthropic Claude API ──────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "AI service not configured. Please contact the administrator.",
      });
    }

    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!claudeRes.ok) {
      const errBody = await claudeRes.text();
      console.error("Claude API error:", errBody);
      return res.status(502).json({ success: false, message: "AI service temporarily unavailable." });
    }

    const claudeData = await claudeRes.json();
    const rawText = claudeData?.content?.[0]?.text || "";

    // ── 6. Parse the JSON response ────────────────────────────────────────
    let analysisResult;
    try {
      // Strip any accidental markdown fences
      const clean = rawText.replace(/```json|```/g, "").trim();
      analysisResult = JSON.parse(clean);
    } catch {
      console.error("Failed to parse Claude response:", rawText);
      return res.status(502).json({
        success: false,
        message: "AI returned an unexpected format. Please try again.",
      });
    }

    // ── 7. Optionally update matchScore on the JobApplication ─────────────
    if (analysisResult.ats_score !== undefined) {
      await JobApplication.findOneAndUpdate(
        { userId: user._id, jobId },
        { matchScore: analysisResult.ats_score },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      jobTitle: job.title,
      analysis: analysisResult,
    });
  } catch (error) {
    console.error("analyzeResume error:", error);
    return res.status(500).json({ success: false, message: "Resume analysis failed." });
  }
};


/**
 * POST /ai/save-optimized-cv
 * Body: { optimizedCv } — markdown string
 * Auth: userAuthMiddleware
 *
 * Saves the AI-generated optimized CV text to the User document.
 * This is separate from the original Cloudinary PDF resume link.
 */
export const saveOptimizedCv = async (req, res) => {
  try {
    const { optimizedCv } = req.body;
    if (!optimizedCv) {
      return res.status(400).json({ success: false, message: "optimizedCv content is required." });
    }

    await User.findByIdAndUpdate(req.userData._id, { optimizedCv }, { new: true });

    return res.status(200).json({ success: true, message: "Optimized CV saved successfully." });
  } catch (error) {
    console.error("saveOptimizedCv error:", error);
    return res.status(500).json({ success: false, message: "Failed to save optimized CV." });
  }
};
