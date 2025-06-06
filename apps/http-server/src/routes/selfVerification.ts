import express from 'express';
const selfVerification = express.Router();
import { prisma } from '@repo/db/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { putObject } from '../utils/s3client';

selfVerification.post("/verification-request", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const { listingId, listingType, listingShowNo, location , city, townSector } = req.body;
        const ownerId = req.user?.id;

        // Validate required fields
        if (!listingId || !listingType || !listingShowNo || !location || !city || !townSector) {
            res.status(400).json({ error: 'Missing required fields: listingId, listingType, listingShowNo, location, city, townSector' });
            return;
        }

        // Step 1: Create the verification request
        const verification = await prisma.verificationRequest.create({
            data: {
                listingId,
                listingType,
                ownerId,
                listingShowNo,
                location,
                city: city,
                townSector: townSector,
                verificationType: 'SELF',
                status: 'PENDING',
                imagesUploaded: false
            }
        });

        // Step 2: Upload both required images
        const categories = ["selfiewithaadhar", "frontbuildingview"];
        const urls: { [key: string]: string } = {};

        for (const category of categories) {
            const imageUrl = await putObject(
                `self-verification/${ownerId}/${verification.id}/${category}.jpeg`,
                "image/jpeg"
            );
            urls[category] = imageUrl;
        }

        // Update the verification request with image upload status
        const updatedData = await prisma.verificationRequest.update({
            where: { id: verification.id },
            data: {
                status: 'PENDING',
                imagesUploaded: true,
                updatedAt: new Date()
            }
        });


        res.status(201).json({
            message: 'Verification request and images submitted successfully',
            verification: updatedData,
            imageUrls: urls
        });

    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({ error: 'Something went wrong', details: errorMessage });
    }
});

selfVerification.get("/verified-requests", authenticate, async (req: AuthenticatedRequest, res) => {
    try {
        const { listingId, listingType } = req.query;
        const ownerId = req.user?.id;
        const requests = await prisma.verificationRequest.findMany({
            where: {
                listingId: listingId ? Number(listingId) : undefined,
                listingType: listingType as string | undefined,
                ownerId: ownerId ? Number(ownerId) : undefined
            }
        });
        res.status(200).json(requests);
    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({ error: 'Failed to fetch verified requests', details: errorMessage });
    }
})

// ✅ Owner Updates Verification (Change Agent or Switch to Self-Verification)
selfVerification.post('/owner-update-verification/:requestId', authenticate, async (req, res) => {
    try {
        const { requestId } = req.params;
        const { newAgentId, verificationType } = req.body;

        if (verificationType === 'SELF') {
            await prisma.verificationRequest.update({
                where: { id: requestId },
                data: { agentId: null, verificationType: 'SELF', status: 'PENDING', updatedAt: new Date() , imagesUploaded: false }  // ✅ Changing status to 'InProgress' when owner takes over
            });

            res.json({ message: 'Switched to self-verification' });
            return;
        }

        const updatedRequest = await prisma.verificationRequest.update({
            where: { id: requestId },
            data: { agentId: newAgentId, status: 'PENDING', updatedAt: new Date() }
        });

        res.json({ message: 'Agent reassigned', updatedRequest });
    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({ error: 'Failed to update verification request', details: errorMessage });
    }
});


// only presigned url 
selfVerification.get("/presigned-urls/:requestId", authenticate, async (req : AuthenticatedRequest, res) => {
  try {
    const { requestId } = req.params;
    const ownerId = req.user?.id;
    // Find the verification request
    const verification = await prisma.verificationRequest.findUnique({
      where: { id: requestId }
    });
    if (!verification) {
      res.status(404).json({ error: "Verification request not found" });
      return;
    }

    // Generate presigned URLs for both images
    const categories = ["selfiewithaadhar", "frontbuildingview"];
    const urls: { [key: string]: string } = {};
    for (const category of categories) {
      urls[category] = await putObject(
        `self-verification/${ownerId}/${verification.id}/${category}.jpeg`,
        "image/jpeg"
      );
    }

    res.json({ imageUrls: urls });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate presigned URLs" });
  }
});

export default selfVerification;