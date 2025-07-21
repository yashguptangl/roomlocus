import express, { Request, Response } from 'express';
import { prisma } from '@repo/db/prisma';
import getDistance from '../utils/geoUtils';
import { getObjectURL } from '../utils/s3client';

const nearmeRouter = express.Router();

interface PropertyBase {
  id: number;
  latitude: any; // Decimal type from Prisma, will be string or number
  longitude: any;
  Type?: string;
  [key: string]: any;
}

interface NearbyProperty extends PropertyBase {
  propertyType: string;
  image: string | null;
}

nearmeRouter.get('/near-me', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, type } = req.query as {
      latitude?: string;
      longitude?: string;
      type?: string;
    };

    if (!latitude || !longitude || !type) {
      res.status(400).json({ error: 'Latitude, longitude, and property type are required' });
      return;
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);

    if (isNaN(userLat) || isNaN(userLng)) {
      res.status(400).json({ error: 'Invalid latitude or longitude' });
      return;
    }

    const baseConditions = {
      isVisible: true,
      isDraft: false,
      isLiveLocation: true,
    };

    let properties: PropertyBase[] = [];

    switch (type.toLowerCase()) {
      case 'flat':
        properties = await prisma.flatInfo.findMany({ where: baseConditions });
        break;
      case 'pg':
        properties = await prisma.pgInfo.findMany({ where: baseConditions });
        break;
      case 'room':
        properties = await prisma.roomInfo.findMany({ where: baseConditions });
        break;
      case 'hourlyroom':
        properties = await prisma.hourlyInfo.findMany({ where: baseConditions });
        break;
      default:
        res.status(400).json({ error: 'Invalid property type' });
        return;
    }

    // Filter properties within 15km and fetch single inside image for each
    const nearbyProperties: NearbyProperty[] = await Promise.all(
      properties
        .filter(property => {
          // Prisma Decimal type can be string, so always parseFloat
          const propLat = parseFloat(property.latitude as string);
          const propLng = parseFloat(property.longitude as string);
          if (isNaN(propLat) || isNaN(propLng)) return false;
          const distance = getDistance(userLat, userLng, propLat, propLng);
          return distance <= 15;
        })
        .map(async (property) => {
          const propertyType = property.Type?.toLowerCase() || type.toLowerCase();
          let imageKey = '';

          switch (propertyType) {
            case 'flat':
              imageKey = `images/flat/${property.id}/inside.jpeg`;
              break;
            case 'pg':
              imageKey = `images/pg/${property.id}/inside.jpeg`;
              break;
            case 'room':
              imageKey = `images/room/${property.id}/inside.jpeg`;
              break;
            case 'hourlyroom':
              imageKey = `images/hourlyroom/${property.id}/inside.jpeg`;
              break;
            default:
              imageKey = '';
          }

          let imageUrl: string | null = null;
          if (imageKey) {
            try {
              imageUrl = await getObjectURL(imageKey);
            } catch (error) {
              console.error(`Failed to fetch inside image for ${propertyType} ${property.id}:`, error);
            }
          }
          return {
            ...property,
            propertyType,
            image: imageUrl,
          };
        })
    );

    res.status(200).json({ nearbyProperties, message: "Listing fetched successfully" });
  } catch (error) {
    console.error('Error in near-me endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default nearmeRouter;