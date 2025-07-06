import { Router } from 'express';
import { MatchingAlgorithm } from '../services/matchingAlgorithm';
import { UserPreferences, Neighborhood } from '../types';

export const matchingRoutes = Router();

// POST /api/matching - Run matching algorithm
matchingRoutes.post('/', (req, res) => {
  const { preferences, neighborhoods } = req.body as { preferences: UserPreferences; neighborhoods: Neighborhood[] };
  if (!preferences || !neighborhoods) {
    return res.status(400).json({ success: false, error: 'Missing preferences or neighborhoods', timestamp: new Date().toISOString() });
  }
  // Run matching for each neighborhood
  const results = neighborhoods.map(n => MatchingAlgorithm.generateMatchingResult(preferences, n));
  return res.json({ success: true, data: results, timestamp: new Date().toISOString() });
}); 