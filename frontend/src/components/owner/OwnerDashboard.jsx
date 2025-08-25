import React, { useState, useEffect } from 'react';
import { storeAPI, ratingAPI, handleAPIError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeRatings, setStoreRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    description: '',
    address: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchOwnerStores();
  }, []);

  useEffect(() => {
    if (selectedStore && activeTab === 'ratings') {
      fetchStoreRatings(selectedStore.id);
    }
  }, [selectedStore, activeTab]);

  const fetchOwnerStores = async () => {
    try {
      setLoading(true);
      const response = await storeAPI.getAllStores({ owner_id: user.id });
      const ownerStores = response.data.data || [];
      setStores(ownerStores);
      if (ownerStores.length > 0 && !selectedStore) {
        setSelectedStore(ownerStores[0]);
      }
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreRatings = async (storeId) => {
    try {
      const response = await storeAPI.getStoreRatings(storeId);
      setStoreRatings(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch store ratings:', err);
      setStoreRatings([]);
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await storeAPI.createStore(newStore);
      setNewStore({ name: '', description: '', address: '', phone: '' });
      setShowAddStore(false);
      fetchOwnerStores();
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStore = async (storeId, updatedData) => {
    try {
      await storeAPI.updateStore(storeId, updatedData);
      fetchOwnerStores();
    } catch (err) {
      setError(handleAPIError(err));
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (!window.confirm('Are you sure you want to delete this store? This action cannot be undone.')) {
      return;
    }

    try {
      await storeAPI.deleteStore(storeId);
      fetchOwnerStores();
      if (selectedStore?.id === storeId) {
        setSelectedStore(stores.find(s => s.id !== storeId) || null);
      }
    } catch (err) {
      setError(handleAPIError(err));
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'stores', name: 'My Stores', icon: '🏪' },
    { id: 'ratings', name: 'Customer Reviews', icon: '⭐' }
  ];

  const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600',
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

  const calculateStoreStats = () => {
    const totalStores = stores.length;
    const totalRatings = stores.reduce((sum, store) => sum + (store.total_ratings || 0), 0);
    const averageRating = totalRatings > 0 
      ? stores.reduce((sum, store) => sum + ((store.average_rating || 0) * (store.total_ratings || 0)), 0) / totalRatings 
      : 0;
    
    return { totalStores, totalRatings, averageRating };
  };

  const stats = calculateStoreStats();

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
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Store Owner Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your stores and track customer feedback
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <StatCard
              title="Total Stores"
              value={stats.totalStores}
              subtitle="Your businesses"
              icon="🏪"
              color="blue"
            />
            <StatCard
              title="Total Reviews"
              value={stats.totalRatings}
              subtitle="Customer feedback"
              icon="⭐"
              color="yellow"
            />
            <StatCard
              title="Average Rating"
              value={stats.averageRating.toFixed(1)}
              subtitle="Across all stores"
              icon="📊"
              color="green"
            />
          </div>

          {/* Recent Stores */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Your Stores Performance
              </h3>
              {stores.length > 0 ? (
                <div className="space-y-4">
                  {stores.map((store) => (
                    <div key={store.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{store.name}</h4>
                        <p className="text-sm text-gray-600">{store.address}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="font-medium">
                            {store.average_rating ? store.average_rating.toFixed(1) : 'No ratings'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {store.total_ratings || 0} reviews
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <h4 className="text-lg font-medium text-gray-900">No stores yet</h4>
                  <p className="text-gray-500 mt-1">Add your first store to get started</p>
                  <button
                    onClick={() => setActiveTab('stores')}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Store
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stores Tab */}
      {activeTab === 'stores' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">My Stores</h3>
            <button
              onClick={() => setShowAddStore(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add New Store
            </button>
          </div>

          {/* Add Store Form */}
          {showAddStore && (
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Store</h4>
              <form onSubmit={handleAddStore} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Store Name</label>
                    <input
                      type="text"
                      required
                      value={newStore.name}
                      onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={newStore.phone}
                      onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    required
                    value={newStore.address}
                    onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    value={newStore.description}
                    onChange={(e) => setNewStore({ ...newStore, description: e.target.value })}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? 'Adding...' : 'Add Store'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddStore(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Stores List */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <div key={store.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 truncate">{store.name}</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedStore(store)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                      title="View details"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => handleDeleteStore(store.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Delete store"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{store.description}</p>
                <p className="text-sm text-gray-500 mb-2">📍 {store.address}</p>
                {store.phone && (
                  <p className="text-sm text-gray-500 mb-2">📞 {store.phone}</p>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-medium">
                      {store.average_rating ? store.average_rating.toFixed(1) : 'No ratings'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {store.total_ratings || 0} reviews
                  </span>
                </div>
              </div>
            ))}
          </div>

          {stores.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stores yet</h3>
              <p className="text-gray-500 mb-4">
                Add your first store to start receiving customer reviews
              </p>
              <button
                onClick={() => setShowAddStore(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Your First Store
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ratings Tab */}
      {activeTab === 'ratings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
            {stores.length > 1 && (
              <select
                value={selectedStore?.id || ''}
                onChange={(e) => {
                  const store = stores.find(s => s.id === parseInt(e.target.value));
                  setSelectedStore(store);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedStore ? (
            <div className="space-y-4">
              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">{selectedStore.name}</h4>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg font-medium">
                      {selectedStore.average_rating ? selectedStore.average_rating.toFixed(1) : 'No ratings'}
                    </span>
                  </div>
                  <span className="text-gray-500">
                    ({selectedStore.total_ratings || 0} reviews)
                  </span>
                </div>
              </div>

              {storeRatings.length > 0 ? (
                <div className="space-y-4">
                  {storeRatings.map((rating) => (
                    <div key={rating.id} className="bg-white shadow rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center mr-3">
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
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {rating.user_name || 'Anonymous'}
                            </span>
                          </div>
                          
                          {rating.comment && (
                            <p className="text-gray-700 mb-2">{rating.comment}</p>
                          )}
                          
                          <p className="text-xs text-gray-500">
                            {new Date(rating.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⭐</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                  <p className="text-gray-500">
                    This store hasn't received any customer reviews yet.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stores available</h3>
              <p className="text-gray-500 mb-4">
                Add a store first to view customer reviews
              </p>
              <button
                onClick={() => setActiveTab('stores')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Add Store
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;