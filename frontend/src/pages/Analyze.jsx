import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import { analyzeJD, scanResume,
         calculateScore, enhanceResume } from "../services/api";

export default function Analyze() {
  const navigate = useNavigate();
  const { loading, error, call } = useApi();
  const [jdText, setJdText] = useState("");
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("");

  const handleAnalyze = async () => {
    if (!jdText.trim()) {
      alert("Please paste a job description.");
      return;
    }
    if (!file) {
      alert("Please upload your resume PDF.");
      return;
    }

    setStep("Analyzing job description...");
    const jdData = await call(() => analyzeJD(jdText));
    if (!jdData) return;

    setStep("Scanning your resume...");
    const resumeData = await call(() => scanResume(file));
    if (!resumeData) return;

    setStep("Calculating ATS score...");
    const scoreData = await call(() =>
      calculateScore(resumeData.raw_text, jdData)
    );
    if (!scoreData) return;

    setStep("Enhancing your resume with AI...");
    const enhanced = await call(() =>
      enhanceResume(
        resumeData.raw_text,
        scoreData.missing_must_have || [],
        jdData.job_title || "Software Engineer",
        resumeData
      )
    );
    if (!enhanced) return;

    const results = { jdData, resumeData, scoreData, enhanced };
    sessionStorage.setItem("results", JSON.stringify(results));
    navigate("/result");
  };

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">
          🎯 CareerLenses
        </h1>
        <p className="text-gray-400 mb-8">
          Paste the job description and upload your resume
        </p>

        <div className="mb-6">
          <label className="text-white font-semibold block mb-2">
            Job Description
          </label>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={8}
            className="w-full bg-gray-900 text-gray-200
                       border border-gray-700 rounded-xl
                       p-4 resize-none focus:outline-none
                       focus:border-blue-500"
          />
        </div>

        <div className="mb-8">
          <label className="text-white font-semibold block mb-2">
            Your Resume (PDF only)
          </label>
          <div className="border-2 border-dashed border-gray-700
                          rounded-xl p-8 text-center
                          hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              {file ? (
                <div>
                  <p className="text-green-400 font-semibold">
                    ✅ {file.name}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Click to change file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-2">📄</p>
                  <p className="text-gray-400">
                    Click to upload your resume
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    PDF only, max 5MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700
                          rounded-xl p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading && (
          <div className="bg-blue-900/30 border border-blue-700
                          rounded-xl p-4 mb-6 flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-400"
                 viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12"
                      r="10" stroke="currentColor"
                      strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <p className="text-blue-400">{step}</p>
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700
                     disabled:bg-gray-700 disabled:cursor-not-allowed
                     text-white font-semibold py-4 rounded-xl
                     text-lg transition-all duration-200"
        >
          {loading ? "Analyzing..." : "Analyze My Resume →"}
        </button>
      </div>
    </div>
  );
}