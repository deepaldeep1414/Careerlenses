import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950 
                    flex flex-col items-center 
                    justify-center px-4">
      <div className="mb-6">
        <span className="text-4xl">🎯</span>
      </div>
      <h1 className="text-5xl font-bold text-white 
                     text-center mb-4">
        Career<span className="text-blue-500">Lenses</span>
      </h1>
      <p className="text-gray-400 text-xl text-center 
                    mb-2 max-w-lg">
        Beat the bots. Get the interview.
      </p>
      <p className="text-gray-500 text-center mb-10 max-w-md">
        Paste any job description, upload your resume — 
        get your ATS score and an AI-enhanced resume 
        in seconds.
      </p>
      <button
        onClick={() => navigate("/analyze")}
        className="bg-blue-600 hover:bg-blue-700 
                   text-white font-semibold 
                   px-8 py-4 rounded-xl text-lg
                   transition-all duration-200
                   hover:scale-105"
      >
        Analyze My Resume →
      </button>
      <div className="flex gap-12 mt-16 text-center">
        <div>
          <p className="text-white text-2xl font-bold">75%</p>
          <p className="text-gray-500 text-sm">
            Resumes rejected by ATS
          </p>
        </div>
        <div>
          <p className="text-white text-2xl font-bold">10s</p>
          <p className="text-gray-500 text-sm">
            To get your ATS score
          </p>
        </div>
        <div>
          <p className="text-white text-2xl font-bold">Free</p>
          <p className="text-gray-500 text-sm">
            No signup required
          </p>
        </div>
      </div>
    </div>
  );
}