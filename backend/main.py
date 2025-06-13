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

# Set up logging with correct path
log_dir = os.path.dirname(__file__)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(log_dir, 'email_analysis.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="SafeMail API")

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://safemail.vercel.app",  # Add your Vercel frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define paths
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'model')
DATA_DIR = os.path.join(os.path.dirname(__file__), 'data')
DATASET_DIR = os.path.join(os.path.dirname(__file__), 'dataset')

# Create necessary directories
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

# Define file paths
TRAINING_DATA_FILE = os.path.join(DATA_DIR, 'spam_Emails_data.csv')
DATASET_FILE = os.path.join(DATASET_DIR, 'analyzed_emails.csv')

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client.safesms
reviews_collection = db.reviews

# Load the ML model and vectorizer
try:
    model = joblib.load(os.path.join(MODEL_DIR, 'spam_model.pkl'))
    vectorizer = joblib.load(os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
    logger.info("Model and vectorizer loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
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
    """
    Analyze email content using the ML model
    """
    if model is None or vectorizer is None:
        raise HTTPException(status_code=500, detail="Model not loaded")

    try:
        # Transform the input email
        features = vectorizer.transform([content])
        
        # Get prediction and probability
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        confidence = float(max(probabilities) * 100)

        # Determine if email is safe (1 is safe, 0 is spam)
        is_safe = bool(prediction == 1)

        # Generate analysis and threats
        analysis, threats = generate_analysis(content, is_safe, confidence)

        result = {
            "is_safe": is_safe,
            "confidence": confidence,
            "threats": threats,
            "analysis": analysis
        }

        # Save to both datasets if not duplicates
        training_saved = save_to_training_dataset(content, is_safe)
        analysis_saved = save_to_analysis_dataset(content, result)

        logger.info(f"Save results - Training: {'Success' if training_saved else 'Failed'}, Analysis: {'Success' if analysis_saved else 'Failed'}")

        return result
    except Exception as e:
        logger.error(f"Error in analyze_email: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_analysis(content: str, is_safe: bool, confidence: float) -> tuple:
    """
    Generate analysis and threats based on model prediction
    """
    if is_safe:
        analysis = f"This email appears to be safe (Ham) with {confidence:.1f}% confidence. No suspicious patterns detected."
        threats = []
    else:
        analysis = f"Potential spam detected with {confidence:.1f}% confidence."
        threats = [
            "Suspicious content patterns detected",
            "Potential spam characteristics identified",
            "High risk of unwanted or malicious content"
        ]
    
    return analysis, threats

def preprocess_sms(text):
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text

def analyze_sms_content(text):
    # Preprocess the text
    processed_text = preprocess_sms(text)
    
    # Vectorize the text
    text_vector = vectorizer.transform([processed_text])
    
    # Get prediction
    prediction = model.predict(text_vector)[0]
    
    # Get probability scores
    proba = model.predict_proba(text_vector)[0]
    confidence = max(proba) * 100
    
    # Determine if the SMS is safe
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

@app.post("/api/analyze-email", response_model=EmailResponse)
async def analyze_email_endpoint(request: EmailRequest):
    """
    Analyze email content for security threats
    """
    try:
        logger.info(f"Received email analysis request. Content length: {len(request.content)}")
        
        if not request.content:
            logger.error("Empty email content received")
            raise HTTPException(status_code=400, detail="Email content cannot be empty")
            
        if model is None or vectorizer is None:
            logger.error("Model or vectorizer not loaded")
            raise HTTPException(status_code=500, detail="Model not loaded")
            
        logger.info("Starting email analysis...")
        result = analyze_email(request.content)
        logger.info(f"Analysis complete. Result: {result}")
        
        return EmailResponse(**result)
    except Exception as e:
        logger.error(f"Error in analyze_email_endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze-sms")
async def analyze_sms(request: SMSRequest):
    if not request.content:
        raise HTTPException(status_code=400, detail="SMS content is required")
    
    if not model or not vectorizer:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        result = analyze_sms_content(request.content)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "vectorizer_loaded": vectorizer is not None,
        "data_path": DATA_DIR,
        "model_path": MODEL_DIR,
        "dataset_path": DATASET_DIR,
        "training_data_file": TRAINING_DATA_FILE,
        "analysis_data_file": DATASET_FILE
    }

@app.post("/api/reviews")
async def create_review(review: ReviewRequest):
    try:
        review_data = review.dict()
        review_data["created_at"] = datetime.now()
        logger.info(f"Attempting to insert review: {review_data}")
        result = await reviews_collection.insert_one(review_data)
        logger.info(f"Review inserted with ID: {result.inserted_id}")

        created_review = await reviews_collection.find_one({"_id": result.inserted_id})
        if created_review:
            created_review["id"] = str(created_review["_id"])
            logger.info(f"Successfully retrieved and formatted review: {created_review}")
            return ReviewResponse(**created_review)
        else:
            logger.error("Failed to find created review after insertion.")
            raise HTTPException(status_code=500, detail="Failed to retrieve created review.")
    except Exception as e:
        logger.error(f"Error creating review: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@app.get("/api/reviews", response_model=List[ReviewResponse])
async def get_reviews():
    reviews = []
    try:
        logger.info("Attempting to fetch all reviews.")
        cursor = reviews_collection.find().sort("created_at", -1)
        async for review in cursor:
            review["id"] = str(review["_id"])
            reviews.append(ReviewResponse(**review))
        logger.info(f"Successfully fetched {len(reviews)} reviews.")
        return reviews
    except Exception as e:
        logger.error(f"Error fetching reviews: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

@app.get("/api/reviews/latest")
async def get_latest_reviews():
    reviews = []
    cursor = reviews_collection.find().sort("created_at", -1).limit(3)
    async for document in cursor:
        document["id"] = str(document["_id"])
        del document["_id"]
        reviews.append(document)
    return reviews

if __name__ == "__main__":
    import uvicorn
    # Run on all network interfaces (0.0.0.0) to allow mobile access
    uvicorn.run(app, host="0.0.0.0", port=8000) 
