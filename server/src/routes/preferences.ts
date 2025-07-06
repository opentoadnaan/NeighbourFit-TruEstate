import { Router } from 'express';
import { PreferenceService } from '../services/preferenceService';

export const preferenceRoutes = Router();

// GET /api/preferences - Get current user preferences (without userId)
preferenceRoutes.get('/', (req, res) => {
  try {
    // For demo purposes, use a default user ID
    const userId = 'default-user';
    let preferences = PreferenceService.getUserPreferences(userId);
    
    if (!preferences) {
      // Generate default preferences for new user
      preferences = PreferenceService.generateDefaultPreferences(userId);
    }
    
    res.json({
      success: true,
      data: preferences,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user preferences',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/preferences - Save/update current user preferences (without userId)
preferenceRoutes.post('/', (req, res) => {
  try {
    // For demo purposes, use a default user ID
    const userId = 'default-user';
    const preferencesData = req.body;
    
    const updatedPreferences = PreferenceService.saveUserPreferences(userId, preferencesData);
    
    res.json({
      success: true,
      data: updatedPreferences,
      message: 'Preferences saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save user preferences',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/preferences/:userId - Get user preferences
preferenceRoutes.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    let preferences = PreferenceService.getUserPreferences(userId);
    
    if (!preferences) {
      // Generate default preferences for new user
      preferences = PreferenceService.generateDefaultPreferences(userId);
    }
    
    res.json({
      success: true,
      data: preferences,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user preferences',
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/preferences/:userId - Save/update user preferences
preferenceRoutes.post('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const preferencesData = req.body;
    
    const updatedPreferences = PreferenceService.saveUserPreferences(userId, preferencesData);
    
    res.json({
      success: true,
      data: updatedPreferences,
      message: 'Preferences saved successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save user preferences',
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE /api/preferences/:userId - Delete user preferences
preferenceRoutes.delete('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const deleted = PreferenceService.deleteUserPreferences(userId);
    
    res.json({
      success: true,
      data: { deleted },
      message: deleted ? 'Preferences deleted successfully' : 'No preferences found to delete',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user preferences',
      timestamp: new Date().toISOString()
    });
  }
}); 