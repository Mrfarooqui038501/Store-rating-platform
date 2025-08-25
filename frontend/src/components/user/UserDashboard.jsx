import React, { useState, useEffect } from 'react';
import { ratingAPI, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StoreList from './StoreList';
import LoadingSpinner from '../common/LoadingSpinner';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('stores');
  const [userRatings, setUserRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRatings: 0,
    averageRating: 0,
    ratingBreakdown: {}
  });
  const { user } = useAuth();

  useEffect(() => {
    if (activeTab === 'my-ratings') {
      fetchUserRatings();
    }
  }, [activeTab]);

  const fetchUserRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingAPI.getUserRatings();
      const ratings = response.data.data || [];
      setUserRatings(ratings);
      
      // Calculate stats
      const totalRatings = ratings.length;
      const averageRating = totalRatings > 0 
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0;
      
      const breakdown = ratings.reduce((acc, rating) => {
        acc[rating.rating] = (acc[rating.rating] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalRatings,
        averageRating,
        ratingBreakdown: breakdown
      });
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (!window.confirm('Are you sure you want to delete this rating?')) {
      return;
    }

    try {
      await ratingAPI.deleteRating(ratingId);
      fetchUserRatings(); // Refresh the list
    } catch (err) {
      setError(handleAPIError(err));
    }
  };

  const tabs = [
    { id: 'stores', name: 'Discover Stores', icon: '🏪' },
    { id: 'my-ratings', name: 'My Ratings', icon: '⭐' }
  ];

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600'
    };

    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-md ${colorClasses[color]} flex items-center justify-center`}>
                <span className="text-lg">{icon}</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                <dd className="text-lg font-medium text-gray-900">{value}</dd>
                {subtitle && <dd className="text-sm text-gray-500">{subtitle}</dd>}
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RatingCard = ({ rating, onDelete }) => {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{rating.store_name}</h3>
            <div className="mt-1 flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm text-gray-600">{rating.rating}/5</span>
            </div>
            
            {rating.comment && (
              <p className="mt-2 text-sm text-gray-700">{rating.comment}</p>
            )}
            
            <p className="mt-2 text-xs text-gray-500">
              Rated on {new Date(rating.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <button
            onClick={() => onDelete(rating.id)}
            className="ml-4 text-red-600 hover:text-red-800 text-sm"
            title="Delete rating"
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Discover great local stores and share your experiences
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'stores' && <StoreList />}

      {activeTab === 'my-ratings' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard
              title="Total Ratings"
              value={stats.totalRatings}
              subtitle="Reviews given"
              icon="📊"
              color="blue"
            />
            <StatCard
              title="Average Rating"
              value={stats.averageRating.toFixed(1)}
              subtitle="Your average score"
              icon="⭐"
              color="yellow"
            />
            <StatCard
              title="Stores Rated"
              value={stats.totalRatings}
              subtitle="Unique businesses"
              icon="🏪"
              color="green"
            />
          </div>

          {/* Rating Breakdown */}
          {stats.totalRatings > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Rating Distribution</h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = stats.ratingBreakdown[star] || 0;
                  const percentage = stats.totalRatings > 0 ? (count / stats.totalRatings * 100) : 0;
                  
                  return (
                    <div key={star} className="flex items-center">
                      <div className="flex items-center w-16">
                        <span className="text-sm font-medium text-gray-900">{star}</span>
                        <svg className="w-4 h-4 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="ml-3 text-sm text-gray-700 w-16 text-right">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Ratings List */}
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : userRatings.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Your Recent Reviews</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {userRatings.map((rating) => (
                  <RatingCard
                    key={rating.id}
                    rating={rating}
                    onDelete={handleDeleteRating}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No ratings yet</h3>
              <p className="text-gray-500 mb-4">
                Start exploring stores and share your experiences!
              </p>
              <button
                onClick={() => setActiveTab('stores')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Discover Stores
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;