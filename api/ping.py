from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sys
import os

app = FastAPI()

@app.get("/api/ping")
def ping():
    return {
        "status": "ok",
        "message": "Minimal Python API is working!",
        "sys.path": sys.path,
        "cwd": os.getcwd()
    }
