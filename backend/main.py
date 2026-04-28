from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="SALON&SPA API",
    description="Backend API for cruise ship spa facility management",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

COUCHDB_URL = os.getenv("COUCHDB_URL", "http://localhost:5984")
COUCHDB_USER = os.getenv("COUCHDB_USER", "admin")
COUCHDB_PASSWORD = os.getenv("COUCHDB_PASSWORD", "password")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "salon-spa-api"}


@app.get("/")
async def root():
    return {"message": "SALON&SPA API is running"}
