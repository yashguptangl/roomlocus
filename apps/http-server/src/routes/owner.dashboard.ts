import { Router } from 'express';
import { Request, Response } from 'express';
const ownerDashboard = Router();
import { jwt, JWT_SECRET } from '../config';
import { authenticate, AuthenticatedRequest } from "../middleware/auth";
import { getObjectURL , putObject} from '../utils/s3client';
import { prisma } from '@repo/db/prisma';


const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: number; username: string; mobile: string };
    } catch (error) {
        console.error("Token verification failed:", (error as Error).message); // Log the exact error
        throw new Error('Invalid or expired token');
    }
};

ownerDashboard.get("/:id/listings", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    try {
        const ownerWithListings = await prisma.owner.findUnique({
            where: { id: Number(id) },
            include: { FlatInfo: true, RoomInfo: true, PgInfo: true , HourlyInfo : true }
        });
        if (!ownerWithListings) {
            res.status(404).json({ message: "Listing not found" });
            return;
        }
        
        res.status(200).json({
            message: "Owner listings fetched successfully",
            listings: ownerWithListings,
        });
        return;
    } catch (e) {
        console.log("Error in fetching listings", e);
        res.status(500).json({ message: "Failed to fetch listings" });
        return;
    }
})

ownerDashboard.get("/images/:type/:id", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { type, id } = req.params;

        if (!id || !type) {
            res.status(400).json({ message: "ID and type are required" });
            return;
        }

        // Define categories for each type
        const imageCategories: { [key: string]: string[] } = {
            pg: ["inside"],
            room: ["inside"],
            flat: ["inside"],
            hourlyroom: ["inside"],
        };

        if (!imageCategories[type]) {
            res.status(400).json({ message: "Invalid type specified" });
            return;
        }

        // Fetch signed URLs for each category from S3
        const categories = imageCategories[type][0];
        const key = `images/${type}/${id}/${categories}.jpeg`; // Adjust the key based on your S3 folder structure
        const imageUrl = await getObjectURL(key); // Fetch presigned URL using getObjectURL

        res.json({ images: imageUrl });
        return;
    } catch (err) {
        console.error("Error fetching image URLs:", err);
        res.status(500).json({
            message: "Failed to fetch images. Please try again later.",
        });
        return;
    }
});

ownerDashboard.get("/contact-logs/:ownerId", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { ownerId } = req.params;

        // Fetch recent contacts (valid for 30 days)
        const logs = await prisma.contactLog.findMany({
            where: {
                ownerId: Number(ownerId),
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

ownerDashboard.post("/publish", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { listingId, type , isVisible} = req.body;
        const { id: ownerId } = req.user;

        // Update the visibility of the listing based on the provided type
        if (type === "flat") {
            await prisma.flatInfo.updateMany({
            where: { id: listingId, ownerId },
            data: { isVisible: !isVisible },
            });
        } else if (type === "room") {
            await prisma.roomInfo.updateMany({
            where: { id: listingId, ownerId },
            data: { isVisible: !isVisible },
            });
        } else if (type === "pg") {
            await prisma.pgInfo.updateMany({
            where: { id: listingId, ownerId },
            data: { isVisible: !isVisible },
            });
        } else if (type === "hourlyroom") {
            await prisma.hourlyInfo.updateMany({
            where: { id: listingId, ownerId },
            data: { isVisible: isVisible },
            });
        } else {
            res.status(400).json({ message: "Invalid type specified" });
            return;
        }

        res.status(200).json({ message: `Listing visibility updated to ${isVisible}` });
        return;
    } catch (error) {
        console.error("Error updating listing visibility:", error);
        res.status(500).json({ message: "Server error" });
        return;
    }
});

ownerDashboard.post("/owner-kyc", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.user;
    try {
        const categories = ["ownerImage", "aadharFront", "aadharBack", "otherId"];
        const urls: { [key: string]: string } = {};

        // Upload files and validate formats
        for (const category of categories) {
            urls[category] = await putObject(
                `owner-kyc-documents/${id}/${category}.jpeg`,
                "image/jpeg"
            );
        }

        // Update owner's KYC status
        await prisma.owner.update({
            where: { id },
            data: { isKYCVerified: true },
        });

        res.status(200).json({ message: "KYC documents uploaded successfully", presignedUrls: urls });
        return;
    }catch(error){
        console.error("Error uploading KYC documents:", error);
        res.status(500).json({ message: "Failed to upload KYC documents" });
        return;
    }
})

ownerDashboard.delete("/listing", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const { listingId, type } = req.body;
    const { id: ownerId } = req.user;

    try {
        // Delete the listing based on the provided type
        if (type === "flat") {
            await prisma.flatInfo.deleteMany({
                where: { id: listingId, ownerId },
            });
        } else if (type === "room") {
            await prisma.roomInfo.deleteMany({
                where: { id: listingId, ownerId },
            });
        } else if (type === "pg") {
            await prisma.pgInfo.deleteMany({
                where: { id: listingId, ownerId },
            });
        } else if (type === "hourlyroom") {
            await prisma.hourlyInfo.deleteMany({
                where: { id: listingId, ownerId },
            });
        } else {
             res.status(400).json({ message: "Invalid type specified" });
             return;
        }

        res.status(200).json({ message: "Listing deleted successfully" });
    } catch (error) {
        console.error("Error deleting listing:", error);
        res.status(500).json({ message: "Server error" });
    }
});

ownerDashboard.put("/edit-listing", authenticate, async (req: AuthenticatedRequest, res: Response) => {
    const { listingId, listingType, data } = req.body;
    const { id: ownerId } = req.user;

    try {
        // Fetch the listing to check the last update date
        let listing;
        if (listingType === "flat") {
            listing = await prisma.flatInfo.findFirst({
                where: { id: parseInt(listingId), ownerId },
            });
        } else if (listingType === "room") {
            listing = await prisma.roomInfo.findFirst({
                where: { id: parseInt(listingId), ownerId },
            });
        } else if (listingType === "pg") {
            listing = await prisma.pgInfo.findFirst({
                where: { id: parseInt(listingId), ownerId },
            });
        } else if (listingType === "hourlyroom") {
            listing = await prisma.hourlyInfo.findFirst({
                where: { id: parseInt(listingId), ownerId },
            });
        } else {
            res.status(400).json({ message: "Invalid type specified" });
            return;
        }

        if (!listing) {
            res.status(404).json({ message: "Listing not found" });
            return;
        }

        // Check if the owner has updated the listing within the last 30 days
        const lastUpdated = listing.updatedByOwner;
        if (lastUpdated && new Date(lastUpdated).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) {
            res.status(403).json({ message: "You can only update the listing once in 30 days" });
            return;
        }

        // Update the listing and set the updatedByOwner field to the current date
        if (listingType === "flat") {
            await prisma.flatInfo.updateMany({
                where: { id: parseInt(listingId), ownerId },
                data: { ...data, updatedByOwner: new Date() },
            });
        } else if (listingType === "room") {
            await prisma.roomInfo.updateMany({
                where: { id: parseInt(listingId), ownerId },
                data: { ...data, updatedByOwner: new Date() },
            });
        } else if (listingType === "pg") {
            await prisma.pgInfo.updateMany({
                where: { id: parseInt(listingId), ownerId },
                data: { ...data, updatedByOwner: new Date() },
            });
        } else if (listingType === "hourlyroom") {
            await prisma.hourlyInfo.updateMany({
                where: { id: parseInt(listingId), ownerId },
                data: { ...data, updatedByOwner: new Date() },
            });
        }

        res.status(200).json({ message: "Listing updated successfully" });
    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).json({ message: "Server error" });
    }
});

ownerDashboard.get("/details-owner" , authenticate , async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.user; // Corrected destructuring
    try {
        const ownerDetails = await prisma.owner.findUnique({
            where: { id },
        });
        if (!ownerDetails) {
            res.status(404).json({ message: "Owner not found" });
            return;
        }
        res.status(200).json({ message: "Owner details fetched successfully", ownerDetails });
        return;
    } catch (error) {
        console.log("Error fetching owner details:", error);
         res.status(500).json({ message: "Server error" });
        return;
    }
});

ownerDashboard.post("/contact-owner", authenticate , async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
        const { propertyId, propertyType, ownerId, address  } = req.body;
        const token = req.headers.token as string;
        console.log(token);
        console.log(req.body);
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: Token is missing' });
        }

        // Verify JWT token and extract user details
        const decoded = verifyToken(token);
        console.log(decoded);
        if (!decoded) {
            return res.status(403).json({ message: "Invalid token" });
        }
        
        
        const { username, mobile } = decoded;

        // Fetch Owner Details
        const owner = await prisma.owner.findUnique({ where: { id: Number(ownerId) } });
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        // Create a contact log entry with 30-day validity
        await prisma.contactLog.create({
            data: {
                ownerId,
                userId: decoded.id,
                listingId : propertyId,
                customerName: username,
                customerPhone: mobile,
                adress : address,
                accessDate: new Date(),
                isExpired: false,
                propertyType,
                ownerName: owner.username,
                ownerPhone: owner.mobile,
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
            },
        });

        // Reduce owner's points by 1
        if (owner.points <= 0) {

            await prisma.flatInfo.updateMany({
                where: { ownerId: ownerId },
                data: { isVisible: false },
            });

            await prisma.roomInfo.updateMany({
                where: { ownerId: ownerId },
                data: { isVisible: false },
            });

            await prisma.pgInfo.updateMany({
                where: { ownerId: ownerId },
                data: { isVisible: false },
            });

            await prisma.hourlyInfo.updateMany({
                where: { ownerId: ownerId },
                data: { isVisible: false },
            });

        }else{
            await prisma.owner.update({
                where: { id: ownerId },
                data: {
                    points: { decrement: owner.points > 0 ? 1 : 0 },
                },
            });
        }
        
        // Return Owner’s Contact Info for User
        return res.status(200).json({
            message: 'Contact logged successfully',
            contactInfo: {
                ownerName: owner.username,
                ownerMobile: owner.mobile,
                expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

ownerDashboard.delete("/recentContacts/delete", authenticate, async (req: AuthenticatedRequest, res: Response) => {
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
            data: { ownerDeleted: true }
        });

        res.status(200).json({ success: true, message: "Contact log deleted" });
    } catch (error) {
        console.error("Error deleting contact log:", error);
        res.status(500).json({ success: false, message: "Error deleting contact log", error });
    }
})

export { ownerDashboard };