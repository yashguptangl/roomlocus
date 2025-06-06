import { Router } from 'express';
import { prisma } from '@repo/db/prisma';
import { putObject } from '../utils/s3client';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const verificationRequestRouteByAgent = Router();

// ✅ Create Verification Request By Owner
verificationRequestRouteByAgent.post('/verification-request', authenticate, async (req: AuthenticatedRequest, res) => {
    const ownerId = req.user?.id;
    try {
        const { listingId, listingType, agentId , city , townSector , location ,  listingShowNo } = req.body;

        const verification = await prisma.verificationRequest.create({
            data: {
                listingId: parseInt(listingId),
                listingType,
                city,
                townSector,
                location,
                listingShowNo,
                ownerId : parseInt(ownerId),
                agentId,
                verificationType: 'AGENT',
                status: 'PENDING',
            }
        });
        res.status(201).json({ message: 'Verification request sent', verification });
    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({ error: 'Something went wrong', details: errorMessage });
    }
});

// ✅ Fetch Pending Agent Requests
verificationRequestRouteByAgent.get('/agent-requests/:agentId', authenticate, async (req, res) => {
    try {
        const { agentId } = req.params;
        
        const requests = await prisma.verificationRequest.findMany({
            where: { agentId, status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
        });
        const owner = await prisma.owner.findMany({
            where: { id: { in: requests.map(request => request.ownerId) } },
        });
        res.status(200).json({ requests, owner });
    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({ error: 'Failed to fetch agent requests', details: errorMessage });
    }
});

// ✅ Agent Accepts Request and Uploads Verification Request Images
verificationRequestRouteByAgent.post('/agent-accept-request', authenticate, async (req : AuthenticatedRequest, res) => {

    try {
        const { agentId, requestId } = req.query;
        const categories = ["selfieWithOwner", "frontbuildingview"];
        const urls: { [key: string]: string } = {};

        // Update the request status to 'CONFIRMED'
        const updatedRequest = await prisma.verificationRequest.update({
            where: { id: requestId as string },
            data: { status: 'CONFIRMED' }
        });

        // Upload images for the verification request
        for (const category of categories) {
            const imageUrl = await putObject(
                `agent-verification/${agentId}/${requestId}/${category}.jpeg`,
                "image/jpeg"
            );
            urls[category] = imageUrl;
        }

        // Update the verification request with images and mark as 'DONE'
        const updatedData = await prisma.verificationRequest.update({
            where: { id: requestId as string },
            data: {
                status: 'DONE',
                imagesUploaded: true,
                updatedAt: new Date()
            }
        });

        // Update the corresponding listing status to 'VERIFIED'
        if (updatedData.listingType === "flat") {
            await prisma.flatInfo.update({
                where: { id: updatedData.listingId },
                data: { isVerified: true, verificationPending: false, verifiedByAdminOrAgent: new Date() }
            });
        } else if (updatedData.listingType === "room") {
            await prisma.roomInfo.update({
                where: { id: updatedData.listingId },
                data: { isVerified: true, verificationPending: false, verifiedByAdminOrAgent: new Date() }
            });
        } else if (updatedData.listingType === "pg") {
            await prisma.pgInfo.update({
                where: { id: updatedData.listingId },
                data: { isVerified: true, verificationPending: false, verifiedByAdminOrAgent: new Date() }
            });
        } else if (updatedData.listingType === "hourlyroom") {
            await prisma.hourlyInfo.update({
                where: { id: updatedData.listingId },
                data: { isVerified: true, verificationPending: false, verifiedByAdminOrAgent: new Date() }
            });
        }

        // Increment the agent's wallet by 200rs
        await prisma.agent.update({
            where: { agentId: String(agentId) },
            data: { walletRs: { increment: 200 } }
        });

        res.status(200).json({ 
            message: 'Request accepted and images uploaded successfully', 
            urls, 
            updatedData 
        });
    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({ error: 'Something went wrong', details: errorMessage });
    }
});

// ✅ Get all verified properties by agent (with sorting)
verificationRequestRouteByAgent.get('/agent-verified-properties/:agentId', authenticate, async (req, res) => {
    try {
        const { agentId } = req.params;
        const { sort = 'newest' } = req.query; // Default to newest first

        const requests = await prisma.verificationRequest.findMany({
            where: { 
                agentId, 
                status: 'DONE',
                imagesUploaded: true
            },
            orderBy: sort === 'oldest' ? 
                { createdAt: 'asc' } : 
                { createdAt: 'desc' }
        });
        const owner = await prisma.owner.findMany({
            where: { id: { in: requests.map(request => request.ownerId) } },
        });

        res.status(200).json({requests , owner });
    } catch (error) {
        const errorMessage = (error as Error).message;
        res.status(500).json({ error: 'Failed to fetch verified properties', details: errorMessage });
    }
});

export default verificationRequestRouteByAgent;
