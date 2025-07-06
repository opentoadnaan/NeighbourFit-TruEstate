import { UserPreferences, Location } from '../types';

/**
 * Service for managing user preferences
 * Uses in-memory storage for demo purposes
 */
export class PreferenceService {
  private static preferences = new Map<string, UserPreferences>();

  /**
   * Get user preferences by user ID
   */
  static getUserPreferences(userId: string): UserPreferences | null {
    return this.preferences.get(userId) || null;
  }

  /**
   * Save or update user preferences
   */
  static saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): UserPreferences {
    const existing = this.getUserPreferences(userId);
    
    const updatedPreferences: UserPreferences = {
      id: userId,
      location: preferences.location || existing?.location || this.getDefaultLocation(),
      budget: preferences.budget || existing?.budget || { min: 50000, max: 150000 },
      priorities: {
        safety: preferences.priorities?.safety || existing?.priorities?.safety || 8,
        amenities: preferences.priorities?.amenities || existing?.priorities?.amenities || 7,
        transportation: preferences.priorities?.transportation || existing?.priorities?.transportation || 6,
        lifestyle: preferences.priorities?.lifestyle || existing?.priorities?.lifestyle || 7,
        affordability: preferences.priorities?.affordability || existing?.priorities?.affordability || 8,
        familyFriendly: preferences.priorities?.familyFriendly || existing?.priorities?.familyFriendly || 5,
        nightlife: preferences.priorities?.nightlife || existing?.priorities?.nightlife || 6,
        quietness: preferences.priorities?.quietness || existing?.priorities?.quietness || 5
      },
      lifestyle: {
        ageGroup: preferences.lifestyle?.ageGroup || existing?.lifestyle?.ageGroup || 'mixed',
        activityLevel: preferences.lifestyle?.activityLevel || existing?.lifestyle?.activityLevel || 'medium',
        socialPreference: preferences.lifestyle?.socialPreference || existing?.lifestyle?.socialPreference || 'balanced',
        workStyle: preferences.lifestyle?.workStyle || existing?.lifestyle?.workStyle || 'hybrid'
      },
      mustHaves: preferences.mustHaves || existing?.mustHaves || [],
      dealBreakers: preferences.dealBreakers || existing?.dealBreakers || []
    };

    this.preferences.set(userId, updatedPreferences);
    return updatedPreferences;
  }

  /**
   * Generate default preferences for a new user
   */
  static generateDefaultPreferences(userId: string): UserPreferences {
    const defaultPreferences: UserPreferences = {
      id: userId,
      location: this.getDefaultLocation(),
      budget: {
        min: 50000,
        max: 150000
      },
      priorities: {
        safety: 8,
        amenities: 7,
        transportation: 6,
        lifestyle: 7,
        affordability: 8,
        familyFriendly: 5,
        nightlife: 6,
        quietness: 5
      },
      lifestyle: {
        ageGroup: 'mixed',
        activityLevel: 'medium',
        socialPreference: 'balanced',
        workStyle: 'hybrid'
      },
      mustHaves: ['Grocery store nearby', 'Public transportation'],
      dealBreakers: ['High crime rate', 'Poor school ratings']
    };

    this.preferences.set(userId, defaultPreferences);
    return defaultPreferences;
  }

  /**
   * Get default location (New York City)
   */
  private static getDefaultLocation(): Location {
    return {
      latitude: 40.7128,
      longitude: -74.0060,
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    };
  }

  /**
   * Delete user preferences
   */
  static deleteUserPreferences(userId: string): boolean {
    return this.preferences.delete(userId);
  }

  /**
   * Get all user IDs with preferences
   */
  static getAllUserIds(): string[] {
    return Array.from(this.preferences.keys());
  }

  /**
   * Clear all preferences (for testing)
   */
  static clearAllPreferences(): void {
    this.preferences.clear();
  }
} 