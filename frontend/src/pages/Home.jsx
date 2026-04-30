import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between 
                      px-8 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <span className="text-xl font-bold">
            Career<span className="text-blue-400">Lenses</span>
          </span>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              <span className="text-gray-400 text-sm hidden sm:block">
                {user.email}
              </span>
              <button
                id="nav-logout-btn"
                onClick={logout}
                className="border border-gray-700 hover:border-red-700 
                           text-gray-300 hover:text-red-400 font-semibold 
                           px-4 py-2 rounded-lg text-sm transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              id="nav-login-btn"
              onClick={() => navigate("/login")}
              className="text-gray-300 hover:text-white font-semibold 
                         px-5 py-2 transition-all"
            >
              Sign In
            </button>
          )}
          <button
            id="nav-get-started-btn"
            onClick={() => navigate("/analyze")}
            className="bg-blue-600 hover:bg-blue-700 
                       text-white text-sm font-semibold 
                       px-5 py-2 rounded-lg transition-all"
          >
            Get Started →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        
        {/* Gradient blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 
                        bg-blue-600/20 rounded-full 
                        blur-3xl pointer-events-none"/>
        <div className="absolute top-20 right-1/4 w-80 h-80 
                        bg-purple-600/20 rounded-full 
                        blur-3xl pointer-events-none"/>

        <div className="max-w-4xl mx-auto px-6 
                        pt-24 pb-20 text-center relative">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 
                          bg-blue-950/60 border border-blue-800 
                          text-blue-300 text-sm px-4 py-2 
                          rounded-full mb-8">
            <span className="w-2 h-2 bg-blue-400 
                             rounded-full animate-pulse"/>
            AI-Powered Resume Optimizer
          </div>

          {/* Headline */}
          <h1 className="text-6xl font-bold leading-tight mb-6">
            Beat the bots.
            <br/>
            <span className="bg-gradient-to-r from-blue-400 
                             via-purple-400 to-blue-400 
                             bg-clip-text text-transparent">
              Get the interview.
            </span>
          </h1>

          <p className="text-gray-400 text-xl max-w-2xl 
                        mx-auto mb-10 leading-relaxed">
            Paste any job description, upload your resume — 
            CareerLenses analyzes your ATS match score and 
            rewrites your resume with AI to get you noticed.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/analyze")}
              className="bg-gradient-to-r from-blue-600 to-purple-600
                         hover:from-blue-700 hover:to-purple-700
                         text-white font-semibold px-8 py-4 
                         rounded-xl text-lg transition-all 
                         duration-200 hover:scale-105 shadow-lg
                         shadow-blue-900/40"
            >
              Analyze My Resume →
            </button>
            <button
              onClick={() => navigate("/analyze")}
              className="border border-gray-700 hover:border-gray-500
                         text-gray-300 hover:text-white
                         font-semibold px-8 py-4 rounded-xl 
                         text-lg transition-all duration-200"
            >
              See How It Works
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-4xl mx-auto px-6 py-8
                        grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r 
                          from-blue-400 to-purple-400 
                          bg-clip-text text-transparent">
              75%
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Resumes rejected by ATS bots
            </p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r 
                          from-blue-400 to-purple-400 
                          bg-clip-text text-transparent">
              10s
            </p>
            <p className="text-gray-400 text-sm mt-1">
              To get your ATS score
            </p>
          </div>
          <div>
            <p className="text-4xl font-bold bg-gradient-to-r 
                          from-blue-400 to-purple-400 
                          bg-clip-text text-transparent">
              Free
            </p>
            <p className="text-gray-400 text-sm mt-1">
              No signup required
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          How it works
        </h2>
        <p className="text-gray-400 text-center mb-14">
          Four steps to a job-winning resume
        </p>

        <div className="grid grid-cols-2 gap-6">
          {[
            {
              step: "01",
              icon: "📋",
              title: "Paste Job Description",
              desc: "Copy any job posting and paste it into CareerLenses"
            },
            {
              step: "02",
              icon: "📄",
              title: "Upload Your Resume",
              desc: "Upload your existing resume as a PDF file"
            },
            {
              step: "03",
              icon: "🎯",
              title: "Get ATS Score",
              desc: "See exactly how well your resume matches the job"
            },
            {
              step: "04",
              icon: "✨",
              title: "Download Enhanced Resume",
              desc: "Get an AI-rewritten resume as .docx or LaTeX"
            }
          ].map((item, i) => (
            <div key={i}
                 className="bg-gray-900 border border-gray-800 
                            rounded-2xl p-6 hover:border-blue-800
                            transition-all duration-200">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-blue-500 font-mono 
                                 text-sm font-bold">
                  {item.step}
                </span>
                <span className="text-2xl">{item.icon}</span>
              </div>
              <h3 className="text-white font-semibold mb-2">
                {item.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r 
                        from-blue-900/20 to-purple-900/20"/>
        <div className="max-w-4xl mx-auto px-6 py-20 
                        text-center relative">
          <h2 className="text-4xl font-bold mb-4">
            Ready to beat the ATS?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Join thousands of job seekers who got more interviews
          </p>
          <button
            onClick={() => navigate("/analyze")}
            className="bg-gradient-to-r from-blue-600 to-purple-600
                       hover:from-blue-700 hover:to-purple-700
                       text-white font-semibold px-10 py-4 
                       rounded-xl text-lg transition-all 
                       hover:scale-105 shadow-lg shadow-blue-900/40"
          >
            Analyze My Resume — It's Free →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 px-8 py-6
                      flex items-center justify-between">
        <span className="text-gray-500 text-sm">
          © 2026 CareerLenses
        </span>
        <span className="text-gray-500 text-sm">
          Built with FastAPI + React + Groq AI
        </span>
      </div>

    </div>
  );
}