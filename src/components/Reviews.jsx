import React, { useState, useEffect } from 'react';
import { FaStar, FaUser } from 'react-icons/fa';
import '../styles/Reviews.css';

const API_BASE_URL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URL;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 0,
    comment: ''
  });
  const [error, setError] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate rating statistics
  const ratingStats = {
    average: reviews.length > 0 
      ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
      : 0,
    total: reviews.length,
    distribution: {
      5: reviews.filter(review => review.rating === 5).length,
      4: reviews.filter(review => review.rating === 4).length,
      3: reviews.filter(review => review.rating === 3).length,
      2: reviews.filter(review => review.rating === 2).length,
      1: reviews.filter(review => review.rating === 1).length,
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/api/reviews`);
      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.rating || !newReview.comment) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit review: ${response.status} ${response.statusText}`);
      }

      setNewReview({ name: '', rating: 0, comment: '' });
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarClick = (rating) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleStarHover = (rating) => {
    setHoveredStar(rating);
  };

  const handleStarLeave = () => {
    setHoveredStar(0);
  };

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h2>User Reviews</h2>
        <p>Share your experience with SafeMail</p>
      </div>

      <div className="review-form-container">
        <h3>Write a Review</h3>
        <form onSubmit={handleSubmit} className="review-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              value={newReview.name}
              onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label>Rating</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`star ${(hoveredStar || newReview.rating) >= star ? 'filled' : ''}`}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => handleStarHover(star)}
                  onMouseLeave={handleStarLeave}
                  style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Review</label>
            <textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with SafeMail"
              rows="4"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      <div className="all-reviews">
        <h3>All Reviews</h3>
        
        {/* Rating Statistics */}
        <div className="rating-stats">
          <div className="average-rating">
            <div className="rating-number">{ratingStats.average}</div>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={`star ${ratingStats.average >= star ? 'filled' : ''}`}
                />
              ))}
            </div>
            <div className="total-reviews">{ratingStats.total} reviews</div>
          </div>
          
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="rating-bar">
                <span className="rating-label">{rating} stars</span>
                <div className="bar-container">
                  <div 
                    className="bar-fill"
                    style={{ 
                      width: `${ratingStats.total > 0 
                        ? (ratingStats.distribution[rating] / ratingStats.total) * 100 
                        : 0}%` 
                    }}
                  />
                </div>
                <span className="rating-count">{ratingStats.distribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>

        {isLoading && reviews.length === 0 ? (
          <div className="loading-message">Loading reviews...</div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review, index) => (
              <div key={review._id || index} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <FaUser className="user-icon" />
                    <span className="reviewer-name">{review.name}</span>
                  </div>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map((star, starIndex) => (
                      <FaStar
                        key={starIndex}
                        className={`star ${review.rating >= star ? 'filled' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
                <div className="review-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews; 