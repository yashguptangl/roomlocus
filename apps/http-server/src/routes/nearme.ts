// routes/properties.ts
import express from 'express';
import { prisma } from '@repo/db/prisma';
import { Request, Response } from 'express';
import getDistance from '../utils/geoUtils';
import { getObjectURL } from '../utils/s3client';

const nearmeRouter = express.Router();

interface PropertyBase {
  id: number;
  latitude: number;
  longitude: number;
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
      latitude: string;
      longitude: string;
      type?: string;
    };
    
    if (!latitude || !longitude) {
      res.status(400).json({ error: 'Latitude and longitude are required' });
      return;
    }

    const userLat = parseFloat(latitude);
    const userLng = parseFloat(longitude);
    
    const baseConditions = {
      isVisible: true,
      isDraft: false,
    };

    let properties: PropertyBase[] = [];
    
    if (type) {
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
    } else {
      const [flat, pg, room, hourlyroom] = await Promise.all([
        prisma.flatInfo.findMany({ where: baseConditions }),
        prisma.pgInfo.findMany({ where: baseConditions }),
        prisma.roomInfo.findMany({ where: baseConditions }),
        prisma.hourlyInfo.findMany({ where: baseConditions })
      ]);
      properties = [...flat, ...pg, ...room, ...hourlyroom];
    }

    // Filter properties within 15km and fetch single inside image for each
    const nearbyProperties: NearbyProperty[] = await Promise.all(
      properties
        .filter(property => {
          const distance = getDistance(
            userLat,
            userLng,
            property.latitude,
            property.longitude
          );
          return distance <= 15;
        })
        .map(async (property) => {
          const propertyType = property.Type?.toLowerCase() || 'unknown';
          let imageKey: string;
          
          // Determine image path based on property type
          switch(propertyType) {
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

          // Fetch signed URL for the inside image
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
            image: imageUrl
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