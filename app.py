from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "CampusPath_KNN_Model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "CampusPath_Scaler.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "CampusPath_LabelEncoder.pkl")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
encoder = joblib.load(ENCODER_PATH)

app = FastAPI()

app.mount(
    "/static",
    StaticFiles(directory=os.path.join(BASE_DIR, "static")),
    name="static"
)

@app.get("/")
def index():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/result")
def result():
    return FileResponse(os.path.join(BASE_DIR, "result.html"))

@app.post("/predict")
async def predict(request: Request):
    data = await request.json()

    # Urutan p1 - p30 WAJIB konsisten
    features = np.array([data[f"p{i}"] for i in range(1, 31)]).reshape(1, -1)
    features = scaler.transform(features)

    probs = model.predict_proba(features)[0]
    labels = encoder.inverse_transform(np.arange(len(probs)))

    results = list(zip(labels, probs))
    results.sort(key=lambda x: x[1], reverse=True)

    top3 = [
        {"jurusan": r[0], "score": round(r[1] * 100, 2)}
        for r in results[:3]
    ]

    return JSONResponse({"top3": top3})
