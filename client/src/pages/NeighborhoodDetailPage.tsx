import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    ageGroups: {
      under18: number;
      age18to34: number;
      age35to49: number;
      age50to64: number;
      over65: number;
    };
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

const NeighborhoodDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchNeighborhoodDetails();
    }
  }, [id]);

  const fetchNeighborhoodDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/neighborhoods/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setNeighborhood(data.data);
      } else {
        setError(data.error || 'Failed to fetch neighborhood details');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getEducationColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getParkingColor = (availability: string) => {
    switch (availability) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600">Loading neighborhood details...</p>
        </div>
      </div>
    );
  }

  if (error || !neighborhood) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Neighborhood</h2>
          <p className="text-gray-600 mb-4">{error || 'Neighborhood not found'}</p>
          <button
            onClick={() => window.location.href = '/neighborhoods'}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Neighborhoods
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
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {neighborhood.name}
                </h1>
                <p className="text-xl text-gray-600 mb-4">
                  {neighborhood.location.city}, {neighborhood.location.state}
                </p>
                <p className="text-gray-500">
                  Last updated: {new Date(neighborhood.lastUpdated).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">
                  {neighborhood.scores.overall}
                </div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
            </div>
          </div>

          {/* Score Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety</h3>
              <div className={`text-3xl font-bold ${getScoreColor(neighborhood.safety.safetyScore)}`}>
                {neighborhood.safety.safetyScore}
              </div>
              <div className="text-sm text-gray-500 mb-4">{getScoreLabel(neighborhood.safety.safetyScore)}</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Crime Rate:</span>
                  <span>{neighborhood.safety.crimeRate}/1000</span>
                </div>
                <div className="flex justify-between">
                  <span>Police Stations:</span>
                  <span>{neighborhood.safety.policeStations}</span>
                </div>
                <div className="flex justify-between">
                  <span>Emergency Services:</span>
                  <span>{neighborhood.safety.emergencyServices}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transportation</h3>
              <div className={`text-3xl font-bold ${getScoreColor(neighborhood.transportation.walkabilityScore)}`}>
                {neighborhood.transportation.walkabilityScore}
              </div>
              <div className="text-sm text-gray-500 mb-4">Walkability Score</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transit Score:</span>
                  <span>{neighborhood.transportation.transitScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Bike Score:</span>
                  <span>{neighborhood.transportation.bikeScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Parking:</span>
                  <span className={getParkingColor(neighborhood.transportation.parkingAvailability)}>
                    {neighborhood.transportation.parkingAvailability}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lifestyle</h3>
              <div className={`text-3xl font-bold ${getScoreColor(neighborhood.lifestyle.nightlife)}`}>
                {neighborhood.lifestyle.nightlife}
              </div>
              <div className="text-sm text-gray-500 mb-4">Nightlife Score</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Family Activities:</span>
                  <span>{neighborhood.lifestyle.familyActivities}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Outdoor Activities:</span>
                  <span>{neighborhood.lifestyle.outdoorActivities}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Cultural Events:</span>
                  <span>{neighborhood.lifestyle.culturalEvents}/100</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Demographics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Demographics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {neighborhood.demographics.totalPopulation.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Total Population</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {neighborhood.demographics.medianAge}
                </div>
                <div className="text-sm text-gray-500">Median Age</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  ${neighborhood.demographics.medianIncome.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Median Income</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {neighborhood.demographics.diversityIndex.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">Diversity Index</div>
              </div>
            </div>

            {/* Age Distribution */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {((neighborhood.demographics.ageGroups.under18 / neighborhood.demographics.totalPopulation) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">Under 18</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {((neighborhood.demographics.ageGroups.age18to34 / neighborhood.demographics.totalPopulation) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">18-34</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {((neighborhood.demographics.ageGroups.age35to49 / neighborhood.demographics.totalPopulation) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">35-49</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {((neighborhood.demographics.ageGroups.age50to64 / neighborhood.demographics.totalPopulation) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">50-64</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {((neighborhood.demographics.ageGroups.over65 / neighborhood.demographics.totalPopulation) * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">65+</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Amenities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Local Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {neighborhood.amenities.restaurants}
                </div>
                <div className="text-sm text-gray-500">Restaurants</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {neighborhood.amenities.parks}
                </div>
                <div className="text-sm text-gray-500">Parks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {neighborhood.amenities.schools}
                </div>
                <div className="text-sm text-gray-500">Schools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {neighborhood.amenities.gyms}
                </div>
                <div className="text-sm text-gray-500">Gyms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {neighborhood.amenities.hospitals}
                </div>
                <div className="text-sm text-gray-500">Hospitals</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {neighborhood.amenities.cafes}
                </div>
                <div className="text-sm text-gray-500">Cafes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">
                  {neighborhood.amenities.bars}
                </div>
                <div className="text-sm text-gray-500">Bars</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {neighborhood.amenities.groceryStores}
                </div>
                <div className="text-sm text-gray-500">Grocery Stores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">
                  {neighborhood.amenities.shoppingCenters}
                </div>
                <div className="text-sm text-gray-500">Shopping Centers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600">
                  {neighborhood.amenities.entertainment}
                </div>
                <div className="text-sm text-gray-500">Entertainment</div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={() => window.location.href = '/matching'}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Find Similar Neighborhoods
            </button>
            <button
              onClick={() => window.location.href = '/neighborhoods'}
              className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200"
            >
              Back to All Neighborhoods
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NeighborhoodDetailPage; 