from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import joblib
import numpy as np
import pandas as pd
from typing import List, Optional
import os
from dotenv import load_dotenv
import hashlib
import logging
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import pickle

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="SafeMail API")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://safemail.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

TRAINING_DATA_FILE = os.path.join(DATA_DIR, 'spam_Emails_data.csv')
DATASET_FILE = os.path.join(DATASET_DIR, 'analyzed_emails.csv')

MONGODB_URL = "mongodb+srv://jinang:helloworld@cluster0.sockwk5.mongodb.net/safesms?retryWrites=true&w=majority&appName=Cluster0"
client = AsyncIOMotorClient(MONGODB_URL)
db = client.safesms
reviews_collection = db.reviews

model_path = os.path.join(os.path.dirname(__file__), 'model', 'spam_model.pkl')
vectorizer_path = os.path.join(os.path.dirname(__file__), 'model', 'tfidf_vectorizer.pkl')

try:
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    test_text = "This is a test message"
    test_vector = vectorizer.transform([test_text])
    test_prediction = model.predict(test_vector)
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    model = None
    vectorizer = None

class EmailRequest(BaseModel):
    content: str

class EmailResponse(BaseModel):
    is_safe: bool
    confidence: float
    threats: List[str]
    analysis: str

class SMSRequest(BaseModel):
    content: str

class ReviewRequest(BaseModel):
    name: str
    rating: int
    comment: str

class ReviewResponse(BaseModel):
    id: str
    name: str
    rating: int
    comment: str
    created_at: datetime

def verify_save(file_path: str, content: str) -> bool:
    """
    Verify if the content was saved correctly
    """
    try:
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return False

        df = pd.read_csv(file_path)
        content_hash = generate_email_hash(content)
        
        if 'text' in df.columns:
            saved_hashes = df['text'].apply(generate_email_hash)
        elif 'email_content' in df.columns:
            saved_hashes = df['email_content'].apply(generate_email_hash)
        else:
            logger.error(f"Unexpected columns in file: {file_path}")
            return False

        is_saved = content_hash in saved_hashes.values
        logger.info(f"Verification {'successful' if is_saved else 'failed'} for {file_path}")
        return is_saved
    except Exception as e:
        logger.error(f"Error verifying save: {e}")
        return False

def generate_email_hash(content: str) -> str:
    """
    Generate a hash for the email content to check for duplicates
    """
    return hashlib.md5(content.encode()).hexdigest()

def is_duplicate_in_training_dataset(content: str) -> bool:
    """
    Check if the email content already exists in the training dataset
    """
    try:
        if not os.path.exists(TRAINING_DATA_FILE):
            return False
        
        df = pd.read_csv(TRAINING_DATA_FILE)
        content_hash = generate_email_hash(content)
        existing_hashes = df['text'].apply(generate_email_hash)
        
        is_dup = content_hash in existing_hashes.values
        if is_dup:
            logger.info("Duplicate found in training dataset")
        return is_dup
    except Exception as e:
        logger.error(f"Error checking for duplicates in training dataset: {e}")
        return False

def is_duplicate_in_analysis_dataset(content: str) -> bool:
    """
    Check if the email content already exists in the analysis dataset
    """
    try:
        if not os.path.exists(DATASET_FILE):
            return False
        
        df = pd.read_csv(DATASET_FILE)
        content_hash = generate_email_hash(content)
        existing_hashes = df['email_content'].apply(generate_email_hash)
        
        is_dup = content_hash in existing_hashes.values
        if is_dup:
            logger.info("Duplicate found in analysis dataset")
        return is_dup
    except Exception as e:
        logger.error(f"Error checking for duplicates in analysis dataset: {e}")
        return False

def save_to_training_dataset(email_content: str, is_safe: bool) -> bool:
    """
    Save analyzed email to the training dataset if it's not a duplicate
    Returns True if save was successful
    """
    try:
        if is_duplicate_in_training_dataset(email_content):
            logger.info("Email already exists in training dataset, skipping...")
            return False

        # Create new data row
        new_data = pd.DataFrame({
            'text': [email_content],
            'label': ['Ham' if is_safe else 'Spam']
        })

        # Append to training dataset
        if os.path.exists(TRAINING_DATA_FILE):
            new_data.to_csv(TRAINING_DATA_FILE, mode='a', header=False, index=False)
        else:
            new_data.to_csv(TRAINING_DATA_FILE, index=False)
            
        logger.info(f"Saved new email to training dataset with label: {'Ham' if is_safe else 'Spam'}")
        
        # Verify the save
        if verify_save(TRAINING_DATA_FILE, email_content):
            logger.info("Training dataset save verified successfully")
            return True
        else:
            logger.error("Failed to verify training dataset save")
            return False
    except Exception as e:
        logger.error(f"Error saving to training dataset: {e}")
        return False

def save_to_analysis_dataset(email_content: str, result: dict) -> bool:
    """
    Save analyzed email and its result to the analysis dataset if it's not a duplicate
    Returns True if save was successful
    """
    try:
        if is_duplicate_in_analysis_dataset(email_content):
            logger.info("Email already exists in analysis dataset, skipping...")
            return False

        # Create DataFrame with new data
        new_data = pd.DataFrame({
            'timestamp': [datetime.now().isoformat()],
            'email_content': [email_content],
            'is_safe': [result['is_safe']],
            'confidence': [result['confidence']],
            'analysis': [result['analysis']]
        })

        # Append to existing file or create new one
        if os.path.exists(DATASET_FILE):
            new_data.to_csv(DATASET_FILE, mode='a', header=False, index=False)
        else:
            new_data.to_csv(DATASET_FILE, index=False)
            
        logger.info("Saved new email to analysis dataset")
        
        # Verify the save
        if verify_save(DATASET_FILE, email_content):
            logger.info("Analysis dataset save verified successfully")
            return True
        else:
            logger.error("Failed to verify analysis dataset save")
            return False
    except Exception as e:
        logger.error(f"Error saving to analysis dataset: {e}")
        return False

def analyze_email(content: str) -> dict:
    if not model or not vectorizer:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    vector = vectorizer.transform([content])
    prediction = model.predict(vector)[0]
    probability = model.predict_proba(vector)[0]
    confidence = float(max(probability))
    
    is_safe = prediction == 0
    threats, analysis = generate_analysis(content, is_safe, confidence)
    
    return {
        "is_safe": is_safe,
        "confidence": confidence,
        "threats": threats,
        "analysis": analysis
    }

def generate_analysis(content: str, is_safe: bool, confidence: float) -> tuple:
    threats = []
    if not is_safe:
        if "urgent" in content.lower():
            threats.append("Urgency tactics detected")
        if "password" in content.lower():
            threats.append("Password request detected")
        if "click here" in content.lower():
            threats.append("Suspicious link detected")
    
    analysis = "Safe" if is_safe else "Potentially harmful"
    return threats, analysis

def preprocess_sms(text):
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text

def analyze_sms_content(text):
    if model is None or vectorizer is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
        
    try:
        # Preprocess the text
        processed_text = preprocess_sms(text)
        
        # Vectorize the text
        text_vector = vectorizer.transform([processed_text])
        
        # Get prediction
        prediction = model.predict(text_vector)[0]
        
        # Get probability scores
        proba = model.predict_proba(text_vector)[0]
        confidence = max(proba) * 100
        
        # Determine if the SMS is safe (0 is safe, 1 is spam)
        is_safe = prediction == 0
        
        # Generate analysis
        if is_safe:
            analysis = "This SMS appears to be legitimate and safe."
            threats = []
        else:
            analysis = "This SMS shows characteristics of spam or malicious content."
            threats = [
                "Potential spam content",
                "Suspicious patterns detected",
                "High risk of phishing attempt"
            ]
        
        return {
            "is_safe": is_safe,
            "confidence": confidence,
            "analysis": analysis,
            "threats": threats
        }
    except Exception as e:
        logger.error(f"Error in analyze_sms_content: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-email", response_model=EmailResponse)
async def analyze_email_endpoint(request: EmailRequest):
    try:
        result = analyze_email(request.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-sms")
async def analyze_sms(request: SMSRequest):
    if model is None or vectorizer is None:
        raise HTTPException(status_code=500, detail="Model not loaded. Please check server logs.")
    
    try:
        # Preprocess the text
        text = request.content.lower()
        text = re.sub(r'[^\w\s]', '', text)
        
        # Transform the text
        text_vector = vectorizer.transform([text])
        
        # Get prediction
        prediction = model.predict(text_vector)[0]
        prediction_proba = model.predict_proba(text_vector)[0]
        
        # Convert numpy types to Python native types
        is_safe = bool(prediction)
        confidence = float(prediction_proba[1] * 100)
        
        # Determine analysis message
        if is_safe:
            analysis = "This SMS appears to be legitimate and safe."
            threats = []
        else:
            analysis = "This SMS appears to be suspicious or potentially harmful."
            threats = ["Potential spam or scam content detected"]
        
        return {
            "is_safe": is_safe,
            "confidence": confidence,
            "analysis": analysis,
            "threats": threats
        }
    except Exception as e:
        logger.error(f"Error analyzing SMS: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/reviews")
async def create_review(review: ReviewRequest):
    review_dict = review.dict()
    review_dict["created_at"] = datetime.utcnow()
    result = await reviews_collection.insert_one(review_dict)
    return {
        "id": str(result.inserted_id),
        "name": review_dict["name"],
        "rating": review_dict["rating"],
        "comment": review_dict["comment"],
        "created_at": review_dict["created_at"]
    }

@app.get("/api/reviews", response_model=List[ReviewResponse])
async def get_reviews():
    reviews = []
    cursor = reviews_collection.find().sort("created_at", -1)
    async for document in cursor:
        document["id"] = str(document.pop("_id"))
        reviews.append(document)
    return reviews

@app.get("/api/reviews/latest")
async def get_latest_reviews():
    reviews = []
    cursor = reviews_collection.find().sort("created_at", -1).limit(3)
    async for document in cursor:
        document["id"] = str(document["_id"])
        del document["_id"]
        reviews.append(document)
    return reviews

@app.get("/")
async def read_root_health_check():
    return {"status": "Backend service is running", "version": "1.0"}

@app.get("/api")
async def read_api_root():
    return {"message": "Welcome to the SafeMail API!"}

if __name__ == "__main__":
    import uvicorn
    # Run on all network interfaces (0.0.0.0) to allow mobile access
    uvicorn.run(app, host="0.0.0.0", port=8000) 
