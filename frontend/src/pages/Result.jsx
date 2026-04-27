import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../hooks/useApi";
import {
    generateDocx, generateLatex,
    downloadDocx, downloadLatex
} from "../services/api";

export default function Result() {
    const navigate = useNavigate();
    const { loading, call } = useApi();
    const [results, setResults] = useState(null);

    useEffect(() => {
        const saved = sessionStorage.getItem("results");
        if (!saved) {
            navigate("/analyze");
            return;
        }
        setResults(JSON.parse(saved));
    }, []);

    const handleDownloadDocx = async () => {
        const data = {
            structured_resume: results.resumeData,
            enhanced: results.enhanced
        };
        const res = await call(() => generateDocx(data));
        if (res?.file_id) downloadDocx(res.file_id);
    };

    const handleDownloadLatex = async () => {
        const data = {
            structured_resume: results.resumeData,
            enhanced: results.enhanced
        };
        const res = await call(() => generateLatex(data));
        if (res?.file_id) downloadLatex(res.file_id);
    };

    if (!results) return null;

    const { jdData, scoreData, enhanced } = results;
    const score = scoreData.ats_score;
    const matched = scoreData.matched_must_have || [];
    const missing = scoreData.missing_must_have || [];
    const scoreColor = score >= 75 ? "text-green-400"
        : score >= 50 ? "text-yellow-400"
            : "text-red-400";

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-10">
            <div className="max-w-2xl mx-auto">

                <h1 className="text-3xl font-bold text-white mb-8">
                    🎯 Your Results
                </h1>

                {/* ATS Score Card */}
                <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-8 mb-6 text-center">
                    <p className="text-gray-400 mb-2">ATS Match Score</p>
                    <p className={`text-7xl font-bold ${scoreColor}`}>
                        {score}%
                    </p>
                    <p className="text-gray-400 mt-2">{scoreData.verdict}</p>
                    <p className="text-gray-500 text-sm mt-1">
                        {jdData.job_title} · {jdData.seniority_level}
                    </p>
                    <div className="flex justify-center gap-8 mt-4">
                        <div>
                            <p className="text-white font-semibold">
                                {scoreData.score_breakdown?.must_matched}
                            </p>
                            <p className="text-gray-500 text-xs">
                                Must-have matched
                            </p>
                        </div>
                        <div>
                            <p className="text-white font-semibold">
                                {scoreData.score_breakdown?.nice_matched}
                            </p>
                            <p className="text-gray-500 text-xs">
                                Nice-to-have matched
                            </p>
                        </div>
                    </div>
                </div>

                {/* Priority Gaps */}
                {scoreData.priority_gaps?.length > 0 && (
                    <div className="bg-red-950/30 border border-red-900
                          rounded-2xl p-6 mb-6">
                        <h2 className="text-red-400 font-semibold mb-3">
                            🚨 Top Skills to Add First
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {scoreData.priority_gaps.map((k, i) => (
                                <span key={i}
                                    className="bg-red-900/40 text-red-300
                                 border border-red-800
                                 px-3 py-1 rounded-full text-sm">
                                    {k}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Keywords */}
                <div className="bg-gray-900 border border-gray-800
                        rounded-2xl p-6 mb-6">
                    <h2 className="text-white font-semibold mb-4">
                        Keyword Analysis
                    </h2>
                    <p className="text-red-400 font-semibold text-sm mb-2">
                        ❌ Missing Keywords
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {missing.map((k, i) => (
                            <span key={i}
                                className="bg-red-900/30 text-red-300
                               border border-red-800
                               px-3 py-1 rounded-full text-sm">
                                {k}
                            </span>
                        ))}
                    </div>
                    <p className="text-green-400 font-semibold text-sm mb-2">
                        ✅ Matched Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {matched.map((k, i) => (
                            <span key={i}
                                className="bg-green-900/30 text-green-300
                               border border-green-800
                               px-3 py-1 rounded-full text-sm">
                                {k}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Enhanced Experience */}
                {enhanced?.enhanced_experience?.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800
                          rounded-2xl p-6 mb-6">
                        <h2 className="text-white font-semibold mb-4">
                            ✨ AI Enhanced Experience
                        </h2>
                        {enhanced.enhanced_experience.map((exp, i) => (
                            <div key={i} className="mb-4">
                                <p className="text-white font-semibold text-sm">
                                    {exp.company} — {exp.title}
                                </p>
                                <p className="text-gray-500 text-xs mb-2">
                                    {exp.dates}
                                </p>
                                <ul className="space-y-2">
                                    {exp.bullets?.map((b, j) => (
                                        <li key={j}
                                            className="text-gray-300 text-sm flex gap-2">
                                            <span className="text-blue-400 mt-0.5">→</span>
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Enhanced Projects */}
                {enhanced?.enhanced_projects?.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800
                          rounded-2xl p-6 mb-6">
                        <h2 className="text-white font-semibold mb-4">
                            🚀 Enhanced Projects
                        </h2>
                        {enhanced.enhanced_projects.map((proj, i) => (
                            <div key={i} className="mb-4">
                                <p className="text-white font-semibold text-sm">
                                    {proj.name}
                                </p>
                                <ul className="space-y-2 mt-2">
                                    {proj.bullets?.map((b, j) => (
                                        <li key={j}
                                            className="text-gray-300 text-sm flex gap-2">
                                            <span className="text-purple-400 mt-0.5">→</span>
                                            <span>{b}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}

                {/* Enhanced Skills */}
                {enhanced?.enhanced_skills?.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800
                          rounded-2xl p-6 mb-6">
                        <h2 className="text-white font-semibold mb-4">
                            🛠️ Recommended Skills
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {enhanced.enhanced_skills.map((s, i) => (
                                <span key={i}
                                    className="bg-blue-900/30 text-blue-300
                                 border border-blue-800
                                 px-3 py-1 rounded-full text-sm">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Download Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                        onClick={handleDownloadDocx}
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700
                       disabled:bg-gray-700
                       text-white font-semibold
                       py-4 rounded-xl transition-all"
                    >
                        📄 Download .docx
                    </button>
                    <button
                        onClick={handleDownloadLatex}
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-700
                       disabled:bg-gray-700
                       text-white font-semibold
                       py-4 rounded-xl transition-all"
                    >
                        📝 Download LaTeX
                    </button>
                </div>

                <div className="mb-4">
                    <button
                        onClick={async () => {
                            const data = {
                                structured_resume: results.resumeData,
                                enhanced: results.enhanced
                            };
                            const res = await call(() => generateLatex(data));
                            if (res?.file_id) {
                                const BASE = import.meta.env.VITE_API_URL
                                    || "http://localhost:8000";
                                const form = document.createElement("form");
                                form.method = "POST";
                                form.action = "https://www.overleaf.com/docs";
                                form.target = "_blank";
                                const input = document.createElement("input");
                                input.name = "snip_uri";
                                input.value = `${BASE}/export/download/latex/${res.file_id}`;
                                form.appendChild(input);
                                document.body.appendChild(form);
                                form.submit();
                            }
                        }}
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700
                       disabled:bg-gray-700
                       text-white font-semibold
                       py-4 rounded-xl transition-all"
                    >
                        🌿 Open in Overleaf
                    </button>
                </div>

                <button
                    onClick={() => navigate("/analyze")}
                    className="w-full border border-gray-700
                     text-gray-400 hover:text-white
                     hover:border-gray-500
                     py-4 rounded-xl transition-all"
                >
                    ← Analyze Another Resume
                </button>

            </div>
        </div>
    );
}