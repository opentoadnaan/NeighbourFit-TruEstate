import { Router } from 'express';
import { DataService } from '../services/dataService';
import { Location } from '../types';

export const neighborhoodRoutes = Router();

// GET /api/neighborhoods - List/search neighborhoods
neighborhoodRoutes.get('/', async (req, res) => {
  try {
    const { lat, lng, radius = 5 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required',
        timestamp: new Date().toISOString()
      });
    }

    const location: Location = {
      latitude: parseFloat(lat as string),
      longitude: parseFloat(lng as string)
    };

    // Generate multiple neighborhoods within radius
    const neighborhoods = [];
    const numNeighborhoods = Math.floor(Math.random() * 8) + 3; // 3-10 neighborhoods
    
    for (let i = 0; i < numNeighborhoods; i++) {
      const offsetLat = location.latitude + (Math.random() - 0.5) * (radius as number) * 0.01;
      const offsetLng = location.longitude + (Math.random() - 0.5) * (radius as number) * 0.01;
      
      const neighborhoodLocation: Location = {
        latitude: offsetLat,
        longitude: offsetLng
      };
      
      const neighborhood = await DataService.getNeighborhoodData(neighborhoodLocation);
      neighborhoods.push(neighborhood);
    }

    return res.json({
      success: true,
      data: neighborhoods,
      message: `Found ${neighborhoods.length} neighborhoods`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching neighborhoods:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch neighborhoods',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/neighborhoods/:id - Get neighborhood by ID
neighborhoodRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Neighborhood ID is required',
        timestamp: new Date().toISOString()
      });
    }
    
    // Extract coordinates from ID (format: neighborhood_lat_lng)
    const coords = id.replace('neighborhood_', '').split('_');
    if (coords.length !== 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid neighborhood ID format',
        timestamp: new Date().toISOString()
      });
    }

    const lat = coords[0];
    const lng = coords[1];
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates in neighborhood ID',
        timestamp: new Date().toISOString()
      });
    }

    const location: Location = {
      latitude: parseFloat(lat),
      longitude: parseFloat(lng)
    };

    const neighborhood = await DataService.getNeighborhoodData(location);
    
    return res.json({
      success: true,
      data: neighborhood,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching neighborhood:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch neighborhood',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/neighborhoods - Create new neighborhood (not implemented for demo)
neighborhoodRoutes.post('/', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented - neighborhoods are generated from external data',
    timestamp: new Date().toISOString()
  });
});

// PUT /api/neighborhoods/:id - Update neighborhood (not implemented for demo)
neighborhoodRoutes.put('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented - neighborhoods are read-only from external data',
    timestamp: new Date().toISOString()
  });
});

// DELETE /api/neighborhoods/:id - Delete neighborhood (not implemented for demo)
neighborhoodRoutes.delete('/:id', (req, res) => {
  res.status(501).json({
    success: false,
    error: 'Not implemented - neighborhoods are read-only from external data',
    timestamp: new Date().toISOString()
  });
}); 