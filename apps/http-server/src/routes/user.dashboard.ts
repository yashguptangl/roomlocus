import express from "express";
import { prisma } from "@repo/db/prisma"
import { Response } from "express";
import { authenticate, AuthenticatedRequest } from "../middleware/auth";


const userDashboard = express.Router();

// Add to Wishlist
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

// Remove from Wishlist
userDashboard.delete("/wishlist/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.wishlist.delete({ where: { id: Number(id) } });

        res.status(200).json({ success: true, message: "Removed from wishlist" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error removing wishlist item", error });
    }
});

// Get User Wishlist
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

userDashboard.get("/:type/:id", authenticate, async (req: AuthenticatedRequest, res: Response) : Promise<any> => {
    try {
        const { id, type } = req.params;
        let listing;
        if (type === "flat") {
            listing = await prisma.flatInfo.findUnique({ where: { id : Number(id) } });
        } else if (type === "pg") {
            listing = await prisma.pgInfo.findUnique({ where: { id : Number(id) } });
        } else if (type === "room") {
            listing = await prisma.roomInfo.findUnique({ where: { id : Number(id) } });
        }

        if (!listing) return res.status(404).json({ message: "Listing not found" });

        res.status(200).json({ listing });
    } catch (err) {
        console.error("Error fetching image URLs:", err);
        res.status(500).json({
            message: "Failed to fetch images. Please try again later.",
        });
    }
})



userDashboard.get("/contact-logs/:userId", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { userId } = req.params;

        // Fetch recent contacts (valid for 30 days)
        const logs = await prisma.contactLog.findMany({
            where: {
                ownerId: Number(userId),
                isExpired: false,
                accessDate: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
            },
            orderBy: { accessDate: "desc" },
        });

        return res.status(200).json({ logs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});


export default userDashboard;
