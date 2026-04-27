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
            ...results.enhanced,
            name: "Your Name",
            email: "your@email.com",
            phone: "your phone",
        };
        const res = await call(() => generateDocx(data));
        if (res?.file_id) downloadDocx(res.file_id);
    };

    const handleDownloadLatex = async () => {
        const data = {
            ...results.enhanced,
            name: "Your Name",
            email: "your@email.com",
            phone: "your phone",
            linkedin: "linkedin.com/in/yourprofile",
            education: []
        };
        const res = await call(() => generateLatex(data));
        if (res?.file_id) downloadLatex(res.file_id);
    };

    if (!results) return null;

    const { jdData, scoreData, enhanced } = results;
    const score = scoreData.ats_score;
    const scoreColor = score >= 75 ? "text-green-400"
        : score >= 50 ? "text-yellow-400"
            : "text-red-400";

    return (
        <div className="min-h-screen bg-gray-950 px-4 py-10">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">
                    🎯 Your Results
                </h1>

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
                </div>

                <div className="bg-gray-900 border border-gray-800 
                        rounded-2xl p-6 mb-6">
                    <h2 className="text-white font-semibold mb-4">
                        Keyword Analysis
                    </h2>
                    <p className="text-red-400 font-semibold text-sm mb-2">
                        ❌ Missing Keywords
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {scoreData.missing_keywords.map((k, i) => (
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
                        {scoreData.matched_keywords.map((k, i) => (
                            <span key={i}
                                className="bg-green-900/30 text-green-300 
                               border border-green-800 
                               px-3 py-1 rounded-full text-sm">
                                {k}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 
                        rounded-2xl p-6 mb-6">
                    <h2 className="text-white font-semibold mb-4">
                        ✨ AI Enhanced Resume Bullets
                    </h2>
                    <ul className="space-y-3">
                        {enhanced.enhanced_bullets?.map((b, i) => (
                            <li key={i} className="text-gray-300 text-sm flex gap-2">
                                <span className="text-blue-400 mt-0.5">→</span>
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                </div>

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
                                ...results.enhanced,
                                name: "Your Name",
                                email: "your@email.com",
                                phone: "your phone",
                                linkedin: "linkedin.com/in/yourprofile",
                                education: []
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