// routes/location.js
import express from 'express';
import axios from 'axios';
import { prisma } from "@repo/db/prisma";
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const locationRouter = express.Router();

// Google Maps API Key (store in environment variables)
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const getAddressFromCoordinates = async (latitude : any, longitude : any) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await axios.get(url);
    console.log("Geocode API response:", response.data);
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      return response.data.results[0].formatted_address;
    }

    console.warn("Geocode API returned:", response.data.status);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};


// Save location endpoint
locationRouter.post('/save', authenticate, async (req: AuthenticatedRequest, res) => {
  const ownerId = req.user?.id; 
  try {
    const {
      listingId,
      listingType,
      latitude,
      longitude,
      address,
      isLiveLocation = true
    } = req.body;

    // Validate required fields
    if (!listingId || !listingType || !ownerId || !latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
      return;
    }

    // Validate listing type
    const validListingTypes = ['flat', 'pg', 'room', 'hourlyroom'];
    if (!validListingTypes.includes(listingType.toLowerCase())) {
      res.status(400).json({
        success: false,
        message: 'Invalid listing type'
      });
      return;
    }

    // Get address from coordinates if not provided
    let finalAddress = address;
    if (!finalAddress) {
      finalAddress = await getAddressFromCoordinates(latitude, longitude);
    }


    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    let updatedRecord;

    // Update the appropriate model based on listing type
    switch (listingType.toLowerCase()) {
      case 'flat':
        updatedRecord = await prisma.flatInfo.update({
          where: {
            id: parseInt(listingId),
            ownerId: parseInt(ownerId)
          },
          data: {
            latitude: lat,
            longitude: lng,
            AdressByAPI: finalAddress || '',
            isLiveLocation: isLiveLocation
          }
        });
        break;

      case 'pg':
        updatedRecord = await prisma.pgInfo.update({
          where: {
            id: parseInt(listingId),
            ownerId: parseInt(ownerId)
          },
          data: {
            latitude: lat,
            longitude: lng,
            AdressByAPI: finalAddress || '',
            isLiveLocation: isLiveLocation
          }
        });
        break;

      case 'room':
        updatedRecord = await prisma.roomInfo.update({
          where: {
            id: parseInt(listingId),
            ownerId: parseInt(ownerId)
          },
          data: {
            latitude: lat,
            longitude: lng,
            AdressByAPI: finalAddress || '',
            isLiveLocation: isLiveLocation
          }
        });
        break;

      case 'hourlyroom':
        updatedRecord = await prisma.hourlyInfo.update({
          where: {
            id: parseInt(listingId),
            ownerId: parseInt(ownerId)
          },
          data: {
            latitude: lat,
            longitude: lng,
            AdressByAPI: finalAddress || '',
            isLiveLocation: isLiveLocation
          }
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid property type'
        });
        return;
    }

    res.json({
      success: true,
      message: 'Location saved successfully',
      data: {
        listingId: updatedRecord.id,
        latitude: updatedRecord.latitude,
        longitude: updatedRecord.longitude,
        address: updatedRecord.AdressByAPI,
        isLiveLocation: updatedRecord.isLiveLocation
      }
    });

  } catch (error: any) {
    console.error('Error saving location:', error);
    
    if (error.code === 'P2025') {
      res.status(404).json({
        success: false,
        message: 'Property not found or you do not have permission to update it'
      });
        return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Reverse geocoding endpoint (get address from coordinates)
locationRouter.post('/reverse-geocode', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
      return;
    }

    const address = await getAddressFromCoordinates(parseFloat(latitude), parseFloat(longitude));

    if (!address) {
      res.status(400).json({
        success: false,
        message: 'Unable to get address for provided coordinates'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    });

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Validate coordinates endpoint
locationRouter.post('/validate', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Basic coordinate validation
    if (isNaN(lat) || isNaN(lng)) {
       res.status(400).json({
        success: false,
        message: 'Invalid coordinates format'
      });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      res.status(400).json({
        success: false,
        message: 'Coordinates out of valid range'
      });
      return;
    }

    // Optional: Check if coordinates are within India (if your app is India-specific)
    const isInIndia = lat >= 6.0 && lat <= 37.6 && lng >= 68.7 && lng <= 97.25;

    res.json({
      success: true,
      data: {
        latitude: lat,
        longitude: lng,
        isValid: true,
        isInIndia
      }
    });

  } catch (error) {
    console.error('Coordinate validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default locationRouter;