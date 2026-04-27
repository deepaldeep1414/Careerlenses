from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import jd
from routers import resume, score  # ADD THIS
from routers import enhance

app = FastAPI(title="CareerLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://careerlens.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jd.router)
app.include_router(resume.router)  # ADD THIS 
app.include_router(score.router)   # ADD THIS
app.include_router(enhance.router) 

@app.get("/")
def root():
    return {"message": "CareerLens is alive 🚀"}