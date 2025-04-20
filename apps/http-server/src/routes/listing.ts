import express from "express";
import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";
import { getObjectURL } from "../utils/s3client";
import dotenv from "dotenv";
import { authenticate , AuthenticatedRequest } from "../middleware/auth";
dotenv.config();

const listingRouter = express.Router();


listingRouter.get("/search", async (req: Request, res: Response): Promise<any> => {
  const { looking_for, city, townSector } = req.query as {
    looking_for?: string;
    city?: string;
    townSector?: string;
  };

  if (!looking_for || !city || !townSector) {
    return res.status(400).json({ error: "Type, city, and townSector are required" });
  }

  try {
    let listings: any[] = [];

    switch (looking_for.toLowerCase()) {
      case "room":
        listings = await prisma.roomInfo.findMany({
          where: { city, townSector },
        });
        break;
      case "pg":
        listings = await prisma.pgInfo.findMany({
          where: { city, townSector },
        });
        break;
      case "flat":
        listings = await prisma.flatInfo.findMany({
          where: { city, townSector },
        });
      case "roomDayNight":
        listings = await prisma.roomDayNight.findMany({
          where: { city, townSector },
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid type parameter" });
    }

    if (!listings.length) {
      return res.status(402).json({ message: "No listings found for the given criteria" });
    }

    // Define image categories
    const imageCategories = ["inside", "front", "lobby", "bathroom", "kitchen"];

    // Fetch images for each listing
    const listingsWithImages = await Promise.all(
      listings.map(async (listing) => {
        const imageUrls = await Promise.all(
          imageCategories.map(async (category) => {
            const key = `images/${looking_for}/${listing.id},/${category}.jpeg`;
            return await getObjectURL(key); // Fetch signed URL from S3
          })
        );
        return { ...listing, images: imageUrls };
      })
    );

    res.json({ listings: listingsWithImages });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

listingRouter.get("/contact-logs/:id", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { id } = req.params;

  try {
    const logs = await prisma.contactLog.findMany({
      where: { userId: Number(id) },
      orderBy: { accessDate: "desc" },
    });

    res.json({ logs });
    return;
  } catch (error) {
    console.error("Error fetching contact logs:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
})

export { listingRouter };
