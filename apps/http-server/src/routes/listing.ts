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
          where: { 
            city, 
            townSector, 
            isVisible: true, 
            isDraft: false 
          },
        });
        break;
      case "pg":
        listings = await prisma.pgInfo.findMany({
          where: { city, townSector , isVisible: true, isDraft: false },
        });
        break;
      case "flat":
        listings = await prisma.flatInfo.findMany({
          where: { city, townSector , isVisible: true, isDraft: false },
        });
        break;
      case "hourlyroom":
        listings = await prisma.hourlyInfo.findMany({
          where: { city, townSector , isVisible: true, isDraft: false },
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
            const key = `images/${looking_for}/${listing.id}/${category}.jpeg`;
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

listingRouter.get("/:listing/:id" , async ( req : Request, res : Response) => {
  try{
    const { listing, id } = req.params;

    if (!listing) {
      res.status(400).json({ message: "Listing type is required" });
      return;
    }

    switch(listing.toLowerCase()){
      case "room":
        const room = await prisma.roomInfo.findUnique({
          where : { id : Number(id) }
        });
        if(!room){
          res.status(404).json({message : "Room not found"});
          return;
        }

        const roomImages = await Promise.all(
          ["inside", "front", "lobby", "bathroom", "kitchen"].map(async (category) => {
            const key = `images/room/${id}/${category}.jpeg`;
            return await getObjectURL(key); // Fetch signed URL from S3
          })
        );
        res.json({room , images : roomImages});
        break;

      case "pg":
        const pg = await prisma.pgInfo.findUnique({
          where : { id : Number(id) }
        });
        if(!pg){
          res.status(404).json({message : "PG not found"});
          return;
        }
        const pgImages = await Promise.all(
          ["inside", "front", "lobby", "bathroom", "kitchen"].map(async (category) => {
            const key = `images/pg/${id}/${category}.jpeg`;
            return await getObjectURL(key); // Fetch signed URL from S3
          })
        );
        res.json({pg , images : pgImages});
        break;

      case "flat":
        const flat = await prisma.flatInfo.findUnique({
          where : { id : Number(id) }
        });
        if(!flat){
          res.status(404).json({message : "Flat not found"});
          return;
        }

        const flatImages = await Promise.all(
          ["inside", "front", "lobby", "bathroom", "kitchen"].map(async (category) => {
            const key = `images/flat/${id}/${category}.jpeg`;
            return await getObjectURL(key); // Fetch signed URL from S3
          })
        );
        res.json({flat , images : flatImages});
        break;

      case "hourlyroom":
        const hourly = await prisma.hourlyInfo.findUnique({
          where : { id : Number(id) }
        });
        if(!hourly){
          res.status(404).json({message : "Hourly room not found"});
          return;
        }

        const hourlyImages = await Promise.all(
          ["inside", "front", "lobby", "bathroom", "kitchen"].map(async (category) => {
            const key = `images/hourlyroom/${id}/${category}.jpeg`;
            return await getObjectURL(key); // Fetch signed URL from S3
          })
        );
        res.json({hourly , images : hourlyImages});
        break;

      default:
        res.status(400).json({message : "Invalid listing type"});
        return;
    }
  }catch(e){
    console.log(e);
    res.status(500).json({message : "Failed to fetch listing"});
  }
})






export { listingRouter };
