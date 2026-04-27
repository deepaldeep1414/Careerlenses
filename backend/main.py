from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import jd
from routers import resume
from routers import export  # ADD THIS

app = FastAPI(title="CareerLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://careerlenses.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jd.router)
app.include_router(resume.router)
app.include_router(export.router)  # ADD THIS

@app.get("/")
def root():
    return {"message": "CareerLens is alive 🚀"}