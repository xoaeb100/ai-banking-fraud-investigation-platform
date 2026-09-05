from pathlib import Path
from pydantic import BaseModel
import joblib
from fastapi import FastAPI
from fastapi import HTTPException
import pandas as pd


app = FastAPI(
    title="Fraud Detection ML Service",
    version="1.0.0"
)

MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "fraud_model.pkl"
)

model = joblib.load(MODEL_PATH)


@app.get("/health")
def health():
    return {
        "status": "ok"
    }
    
print(model.n_features_in_)
print(model.feature_names_in_)
print(type(model))



class PredictionRequest(BaseModel):
    Time: float

    V1: float
    V2: float
    V3: float
    V4: float
    V5: float
    V6: float
    V7: float
    V8: float
    V9: float
    V10: float
    V11: float
    V12: float
    V13: float
    V14: float
    V15: float
    V16: float
    V17: float
    V18: float
    V19: float
    V20: float
    V21: float
    V22: float
    V23: float
    V24: float
    V25: float
    V26: float
    V27: float
    V28: float

    Amount: float
    
@app.post("/predict")
def predict(request: PredictionRequest):

    try:
        
        features = pd.DataFrame([{
            "Time": request.Time,
            "V1": request.V1,
            "V2": request.V2,
            "V3": request.V3,
            "V4": request.V4,
            "V5": request.V5,
            "V6": request.V6,
            "V7": request.V7,
            "V8": request.V8,
            "V9": request.V9,
            "V10": request.V10,
            "V11": request.V11,
            "V12": request.V12,
            "V13": request.V13,
            "V14": request.V14,
            "V15": request.V15,
            "V16": request.V16,
            "V17": request.V17,
            "V18": request.V18,
            "V19": request.V19,
            "V20": request.V20,
            "V21": request.V21,
            "V22": request.V22,
            "V23": request.V23,
            "V24": request.V24,
            "V25": request.V25,
            "V26": request.V26,
            "V27": request.V27,
            "V28": request.V28,
            "Amount": request.Amount,
        }])

        probability = model.predict_proba(features)[0][1]

        risk_score = round(probability * 100)

        prediction = (
            "FRAUD"
            if probability >= 0.4
            else "LEGITIMATE"
        )
        
        probabilities = model.predict_proba(features)[0]

        return {
            "legitimateProbability": probabilities[0],
            "fraudProbability": probabilities[1],
            "riskScore": round(probabilities[1] * 100),
            "prediction": (
                "FRAUD"
                if probabilities[1] >= 0.4
                else "LEGITIMATE"
            ),
        }

        # return {
        #     "fraudProbability":  probability, #round(probability, 4),
        #     "riskScore": risk_score,
        #     "prediction": prediction,
        # }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="Model inference failed"
        ) from error