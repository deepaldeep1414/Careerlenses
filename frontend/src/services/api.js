import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * All calls use the global axios instance so they inherit the
 * Authorization interceptor mounted by AuthContext.
 *
 * NOTE: Do NOT pass Content-Type: multipart/form-data manually for
 * file uploads — let axios set it automatically so the boundary
 * parameter is included.  Without the boundary the server cannot
 * parse the multipart body and will return a 422 error.
 */

export const analyzeJD = (text) =>
  axios.post(`${BASE}/jd/analyze`, { text });

export const scanResume = (file) => {
  const form = new FormData();
  form.append("file", file);
  // ✅ No explicit Content-Type — axios auto-sets it WITH the boundary
  return axios.post(`${BASE}/resume/scan`, form);
};

export const calculateScore = (resumeText, jdData) =>
  axios.post(`${BASE}/score/ats`, {
    resume_text: resumeText,
    must_have_skills: jdData.must_have_skills,
    nice_to_have_skills: jdData.nice_to_have_skills,
    top_keywords: jdData.top_keywords,
  });

export const enhanceResume = (
  resumeText,
  missingKeywords,
  jobTitle,
  structuredResume
) =>
  axios.post(`${BASE}/enhance/`, {
    raw_text: resumeText,
    missing_keywords: missingKeywords,
    job_title: jobTitle,
    structured_resume: structuredResume,
  });

export const generateDocx = (data) =>
  axios.post(`${BASE}/export/generate-docx`, data);

export const generateLatex = (data) =>
  axios.post(`${BASE}/export/generate-latex`, data);

export const downloadDocx = (fileId) => {
  window.open(`${BASE}/export/download/docx/${fileId}`, "_blank");
};

export const downloadLatex = (fileId) => {
  window.open(`${BASE}/export/download/latex/${fileId}`, "_blank");
};