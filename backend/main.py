from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import jd
from routers import resume
from routers import export, score, enhance 
from routers import auth
from database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CareerLens API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://careerlenses.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(jd.router)
app.include_router(resume.router)
app.include_router(export.router)  
app.include_router(score.router)
app.include_router(enhance.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "CareerLens is alive 🚀"}