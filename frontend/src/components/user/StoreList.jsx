import React, { useState, useEffect } from 'react';
import { storeAPI, ratingAPI, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [userRatings, setUserRatings] = useState({});
  const [submittingRating, setSubmittingRating] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStores();
    if (user) {
      fetchUserRatings();
    }
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getAllStores();
      setStores(response.data.data || []);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      const response = await ratingAPI.getUserRatings();
      const ratingsMap = {};
      response.data.data.forEach(rating => {
        ratingsMap[rating.store_id] = rating;
      });
      setUserRatings(ratingsMap);
    } catch (err) {
      console.error('Failed to fetch user ratings:', err);
    }
  };

  const handleRatingSubmit = async (storeId, rating, comment = '') => {
    try {
      setSubmittingRating(storeId);
      
      const existingRating = userRatings[storeId];
      
      if (existingRating) {
        // Update existing rating
        await ratingAPI.updateRating(existingRating.id, { rating, comment });
      } else {
        // Create new rating
        await ratingAPI.submitRating({ store_id: storeId, rating, comment });
      }
      
      // Refresh user ratings and stores
      await Promise.all([fetchUserRatings(), fetchStores()]);
      
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setSubmittingRating(null);
    }
  };

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (ratingFilter === 'all') return matchesSearch;
    
    const minRating = parseInt(ratingFilter);
    const storeRating = store.average_rating || 0;
    
    return matchesSearch && storeRating >= minRating;
  });

  const StarRating = ({ storeId, currentRating = 0, userRating = null, onRate }) => {
    const [hoveredRating, setHoveredRating] = useState(0);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [comment, setComment] = useState(userRating?.comment || '');

    const handleStarClick = (rating) => {
      if (submittingRating === storeId) return;
      
      setShowCommentBox(true);
    };

    const handleSubmit = () => {
      const rating = hoveredRating || userRating?.rating || 1;
      onRate(storeId, rating, comment);
      setShowCommentBox(false);
      setHoveredRating(0);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`w-6 h-6 ${
                star <= (hoveredRating || userRating?.rating || 0)
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleStarClick(star)}
              disabled={submittingRating === storeId}
            >
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {userRating ? 'Your rating' : 'Click to rate'}
          </span>
        </div>

        {showCommentBox && (
          <div className="p-3 bg-gray-50 rounded-md">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)"
              className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
              rows="2"
            />
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleSubmit}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                disabled={submittingRating === storeId}
              >
                {submittingRating === storeId ? 'Saving...' : 'Submit Rating'}
              </button>
              <button
                onClick={() => setShowCommentBox(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Stores</h2>
        <p className="mt-1 text-sm text-gray-600">
          Discover and rate local stores
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Ratings</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Stars</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Stores Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredStores.map((store) => (
          <div key={store.id} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {store.name}
                </h3>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {store.average_rating ? store.average_rating.toFixed(1) : 'No ratings'}
                  </span>
                </div>
              </div>
              
              <p className="mt-2 text-sm text-gray-600">{store.description}</p>
              
              <div className="mt-2 text-sm text-gray-500">
                📍 {store.address}
              </div>
              
              {store.phone && (
                <div className="mt-1 text-sm text-gray-500">
                  📞 {store.phone}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-400">
                Total Ratings: {store.total_ratings || 0}
              </div>

              {/* Rating Section */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <StarRating
                  storeId={store.id}
                  currentRating={store.average_rating}
                  userRating={userRatings[store.id]}
                  onRate={handleRatingSubmit}
                />
                
                {userRatings[store.id]?.comment && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-gray-700">
                    <strong>Your comment:</strong> {userRatings[store.id].comment}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default StoreList;