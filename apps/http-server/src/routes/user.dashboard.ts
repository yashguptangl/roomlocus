import express from "express";
import { prisma } from "@repo/db/prisma"
import  { Response } from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { getObjectURL } from "../utils/s3client";

const userDashboard = express.Router();

userDashboard.post("/wishlist", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { userId, listingId, type } = req.body;

        const wishlistItem = await prisma.wishlist.create({
            data: { userId, listingId, type }
        });

        res.status(201).json({ success: true, message: "Added to wishlist", wishlistItem });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error adding to wishlist", error });
    }
});

userDashboard.delete("/wishlist/delete", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id , type} = req.body;
        const wishlistItem = await prisma.wishlist.findFirst({
            where: { listingId: Number(id), type: type },
        });

        if (!wishlistItem) {
            res.status(404).json({ success: false, message: "Wishlist item not found" });
            return;
        }

        await prisma.wishlist.delete({ where: { id: wishlistItem.id } });


        res.status(200).json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error removing wishlist item", error });
    }
});

userDashboard.get("/wishlist/:userId", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { userId } = req.params;

        const wishlist = await prisma.wishlist.findMany({
            where: { userId: Number(userId) },
        });

        res.status(200).json({ success: true, wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching wishlist", error });
    }
});

userDashboard.get("/dashboard", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
             res.status(401).json({ success: false, message: "Unauthorized" });
             return;
        }

        // 1. Fetch all wishlist items for the user
        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId: Number(userId) },
            orderBy: { createdAt: "desc" } // Newest first
        });
        console.log("Wishlist items:", wishlistItems);

        // 2. Fetch details for each property in wishlist
        const wishlistWithDetails = await Promise.all(
            wishlistItems.map(async (item) => {
                let property;
                const type = item.type.toLowerCase();
                
                try {
                    // Fetch property based on type
                    switch(type) {
                        case 'flat':
                            property = await prisma.flatInfo.findUnique({
                                where: { id: item.listingId }
                            });
                            break;
                        case 'pg':
                            property = await prisma.pgInfo.findUnique({
                                where: { id: item.listingId }
                            });
                            break;
                        case 'room':
                            property = await prisma.roomInfo.findUnique({
                                where: { id: item.listingId }
                            });
                            break;
                        case 'hourlyroom':
                            property = await prisma.hourlyInfo.findUnique({
                                where: { id: item.listingId }
                            });
                            break;
                    }

                    // Skip if property not found
                    if (!property) return null;

                    // Get image URL
                    let imageUrl = '';
                    try {
                        const key = `images/${type}/${item.listingId}/inside.jpeg`;
                        imageUrl = await getObjectURL(key);
                    } catch (error) {
                        console.error(`Error fetching image for ${type} ${item.listingId}:`, error);
                    }

                    return {
                        id: item.listingId.toString(),
                        type: item.type,
                        listing: {
                            ...property,
                            imageUrl: imageUrl || null
                        }
                    };
                } catch (error) {
                    console.error(`Error processing wishlist item ${item.id}:`, error);
                    return null;
                }
            })
        );

        // Filter out null values (deleted properties)
        const validWishlist = wishlistWithDetails.filter(item => item !== null);

        // 3. Fetch recent contacts (last 30 days)
        const recentContacts = await prisma.contactLog.findMany({
            where: {
                OR: [
                    { userId: Number(userId) },  // User initiated contacts
                    { ownerId: Number(userId) }  // Owner received contacts
                ],
                isExpired: false,
                accessDate: { 
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) 
                }
            },
            orderBy: { accessDate: "desc" },
            take: 20 // Increased limit
        });

        res.status(200).json({
            success: true,
            data: {
                wishlist: validWishlist,
                recentContacts
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching dashboard data",
        });
    }
});

userDashboard.delete("/recentContacts/delete", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.body;

        const contactLog = await prisma.contactLog.findUnique({
            where: { id: Number(id) }
        });

        if (!contactLog) {
            res.status(404).json({ success: false, message: "Contact log not found" });
            return;
        }

        await prisma.contactLog.update({
            where: { id: Number(id) },
            data: { userDeleted: true }
        });

        res.status(200).json({ success: true, message: "Contact log deleted" });
    } catch (error) {
        console.error("Error deleting contact log:", error);
        res.status(500).json({ success: false, message: "Error deleting contact log", error });
    }
})

export default userDashboard;
