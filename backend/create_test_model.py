from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
import joblib
import numpy as np

# Create some sample data
texts = [
    "URGENT: Your account needs verification",
    "Congratulations! You've won a prize",
    "Your package has been delivered",
    "Meeting reminder for tomorrow",
    "Your subscription is expiring soon",
    "Click here to claim your reward",
    "Your order has been shipped",
    "Please verify your email address",
    "Your payment was successful",
    "Free gift card waiting for you"
]

# Create labels (0 for safe, 1 for spam)
labels = np.array([1, 1, 0, 0, 0, 1, 0, 0, 0, 1])

# Create and fit the vectorizer
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

# Create and fit the model
model = MultinomialNB()
model.fit(X, labels)

# Save the model and vectorizer
joblib.dump(model, 'sms_spam_model.pkl')
joblib.dump(vectorizer, 'sms_vectorizer.pkl')

print("Model and vectorizer have been created successfully!") 