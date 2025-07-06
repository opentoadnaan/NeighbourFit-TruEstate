import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface UserPreferences {
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  budget: {
    min: number;
    max: number;
  };
  priorities: {
    safety: number;
    amenities: number;
    transportation: number;
    lifestyle: number;
    affordability: number;
    familyFriendly: number;
    nightlife: number;
    quietness: number;
  };
  lifestyle: {
    ageGroup: 'young' | 'family' | 'senior' | 'mixed';
    activityLevel: 'low' | 'medium' | 'high';
    socialPreference: 'introvert' | 'extrovert' | 'balanced';
    workStyle: 'remote' | 'office' | 'hybrid';
  };
  mustHaves: string[];
  dealBreakers: string[];
}

interface MatchingResult {
  neighborhood: {
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
  };
  compatibilityScore: number;
  matchReasons: string[];
  potentialConcerns: string[];
  recommendations: string[];
}

const MatchingPage: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    checkExistingPreferences();
  }, []);

  const checkExistingPreferences = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/preferences');
      const data = await response.json();
      
      if (data.success && data.data) {
        setPreferences(data.data);
        setHasPreferences(true);
      }
    } catch (err) {
      console.log('No existing preferences found');
    }
  };

  const handleFindMatches = async () => {
    if (!preferences) {
      setError('Please set your preferences first');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (data.success) {
        setMatchingResults(data.data);
      } else {
        setError(data.error || 'Failed to find matches');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'safety':
        return 'bg-red-100 text-red-800';
      case 'amenities':
        return 'bg-blue-100 text-blue-800';
      case 'transportation':
        return 'bg-green-100 text-green-800';
      case 'lifestyle':
        return 'bg-purple-100 text-purple-800';
      case 'affordability':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!hasPreferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-gray-400 text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Set Your Preferences First
            </h2>
            <p className="text-gray-600 mb-6">
              To find your perfect neighborhood match, we need to know your preferences.
            </p>
            <button
              onClick={() => window.location.href = '/preferences'}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
            >
              Set Preferences
            </button>
          </motion.div>
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
              Find Your Perfect Match
            </h1>
            <p className="text-xl text-gray-600">
              Discover neighborhoods that align with your lifestyle and preferences
            </p>
          </div>

          {/* Action Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleFindMatches}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Finding Matches...
                </div>
              ) : (
                'Find My Matches'
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Results */}
          {matchingResults.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Your Top Matches
                </h2>
                <p className="text-gray-600">
                  Found {matchingResults.length} neighborhoods that match your preferences
                </p>
              </div>

              {matchingResults.map((result, index) => (
                <motion.div
                  key={result.neighborhood.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                          {result.neighborhood.name}
                        </h3>
                        <p className="text-gray-600">
                          {result.neighborhood.location.city}, {result.neighborhood.location.state}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getCompatibilityColor(result.compatibilityScore)}`}>
                          {result.compatibilityScore}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {getCompatibilityLabel(result.compatibilityScore)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Match Reasons */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Why This Matches</h4>
                        <ul className="space-y-2">
                          {result.matchReasons.map((reason, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-green-500 mr-2">✓</span>
                              <span className="text-gray-700">{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Potential Concerns */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Considerations</h4>
                        {result.potentialConcerns.length > 0 ? (
                          <ul className="space-y-2">
                            {result.potentialConcerns.map((concern, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-yellow-500 mr-2">⚠</span>
                                <span className="text-gray-700">{concern}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No major concerns identified</p>
                        )}
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
                        <ul className="space-y-2">
                          {result.recommendations.map((recommendation, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-blue-500 mr-2">💡</span>
                              <span className="text-gray-700">{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Neighborhood Overview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {result.neighborhood.scores.overall}
                          </div>
                          <div className="text-sm text-gray-500">Overall Score</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getCompatibilityColor(result.neighborhood.safety.safetyScore)}`}>
                            {result.neighborhood.safety.safetyScore}
                          </div>
                          <div className="text-sm text-gray-500">Safety</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {result.neighborhood.transportation.walkabilityScore}
                          </div>
                          <div className="text-sm text-gray-500">Walkability</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            ${result.neighborhood.demographics.medianIncome.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">Median Income</div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex gap-4">
                      <button
                        onClick={() => window.location.href = `/neighborhood/${result.neighborhood.id}`}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => window.location.href = '/neighborhoods'}
                        className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-all duration-200"
                      >
                        Compare Others
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* No Results */}
          {matchingResults.length === 0 && !loading && !error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 text-6xl mb-4">🏘️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Find Your Match?
              </h3>
              <p className="text-gray-600">
                Click the button above to discover neighborhoods that match your preferences
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MatchingPage; 