import React, { useContext, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { LoaderCircle, CheckCircle, XCircle, Zap, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { AppContext } from "../context/AppContext";

/**
 * ATSAnalyzer
 * Drop this component onto ApplyJob.jsx (or Applications.jsx).
 * Props:
 *   jobId  — the MongoDB _id of the job being viewed
 */
const ATSAnalyzer = ({ jobId }) => {
  const { backendUrl, userToken, userData } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showCv, setShowCv] = useState(false);
  const [savingCv, setSavingCv] = useState(false);

  const scoreColor = (score) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-500";
  };

  const scoreBg = (score) => {
    if (score >= 75) return "bg-green-50 border-green-200";
    if (score >= 50) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const handleAnalyze = async () => {
    if (!userData) return toast.error("Please log in first.");
    if (!userData.resume) return toast.error("Please upload your resume in the Applications page first.");

    setLoading(true);
    setResult(null);
    try {
      const { data } = await axios.post(
        `${backendUrl}/ai/analyze-resume`,
        { jobId },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      if (data.success) {
        setResult(data.analysis);
        toast.success("ATS analysis complete!");
      } else {
        toast.error(data.message || "Analysis failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCv = async () => {
    if (!result?.optimized_cv_markdown) return;
    setSavingCv(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/ai/save-optimized-cv`,
        { optimizedCv: result.optimized_cv_markdown },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );
      if (data.success) toast.success("Optimized CV saved to your profile!");
      else toast.error(data.message);
    } catch {
      toast.error("Failed to save CV.");
    } finally {
      setSavingCv(false);
    }
  };

  return (
    <div className="mt-6 border border-blue-100 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">AI Resume Analyzer</h3>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            Powered by Claude
          </span>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${
            loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm hover:shadow"
          }`}
        >
          {loading ? (
            <>
              <LoaderCircle className="animate-spin h-4 w-4" />
              Analyzing…
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Check ATS Score
            </>
          )}
        </button>
      </div>

      {!result && !loading && (
        <p className="text-sm text-gray-500 px-5 py-4">
          Click <strong>Check ATS Score</strong> to see how well your resume matches this job and get AI-powered improvement tips.
        </p>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-500">
          <LoaderCircle className="animate-spin h-8 w-8 text-blue-500" />
          <p className="text-sm">Extracting resume text and running ATS analysis…</p>
        </div>
      )}

      {result && (
        <div className="p-5 space-y-5">
          {/* ATS Score */}
          <div className={`flex items-center gap-4 p-4 rounded-xl border ${scoreBg(result.ats_score)}`}>
            <div className={`text-5xl font-extrabold ${scoreColor(result.ats_score)}`}>
              {result.ats_score}
            </div>
            <div>
              <p className="font-semibold text-gray-700">ATS Score</p>
              <p className="text-xs text-gray-500">out of 100</p>
              {result.score_breakdown && (
                <div className="flex gap-3 mt-1 flex-wrap text-xs text-gray-600">
                  <span>Keywords: <b>{result.score_breakdown.keyword_density}</b></span>
                  <span>Formatting: <b>{result.score_breakdown.formatting_compatibility}</b></span>
                  <span>Skills: <b>{result.score_breakdown.skill_relevance}</b></span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Wins */}
          {result.quick_wins?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" /> Quick Wins
              </h4>
              <ul className="space-y-1">
                {result.quick_wins.map((win, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    {win}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Two-column: Missing + Matched Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Missing Keywords */}
            {result.missing_keywords?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-400" /> Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Matched Keywords */}
            {result.matched_keywords?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" /> Matched Keywords
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched_keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded-full"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggested Experience Bullets */}
          {result.suggested_experience_bullets?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                ✍️ AI-Suggested Experience Bullets
              </h4>
              <ul className="space-y-1.5">
                {result.suggested_experience_bullets.map((bullet, i) => (
                  <li key={i} className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    • {bullet}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Education Highlights */}
          {result.suggested_education_highlights?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                🎓 Education Highlights
              </h4>
              <ul className="space-y-1">
                {result.suggested_education_highlights.map((item, i) => (
                  <li key={i} className="text-sm text-gray-600 flex gap-2">
                    <span className="text-blue-400 mt-0.5">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Optimized CV (collapsible) */}
          {result.optimized_cv_markdown && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowCv((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  View Optimized ATS CV
                </span>
                {showCv ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showCv && (
                <div className="p-4 bg-white">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {result.optimized_cv_markdown}
                  </pre>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.optimized_cv_markdown);
                        toast.success("Copied to clipboard!");
                      }}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Copy
                    </button>
                    <button
                      onClick={handleSaveCv}
                      disabled={savingCv}
                      className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {savingCv ? "Saving…" : "Save to Profile"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ATSAnalyzer;
