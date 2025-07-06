import React, { useState } from 'react';
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

const PreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
      city: '',
      state: '',
      zipCode: ''
    },
    budget: {
      min: 0,
      max: 0
    },
    priorities: {
      safety: 5,
      amenities: 5,
      transportation: 5,
      lifestyle: 5,
      affordability: 5,
      familyFriendly: 5,
      nightlife: 5,
      quietness: 5
    },
    lifestyle: {
      ageGroup: 'mixed',
      activityLevel: 'medium',
      socialPreference: 'balanced',
      workStyle: 'hybrid'
    },
    mustHaves: [],
    dealBreakers: []
  });

  const [newMustHave, setNewMustHave] = useState('');
  const [newDealBreaker, setNewDealBreaker] = useState('');

  const handlePriorityChange = (priority: keyof UserPreferences['priorities'], value: number) => {
    setPreferences(prev => ({
      ...prev,
      priorities: {
        ...prev.priorities,
        [priority]: value
      }
    }));
  };

  const handleLifestyleChange = (field: keyof UserPreferences['lifestyle'], value: any) => {
    setPreferences(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [field]: value
      }
    }));
  };

  const addMustHave = () => {
    if (newMustHave.trim()) {
      setPreferences(prev => ({
        ...prev,
        mustHaves: [...prev.mustHaves, newMustHave.trim()]
      }));
      setNewMustHave('');
    }
  };

  const removeMustHave = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      mustHaves: prev.mustHaves.filter((_, i) => i !== index)
    }));
  };

  const addDealBreaker = () => {
    if (newDealBreaker.trim()) {
      setPreferences(prev => ({
        ...prev,
        dealBreakers: [...prev.dealBreakers, newDealBreaker.trim()]
      }));
      setNewDealBreaker('');
    }
  };

  const removeDealBreaker = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      dealBreakers: prev.dealBreakers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      if (response.ok) {
        alert('Preferences saved successfully!');
      } else {
        alert('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Error saving preferences');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Set Your Preferences
            </h1>
            <p className="text-xl text-gray-600">
              Tell us what matters most to you in a neighborhood
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Location Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={preferences.location.city || ''}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      location: { ...prev.location, city: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    value={preferences.location.state || ''}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      location: { ...prev.location, state: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your state"
                  />
                </div>
              </div>
            </motion.div>

            {/* Budget Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Budget Range</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Budget
                  </label>
                  <input
                    type="number"
                    value={preferences.budget.min}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      budget: { ...prev.budget, min: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Budget
                  </label>
                  <input
                    type="number"
                    value={preferences.budget.max}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      budget: { ...prev.budget, max: Number(e.target.value) }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </motion.div>

            {/* Priorities Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Priorities (1-10)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(preferences.priorities).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={value}
                      onChange={(e) => handlePriorityChange(key as keyof UserPreferences['priorities'], Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span className="font-medium">{value}</span>
                      <span>10</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Lifestyle Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Lifestyle</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age Group
                  </label>
                  <select
                    value={preferences.lifestyle.ageGroup}
                    onChange={(e) => handleLifestyleChange('ageGroup', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="young">Young Professional</option>
                    <option value="family">Family</option>
                    <option value="senior">Senior</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={preferences.lifestyle.activityLevel}
                    onChange={(e) => handleLifestyleChange('activityLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Preference
                  </label>
                  <select
                    value={preferences.lifestyle.socialPreference}
                    onChange={(e) => handleLifestyleChange('socialPreference', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="introvert">Introvert</option>
                    <option value="extrovert">Extrovert</option>
                    <option value="balanced">Balanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Style
                  </label>
                  <select
                    value={preferences.lifestyle.workStyle}
                    onChange={(e) => handleLifestyleChange('workStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="remote">Remote</option>
                    <option value="office">Office</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Must Haves Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Must Haves</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newMustHave}
                  onChange={(e) => setNewMustHave(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a must-have feature"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMustHave())}
                />
                <button
                  type="button"
                  onClick={addMustHave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.mustHaves.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeMustHave(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Deal Breakers Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Deal Breakers</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newDealBreaker}
                  onChange={(e) => setNewDealBreaker(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a deal breaker"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDealBreaker())}
                />
                <button
                  type="button"
                  onClick={addDealBreaker}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {preferences.dealBreakers.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800"
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeDealBreaker(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105 transition-all duration-200"
              >
                Save Preferences
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default PreferencesPage; 