# SafeMail - Email Spam Detection System

A modern web application for detecting spam emails using machine learning.

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/Jinang12/safemail.git
cd safemail
```

2. Download Required Data Files:
   - Download the spam email dataset from [here](https://www.kaggle.com/datasets/balaka18/email-spam-classification-dataset-csv)
   - Place the `spam_Emails_data.csv` file in:
     - `backend/data/` for backend processing
     - `public/` for frontend access

3. Start the application using Docker:
```bash
docker-compose up --build
```

## Features

- Real-time email spam detection
- Modern React frontend with Tailwind CSS
- FastAPI backend with machine learning integration
- MongoDB database for storing results
- Docker containerization for easy deployment

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: FastAPI, Python
- Database: MongoDB
- Containerization: Docker

## Development

- Frontend runs on: http://localhost:5173
- Backend API runs on: http://localhost:8000
- MongoDB runs on: mongodb://localhost:27017

## License

MIT License
