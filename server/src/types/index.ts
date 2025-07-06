// Core data types for the NeighborFit application

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Neighborhood {
  id: string;
  name: string;
  location: Location;
  demographics: Demographics;
  amenities: Amenities;
  safety: SafetyMetrics;
  transportation: TransportationInfo;
  lifestyle: LifestyleMetrics;
  scores: NeighborhoodScores;
  lastUpdated: string;
}

export interface Demographics {
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
}

export interface Amenities {
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
}

export interface SafetyMetrics {
  crimeRate: number; // per 1000 residents
  safetyScore: number; // 0-100
  policeStations: number;
  emergencyServices: number;
  wellLitStreets: boolean;
}

export interface TransportationInfo {
  walkabilityScore: number; // 0-100
  transitScore: number; // 0-100
  bikeScore: number; // 0-100
  publicTransitStops: number;
  bikeLanes: number;
  parkingAvailability: 'high' | 'medium' | 'low';
}

export interface LifestyleMetrics {
  nightlife: number; // 0-100
  familyActivities: number; // 0-100
  outdoorActivities: number; // 0-100
  culturalEvents: number; // 0-100
  communityEngagement: number; // 0-100
}

export interface NeighborhoodScores {
  overall: number; // 0-100
  safety: number;
  amenities: number;
  transportation: number;
  lifestyle: number;
  affordability: number;
}

export interface UserPreferences {
  id: string;
  location: Location;
  budget: {
    min: number;
    max: number;
  };
  priorities: {
    safety: number; // 1-10
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

export interface MatchingResult {
  neighborhood: Neighborhood;
  compatibilityScore: number; // 0-100
  matchReasons: string[];
  potentialConcerns: string[];
  recommendations: string[];
}

export interface SearchFilters {
  location?: Location;
  radius?: number; // miles
  budget?: {
    min: number;
    max: number;
  };
  priorities?: Partial<UserPreferences['priorities']>;
  lifestyle?: Partial<UserPreferences['lifestyle']>;
  amenities?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// External API response types
export interface CensusResponse {
  data: Array<Array<string | number>>;
  headers: string[];
}

export interface OpenStreetMapResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  icon?: string;
}

export interface GooglePlacesResponse {
  results: Array<{
    place_id: string;
    name: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    types: string[];
    rating?: number;
    user_ratings_total?: number;
  }>;
  status: string;
} 