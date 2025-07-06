import axios from 'axios';
import { Neighborhood, Location, CensusResponse, OpenStreetMapResponse, GooglePlacesResponse } from '../types';

/**
 * Data service for fetching and processing neighborhood data
 * Handles external APIs and provides fallback mock data
 */
export class DataService {
  private static readonly CACHE_TTL = 3600; // 1 hour
  private static cache = new Map<string, { data: any; timestamp: number }>();

  /**
   * Get neighborhood data by location
   */
  static async getNeighborhoodData(location: Location): Promise<Neighborhood> {
    const cacheKey = `neighborhood_${location.latitude}_${location.longitude}`;
    const cached = this.getFromCache(cacheKey);
    
    if (cached) {
      return cached as Neighborhood;
    }

    try {
      // Fetch data from multiple sources
      const [censusData, osmData, placesData] = await Promise.allSettled([
        this.fetchCensusData(location),
        this.fetchOpenStreetMapData(location),
        this.fetchGooglePlacesData(location)
      ]);

      // Process and combine data
      const neighborhood = this.processNeighborhoodData(location, {
        census: censusData.status === 'fulfilled' ? censusData.value : null,
        osm: osmData.status === 'fulfilled' ? osmData.value : null,
        places: placesData.status === 'fulfilled' ? placesData.value : null
      });

      this.setCache(cacheKey, neighborhood);
      return neighborhood;
    } catch (error) {
      console.error('Error fetching neighborhood data:', error);
      // Return mock data as fallback
      return this.generateMockNeighborhood(location);
    }
  }

  /**
   * Fetch census data for a location
   */
  private static async fetchCensusData(location: Location): Promise<CensusResponse | null> {
    try {
      const apiKey = process.env.CENSUS_API_KEY;
      if (!apiKey) {
        console.warn('Census API key not configured');
        return null;
      }

      const response = await axios.get(
        `${process.env.CENSUS_BASE_URL}/2020/dec/pl`,
        {
          params: {
            get: 'NAME,P0010001,P0130001,P0530001', // Population, median age, median income
            for: 'block:*',
            in: `state:${location.state}&county:*&tract:*`,
            key: apiKey
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching census data:', error);
      return null;
    }
  }

  /**
   * Fetch OpenStreetMap data for a location
   */
  private static async fetchOpenStreetMapData(location: Location): Promise<OpenStreetMapResponse | null> {
    try {
      const response = await axios.get(
        `${process.env.OPENSTREETMAP_BASE_URL}/reverse`,
        {
          params: {
            lat: location.latitude,
            lon: location.longitude,
            format: 'json',
            addressdetails: 1
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching OpenStreetMap data:', error);
      return null;
    }
  }

  /**
   * Fetch Google Places data for a location
   */
  private static async fetchGooglePlacesData(location: Location): Promise<GooglePlacesResponse | null> {
    try {
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      if (!apiKey) {
        console.warn('Google Places API key not configured');
        return null;
      }

      const response = await axios.get(
        'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
        {
          params: {
            location: `${location.latitude},${location.longitude}`,
            radius: 1000, // 1km radius
            key: apiKey,
            type: 'restaurant|cafe|bar|grocery_store|park|gym|school|hospital'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching Google Places data:', error);
      return null;
    }
  }

  /**
   * Process and combine data from multiple sources
   */
  private static processNeighborhoodData(
    location: Location,
    data: {
      census: CensusResponse | null;
      osm: OpenStreetMapResponse | null;
      places: GooglePlacesResponse | null;
    }
  ): Neighborhood {
    // Extract census data
    const demographics = this.extractDemographics(data.census);
    
    // Extract amenities from places data
    const amenities = this.extractAmenities(data.places);
    
    // Generate neighborhood name
    const name = this.generateNeighborhoodName(location, data.osm);
    
    // Calculate scores
    const scores = this.calculateScores(demographics, amenities);
    
    return {
      id: this.generateNeighborhoodId(location),
      name,
      location,
      demographics,
      amenities,
      safety: this.calculateSafetyMetrics(demographics, amenities),
      transportation: this.calculateTransportationInfo(location, amenities),
      lifestyle: this.calculateLifestyleMetrics(amenities, demographics),
      scores,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Extract demographics from census data
   */
  private static extractDemographics(censusData: CensusResponse | null) {
    if (!censusData || !censusData.data || censusData.data.length === 0) {
      return this.generateMockDemographics();
    }

    // Process census data (simplified for demo)
    const firstRow = censusData.data[0];
    if (!firstRow || firstRow.length < 4) {
      return this.generateMockDemographics();
    }

    const population = parseInt(firstRow[1] as string) || 5000;
    const medianAge = parseInt(firstRow[2] as string) || 35;
    const medianIncome = parseInt(firstRow[3] as string) || 75000;

    return {
      totalPopulation: population,
      medianAge,
      medianIncome,
      diversityIndex: Math.random() * 100,
      educationLevel: this.calculateEducationLevel(medianIncome),
      familyFriendly: medianAge > 25 && medianAge < 50,
      ageGroups: {
        under18: Math.round(population * 0.2),
        age18to34: Math.round(population * 0.25),
        age35to49: Math.round(population * 0.25),
        age50to64: Math.round(population * 0.2),
        over65: Math.round(population * 0.1)
      }
    };
  }

  /**
   * Extract amenities from Google Places data
   */
  private static extractAmenities(placesData: GooglePlacesResponse | null) {
    if (!placesData || !placesData.results) {
      return this.generateMockAmenities();
    }

    const amenities = {
      restaurants: 0,
      cafes: 0,
      bars: 0,
      groceryStores: 0,
      parks: 0,
      gyms: 0,
      schools: 0,
      hospitals: 0,
      shoppingCenters: 0,
      entertainment: 0
    };

    placesData.results.forEach(place => {
      if (place.types.includes('restaurant')) amenities.restaurants++;
      else if (place.types.includes('cafe')) amenities.cafes++;
      else if (place.types.includes('bar')) amenities.bars++;
      else if (place.types.includes('grocery_store')) amenities.groceryStores++;
      else if (place.types.includes('park')) amenities.parks++;
      else if (place.types.includes('gym')) amenities.gyms++;
      else if (place.types.includes('school')) amenities.schools++;
      else if (place.types.includes('hospital')) amenities.hospitals++;
      else if (place.types.includes('shopping_mall')) amenities.shoppingCenters++;
      else amenities.entertainment++;
    });

    return amenities;
  }

  /**
   * Generate mock neighborhood data
   */
  private static generateMockNeighborhood(location: Location): Neighborhood {
    const demographics = this.generateMockDemographics();
    const amenities = this.generateMockAmenities();
    const scores = this.calculateScores(demographics, amenities);

    return {
      id: this.generateNeighborhoodId(location),
      name: this.generateMockNeighborhoodName(location),
      location,
      demographics,
      amenities,
      safety: this.calculateSafetyMetrics(demographics, amenities),
      transportation: this.calculateTransportationInfo(location, amenities),
      lifestyle: this.calculateLifestyleMetrics(amenities, demographics),
      scores,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Generate mock demographics data
   */
  private static generateMockDemographics() {
    const population = Math.floor(Math.random() * 15000) + 2000;
    const medianAge = Math.floor(Math.random() * 30) + 25;
    const medianIncome = Math.floor(Math.random() * 100000) + 40000;

    return {
      totalPopulation: population,
      medianAge,
      medianIncome,
      diversityIndex: Math.random() * 100,
      educationLevel: this.calculateEducationLevel(medianIncome),
      familyFriendly: medianAge > 25 && medianAge < 50,
      ageGroups: {
        under18: Math.round(population * 0.2),
        age18to34: Math.round(population * 0.25),
        age35to49: Math.round(population * 0.25),
        age50to64: Math.round(population * 0.2),
        over65: Math.round(population * 0.1)
      }
    };
  }

  /**
   * Generate mock amenities data
   */
  private static generateMockAmenities() {
    return {
      restaurants: Math.floor(Math.random() * 20) + 5,
      cafes: Math.floor(Math.random() * 10) + 2,
      bars: Math.floor(Math.random() * 8) + 1,
      groceryStores: Math.floor(Math.random() * 5) + 1,
      parks: Math.floor(Math.random() * 8) + 2,
      gyms: Math.floor(Math.random() * 4) + 1,
      schools: Math.floor(Math.random() * 6) + 2,
      hospitals: Math.floor(Math.random() * 2) + 1,
      shoppingCenters: Math.floor(Math.random() * 3) + 1,
      entertainment: Math.floor(Math.random() * 5) + 1
    };
  }

  /**
   * Calculate neighborhood scores
   */
  private static calculateScores(demographics: any, amenities: any) {
    let totalAmenities = 0;
    for (const value of Object.values(amenities)) {
      totalAmenities += value as number;
    }
    
    return {
      overall: Math.round((demographics.medianIncome / 100000) * 30 + (totalAmenities / 50) * 40 + Math.random() * 30),
      safety: Math.round(80 + Math.random() * 20),
      amenities: Math.round((totalAmenities / 50) * 100),
      transportation: Math.round(60 + Math.random() * 40),
      lifestyle: Math.round(50 + Math.random() * 50),
      affordability: Math.round((demographics.medianIncome / 100000) * 100)
    };
  }

  /**
   * Calculate safety metrics
   */
  private static calculateSafetyMetrics(demographics: any, amenities: any) {
    return {
      crimeRate: Math.floor(Math.random() * 30) + 5,
      safetyScore: Math.round(70 + Math.random() * 30),
      policeStations: Math.floor(Math.random() * 3) + 1,
      emergencyServices: Math.floor(Math.random() * 2) + 1,
      wellLitStreets: Math.random() > 0.3
    };
  }

  /**
   * Calculate transportation info
   */
  private static calculateTransportationInfo(location: Location, amenities: any) {
    return {
      walkabilityScore: Math.round(50 + Math.random() * 50),
      transitScore: Math.round(40 + Math.random() * 60),
      bikeScore: Math.round(30 + Math.random() * 70),
      publicTransitStops: Math.floor(Math.random() * 10) + 2,
      bikeLanes: Math.floor(Math.random() * 15) + 5,
      parkingAvailability: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as 'high' | 'medium' | 'low'
    };
  }

  /**
   * Calculate lifestyle metrics
   */
  private static calculateLifestyleMetrics(amenities: any, demographics: any) {
    return {
      nightlife: Math.round((amenities.bars + amenities.restaurants) * 3),
      familyActivities: Math.round((amenities.parks + amenities.schools) * 4),
      outdoorActivities: Math.round(amenities.parks * 8),
      culturalEvents: Math.round(Math.random() * 100),
      communityEngagement: Math.round(50 + Math.random() * 50)
    };
  }

  /**
   * Helper methods
   */
  private static calculateEducationLevel(medianIncome: number): 'high' | 'medium' | 'low' {
    if (medianIncome > 80000) return 'high';
    if (medianIncome > 50000) return 'medium';
    return 'low';
  }

  private static generateNeighborhoodName(location: Location, osmData: OpenStreetMapResponse | null): string {
    if (osmData?.display_name) {
      const parts = osmData.display_name.split(',');
      return parts[0] || 'Unknown Neighborhood';
    }
    return this.generateMockNeighborhoodName(location);
  }

  private static generateMockNeighborhoodName(location: Location): string {
    const names = ['Downtown', 'Westside', 'Eastside', 'North End', 'South District', 'Central', 'Riverside', 'Hillside'];
    return `${names[Math.floor(Math.random() * names.length)]} ${location.city || 'District'}`;
  }

  private static generateNeighborhoodId(location: Location): string {
    return `neighborhood_${location.latitude.toFixed(4)}_${location.longitude.toFixed(4)}`;
  }

  private static getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL * 1000) {
      return cached.data;
    }
    return null;
  }

  private static setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
} 