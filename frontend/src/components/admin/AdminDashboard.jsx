import React, { useState, useEffect } from 'react';
import { userAPI, storeAPI, ratingAPI } from '../../services/api';
import UserManagement from './UserManagement';
import StoreManagement from './StoreManagement';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    users: {},
    stores: {},
    ratings: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [userStats, storeStats, ratingStats] = await Promise.all([
        userAPI.getUserStats(),
        storeAPI.getStoreStats(),
        ratingAPI.getRatingStats()
      ]);

      setStats({
        users: userStats.data.data,
        stores: storeStats.data.data,
        ratings: ratingStats.data.data
      });
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'users', name: 'User Management', icon: '👥' },
    { id: 'stores', name: 'Store Management', icon: '🏪' }
  ];

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600'
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
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage users, stores, and view system statistics
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
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats.users.total_users_count || 0}
              subtitle="All registered users"
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Normal Users"
              value={stats.users.normal_users_count || 0}
              subtitle="Regular customers"
              icon="👤"
              color="green"
            />
            <StatCard
              title="Store Owners"
              value={stats.users.store_owners_count || 0}
              subtitle="Business owners"
              icon="🏪"
              color="purple"
            />
            <StatCard
              title="System Admins"
              value={stats.users.admin_users_count || 0}
              subtitle="System administrators"
              icon="⚙️"
              color="red"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Total Stores"
              value={stats.stores.total_stores || 0}
              subtitle="Registered businesses"
              icon="🏬"
              color="blue"
            />
            <StatCard
              title="Total Ratings"
              value={stats.ratings.total_ratings || 0}
              subtitle="Customer reviews"
              icon="⭐"
              color="yellow"
            />
            <StatCard
              title="Average Rating"
              value={stats.ratings.overall_average_rating || 0}
              subtitle="System-wide average"
              icon="📊"
              color="green"
            />
          </div>

          {/* Rating Distribution */}
          {stats.ratings.total_ratings > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Rating Distribution
                </h3>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.ratings[`${star === 1 ? 'one' : star === 2 ? 'two' : star === 3 ? 'three' : star === 4 ? 'four' : 'five'}_star_count`] || 0;
                    const percentage = stats.ratings.total_ratings > 0 ? (count / stats.ratings.total_ratings * 100) : 0;
                    
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
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && <UserManagement onStatsUpdate={fetchStats} />}
      {activeTab === 'stores' && <StoreManagement onStatsUpdate={fetchStats} />}
    </div>
  );
};

export default AdminDashboard;