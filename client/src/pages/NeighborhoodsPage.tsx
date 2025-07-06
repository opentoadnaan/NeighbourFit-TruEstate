import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Neighborhood {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  demographics: {
    totalPopulation: number;
    medianAge: number;
    medianIncome: number;
    diversityIndex: number;
    educationLevel: 'high' | 'medium' | 'low';
    familyFriendly: boolean;
  };
  amenities: {
    restaurants: number;
    cafes: number;
    bars: number;
    groceryStores: number;
    parks: number;
    gyms: number;
    schools: number;
    hospitals: number;
    shoppingCenters: number;
    entertainment: number;
  };
  safety: {
    crimeRate: number;
    safetyScore: number;
    policeStations: number;
    emergencyServices: number;
    wellLitStreets: boolean;
  };
  transportation: {
    walkabilityScore: number;
    transitScore: number;
    bikeScore: number;
    publicTransitStops: number;
    bikeLanes: number;
    parkingAvailability: 'high' | 'medium' | 'low';
  };
  lifestyle: {
    nightlife: number;
    familyActivities: number;
    outdoorActivities: number;
    culturalEvents: number;
    communityEngagement: number;
  };
  scores: {
    overall: number;
    safety: number;
    amenities: number;
    transportation: number;
    lifestyle: number;
    affordability: number;
  };
  lastUpdated: string;
}

const NeighborhoodsPage: React.FC = () => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    safetyScore: 0,
    walkabilityScore: 0,
    maxCrimeRate: 100,
    minAmenities: 0
  });

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  const fetchNeighborhoods = async () => {
    try {
      setLoading(true);
      // Using New York coordinates as default
      const response = await fetch('http://localhost:3001/api/neighborhoods?lat=40.7128&lng=-74.0060');
      const data = await response.json();
      
      if (data.success) {
        setNeighborhoods(data.data);
      } else {
        setError(data.error || 'Failed to fetch neighborhoods');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const filteredNeighborhoods = neighborhoods.filter(neighborhood => {
    const matchesSearch = neighborhood.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         neighborhood.location.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSafety = neighborhood.safety.safetyScore >= selectedFilters.safetyScore;
    const matchesWalkability = neighborhood.transportation.walkabilityScore >= selectedFilters.walkabilityScore;
    const matchesCrimeRate = neighborhood.safety.crimeRate <= selectedFilters.maxCrimeRate;
    
    const totalAmenities = Object.values(neighborhood.amenities).reduce((sum, value) => sum + value, 0);
    const matchesAmenities = totalAmenities >= selectedFilters.minAmenities;
    
    return matchesSearch && matchesSafety && matchesWalkability && matchesCrimeRate && matchesAmenities;
  });

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSafetyLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading neighborhoods...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Neighborhoods</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchNeighborhoods}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Explore Neighborhoods
            </h1>
            <p className="text-xl text-gray-600">
              Discover the perfect neighborhood for your lifestyle
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Neighborhoods
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or city..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Safety Score Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Safety Score
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedFilters.safetyScore}
                  onChange={(e) => setSelectedFilters(prev => ({
                    ...prev,
                    safetyScore: Number(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {selectedFilters.safetyScore}+
                </div>
              </div>

              {/* Walkability Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Walkability
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedFilters.walkabilityScore}
                  onChange={(e) => setSelectedFilters(prev => ({
                    ...prev,
                    walkabilityScore: Number(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {selectedFilters.walkabilityScore}+
                </div>
              </div>

              {/* Crime Rate Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Crime Rate
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedFilters.maxCrimeRate}
                  onChange={(e) => setSelectedFilters(prev => ({
                    ...prev,
                    maxCrimeRate: Number(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  ≤{selectedFilters.maxCrimeRate}
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredNeighborhoods.length} of {neighborhoods.length} neighborhoods
            </p>
          </div>

          {/* Neighborhoods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeighborhoods.map((neighborhood, index) => (
              <motion.div
                key={neighborhood.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {neighborhood.name}
                    </h3>
                    <div className={`text-sm font-medium ${getSafetyColor(neighborhood.safety.safetyScore)}`}>
                      {getSafetyLabel(neighborhood.safety.safetyScore)}
                    </div>
                  </div>
                  <p className="text-gray-600">
                    {neighborhood.location.city}, {neighborhood.location.state}
                  </p>
                </div>

                {/* Scores */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {neighborhood.scores.overall}
                      </div>
                      <div className="text-sm text-gray-500">Overall Score</div>
                    </div>
                    <div>
                      <div className={`text-2xl font-bold ${getSafetyColor(neighborhood.safety.safetyScore)}`}>
                        {neighborhood.safety.safetyScore}
                      </div>
                      <div className="text-sm text-gray-500">Safety</div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Population:</span>
                      <span className="font-medium">{neighborhood.demographics.totalPopulation.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Median Income:</span>
                      <span className="font-medium">${neighborhood.demographics.medianIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Walkability:</span>
                      <span className="font-medium">{neighborhood.transportation.walkabilityScore}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crime Rate:</span>
                      <span className="font-medium">{neighborhood.safety.crimeRate}/1000</span>
                    </div>
                  </div>

                  {/* Amenities Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Key Amenities:</div>
                    <div className="flex flex-wrap gap-1">
                      {neighborhood.amenities.restaurants > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {neighborhood.amenities.restaurants} Restaurants
                        </span>
                      )}
                      {neighborhood.amenities.parks > 0 && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {neighborhood.amenities.parks} Parks
                        </span>
                      )}
                      {neighborhood.amenities.schools > 0 && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {neighborhood.amenities.schools} Schools
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => window.location.href = `/neighborhood/${neighborhood.id}`}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {filteredNeighborhoods.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 text-6xl mb-4">🏘️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No neighborhoods found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search criteria or filters
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NeighborhoodsPage; 