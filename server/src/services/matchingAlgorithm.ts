import { Neighborhood, UserPreferences, MatchingResult } from '../types';

/**
 * Core matching algorithm for NeighborFit
 * Implements weighted scoring system based on user preferences
 */
export class MatchingAlgorithm {
  private static readonly WEIGHT_MULTIPLIER = 10;
  private static readonly MAX_SCORE = 100;

  /**
   * Calculate compatibility score between user preferences and neighborhood
   */
  static calculateCompatibility(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): number {
    const scores = {
      safety: this.calculateSafetyScore(preferences, neighborhood),
      amenities: this.calculateAmenitiesScore(preferences, neighborhood),
      transportation: this.calculateTransportationScore(preferences, neighborhood),
      lifestyle: this.calculateLifestyleScore(preferences, neighborhood),
      affordability: this.calculateAffordabilityScore(preferences, neighborhood),
      familyFriendly: this.calculateFamilyFriendlyScore(preferences, neighborhood),
      nightlife: this.calculateNightlifeScore(preferences, neighborhood),
      quietness: this.calculateQuietnessScore(preferences, neighborhood)
    };

    const weights = preferences.priorities;
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

    let weightedScore = 0;
    for (const [category, score] of Object.entries(scores)) {
      const weight = weights[category as keyof typeof weights] || 5;
      weightedScore += (score * weight) / totalWeight;
    }

    return Math.round(weightedScore);
  }

  /**
   * Generate comprehensive matching result with insights
   */
  static generateMatchingResult(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): MatchingResult {
    const compatibilityScore = this.calculateCompatibility(preferences, neighborhood);
    
    return {
      neighborhood,
      compatibilityScore,
      matchReasons: this.generateMatchReasons(preferences, neighborhood),
      potentialConcerns: this.generatePotentialConcerns(preferences, neighborhood),
      recommendations: this.generateRecommendations(preferences, neighborhood)
    };
  }

  /**
   * Calculate safety compatibility score
   */
  private static calculateSafetyScore(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): number {
    const safetyWeight = preferences.priorities.safety;
    const safetyScore = neighborhood.safety.safetyScore;
    
    // Bonus for low crime rate
    const crimeBonus = Math.max(0, (50 - neighborhood.safety.crimeRate) / 50) * 10;
    
    return Math.min(this.MAX_SCORE, safetyScore + crimeBonus);
  }

  /**
   * Calculate amenities compatibility score
   */
  private static calculateAmenitiesScore(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): number {
    const amenitiesWeight = preferences.priorities.amenities;
    const totalAmenities = Object.values(neighborhood.amenities).reduce((sum, count) => sum + count, 0);
    
    // Normalize amenities count to 0-100 scale
    const normalizedAmenities = Math.min(100, (totalAmenities / 50) * 100);
    
    return normalizedAmenities;
  }

  /**
   * Calculate transportation compatibility score
   */
  private static calculateTransportationScore(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): number {
    const { transportation } = neighborhood;
    
    // Weighted average of different transportation scores
    const walkabilityWeight = 0.4;
    const transitWeight = 0.3;
    const bikeWeight = 0.3;
    
    return Math.round(
      transportation.walkabilityScore * walkabilityWeight +
      transportation.transitScore * transitWeight +
      transportation.bikeScore * bikeWeight
    );
  }

  /**
   * Calculate lifestyle compatibility score
   */
  private static calculateLifestyleScore(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): number {
    const { lifestyle } = neighborhood;
    const userLifestyle = preferences.lifestyle;
    
    let score = 0;
    
    // Age group compatibility
    const ageGroupScore = this.calculateAgeGroupCompatibility(userLifestyle.ageGroup, neighborhood.demographics);
    score += ageGroupScore * 0.3;
    
    // Activity level compatibility
    const activityScore = this.calculateActivityCompatibility(userLifestyle.activityLevel, lifestyle);
    score += activityScore * 0.3;
    
    // Social preference compatibility
    const socialScore = this.calculateSocialCompatibility(userLifestyle.socialPreference, lifestyle);
    score += socialScore * 0.4;
    
    return Math.round(score);
  }

  /**
   * Calculate affordability compatibility score
   */
  private static calculateAffordabilityScore(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): number {
    const { budget } = preferences;
    const { medianIncome } = neighborhood.demographics;
    
    // Estimate housing cost based on median income (rough approximation)
    const estimatedHousingCost = medianIncome * 0.3; // 30% of income typically goes to housing
    
    if (estimatedHousingCost <= budget.max && estimatedHousingCost >= budget.min) {
      return 100; // Perfect match
    } else if (estimatedHousingCost <= budget.max * 1.2) {
      return 80; // Slightly over budget but manageable
    } else if (estimatedHousingCost <= budget.max * 1.5) {
      return 50; // Over budget but possible with lifestyle changes
    } else {
      return 20; // Significantly over budget
    }
  }

  /**
   * Calculate family-friendly compatibility score
   */
  private static calculateFamilyFriendlyScore(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): number {
    const { demographics, amenities } = neighborhood;
    
    let score = 0;
    
    // Schools
    score += Math.min(25, amenities.schools * 5);
    
    // Parks and family activities
    score += Math.min(25, (amenities.parks + neighborhood.lifestyle.familyActivities) * 2);
    
    // Demographics (percentage of families)
    const familyPercentage = (demographics.ageGroups.under18 + demographics.ageGroups.age35to49) / demographics.totalPopulation;
    score += familyPercentage * 50;
    
    return Math.round(score);
  }

  /**
   * Calculate nightlife compatibility score
   */
  private static calculateNightlifeScore(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): number {
    const { amenities, lifestyle } = neighborhood;
    
    let score = 0;
    
    // Bars and restaurants
    score += Math.min(40, (amenities.bars + amenities.restaurants) * 2);
    
    // Nightlife lifestyle score
    score += lifestyle.nightlife * 0.6;
    
    return Math.round(score);
  }

  /**
   * Calculate quietness compatibility score
   */
  private static calculateQuietnessScore(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): number {
    const { lifestyle, amenities } = neighborhood;
    
    // Inverse relationship with nightlife and entertainment
    const noiseFactors = (lifestyle.nightlife + amenities.entertainment) / 2;
    const quietnessScore = Math.max(0, 100 - noiseFactors);
    
    return Math.round(quietnessScore);
  }

  /**
   * Calculate age group compatibility
   */
  private static calculateAgeGroupCompatibility(
    userAgeGroup: string,
    demographics: any
  ): number {
    const { ageGroups, totalPopulation } = demographics;
    
    switch (userAgeGroup) {
      case 'young':
        return ((ageGroups.age18to34) / totalPopulation) * 100;
      case 'family':
        return ((ageGroups.age35to49 + ageGroups.under18) / totalPopulation) * 100;
      case 'senior':
        return ((ageGroups.over65) / totalPopulation) * 100;
      case 'mixed':
        return 75; // Good for mixed demographics
      default:
        return 50;
    }
  }

  /**
   * Calculate activity level compatibility
   */
  private static calculateActivityCompatibility(
    userActivityLevel: string,
    lifestyle: any
  ): number {
    const outdoorScore = lifestyle.outdoorActivities;
    const culturalScore = lifestyle.culturalEvents;
    
    switch (userActivityLevel) {
      case 'high':
        return Math.round((outdoorScore + culturalScore) / 2);
      case 'medium':
        return Math.round((outdoorScore + culturalScore + 50) / 3);
      case 'low':
        return Math.round((100 - outdoorScore + 100 - culturalScore) / 2);
      default:
        return 50;
    }
  }

  /**
   * Calculate social preference compatibility
   */
  private static calculateSocialCompatibility(
    socialPreference: string,
    lifestyle: any
  ): number {
    const communityScore = lifestyle.communityEngagement;
    const nightlifeScore = lifestyle.nightlife;
    
    switch (socialPreference) {
      case 'extrovert':
        return Math.round((communityScore + nightlifeScore) / 2);
      case 'introvert':
        return Math.round((100 - communityScore + 100 - nightlifeScore) / 2);
      case 'balanced':
        return Math.round((communityScore + (100 - nightlifeScore)) / 2);
      default:
        return 50;
    }
  }

  /**
   * Generate match reasons based on compatibility analysis
   */
  private static generateMatchReasons(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): string[] {
    const reasons: string[] = [];
    
    // Safety analysis
    if (neighborhood.safety.safetyScore > 80) {
      reasons.push('Excellent safety ratings');
    }
    
    // Amenities analysis
    let totalAmenities = 0;
    for (const value of Object.values(neighborhood.amenities)) {
      totalAmenities += value as number;
    }
    if (totalAmenities > 30) {
      reasons.push('Abundant local amenities');
    }
    
    // Transportation analysis
    if (neighborhood.transportation.walkabilityScore > 70) {
      reasons.push('Highly walkable neighborhood');
    }
    
    // Lifestyle compatibility
    const { lifestyle } = preferences;
    if (lifestyle.ageGroup === 'family' && neighborhood.demographics.familyFriendly) {
      reasons.push('Family-friendly community');
    }
    
    return reasons;
  }

  /**
   * Generate potential concerns based on compatibility analysis
   */
  private static generatePotentialConcerns(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): string[] {
    const concerns: string[] = [];
    
    // Safety concerns
    if (neighborhood.safety.crimeRate > 30) {
      concerns.push('Higher than average crime rate');
    }
    
    // Budget concerns
    const { budget } = preferences;
    const estimatedCost = neighborhood.demographics.medianIncome * 0.3;
    if (estimatedCost > budget.max) {
      concerns.push('May exceed your budget range');
    }
    
    // Transportation concerns
    if (neighborhood.transportation.walkabilityScore < 30) {
      concerns.push('Limited walkability');
    }
    
    return concerns;
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    preferences: UserPreferences,
    neighborhood: Neighborhood
  ): string[] {
    const recommendations: string[] = [];
    
    // Transportation recommendations
    if (neighborhood.transportation.walkabilityScore < 50) {
      recommendations.push('Consider getting a car or using ride-sharing services');
    }
    
    // Safety recommendations
    if (neighborhood.safety.safetyScore < 70) {
      recommendations.push('Research specific safety measures and local crime patterns');
    }
    
    // Lifestyle recommendations
    const { lifestyle } = preferences;
    if (lifestyle.activityLevel === 'high' && neighborhood.lifestyle.outdoorActivities < 50) {
      recommendations.push('Look for nearby parks and recreational facilities');
    }
    
    return recommendations;
  }
} 