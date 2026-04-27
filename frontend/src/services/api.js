import axios from "axios";

const BASE = import.meta.env.VITE_API_URL
          || "http://localhost:8000";

export const analyzeJD = (text) =>
  axios.post(`${BASE}/jd/analyze`, { text });

export const scanResume = (file) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post(`${BASE}/resume/scan`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
};

export const calculateScore = (resumeText, jdData) =>
  axios.post(`${BASE}/score/ats`, {
    resume_text: resumeText,
    must_have_skills: jdData.must_have_skills,
    nice_to_have_skills: jdData.nice_to_have_skills,
    top_keywords: jdData.top_keywords
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
    structured_resume: structuredResume
  });

export const generateDocx = (data) =>
  axios.post(`${BASE}/export/generate-docx`, data);

export const generateLatex = (data) =>
  axios.post(`${BASE}/export/generate-latex`, data);

export const downloadDocx = (fileId) => {
  const url = `${BASE}/export/download/docx/${fileId}`;
  window.open(url, "_blank");
};

export const downloadLatex = (fileId) => {
  const url = `${BASE}/export/download/latex/${fileId}`;
  window.open(url, "_blank");
};