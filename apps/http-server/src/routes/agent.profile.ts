import express from "express";
import { Request, Response } from "express";
import { prisma } from "@repo/db/prisma";
import { authenticate } from "../middleware/auth";
const agentProfileRouter = express.Router();
import { putObject } from "../utils/s3client";
agentProfileRouter.use(express.json());

agentProfileRouter.post("/details", authenticate, async (req: Request, res: Response) => {
  const { agentId, data } = req.body;
  try {
    // Upsert personal details
    const progress = await prisma.agentprogress.upsert({
      where: { agentId: String(agentId) },
      update: { step: 'personalDetails', data },
      create: { agentId: String(agentId), step: 'personalDetails', data },
    });

    res.status(200).json({ message: 'Personal details saved successfully', progress });
    return;
  } catch (error) {
    console.error('Error saving personal details:', error);
    res.status(500).json({ error: 'Failed to save personal details' });
    return;
  }
});

agentProfileRouter.post("/bank-details", authenticate, async (req: Request, res: Response) => {
  const { agentId, data } = req.body;

  try {
    // Upsert bank details
    const progress = await prisma.agentprogress.upsert({
      where: { agentId: String(agentId) },
      update: { step: 'bankDetails', data },
      create: { agentId: String(agentId), step: 'bankDetails', data },
    });

    res.status(200).json({ message: 'Bank details saved successfully', progress });
    return;
  } catch (error) {
    console.error('Error saving bank details:', error);
    res.status(500).json({ error: 'Failed to save bank details' });
    return;
  }
});

agentProfileRouter.post("/upload-agent-doc",  authenticate, async (req: Request, res: Response) => {
    const { agentId  } = req.body;

    try {
      const categories = ["agentImage", "aadharFront", "aadharBack", "panCard" , "passbook"];
      const urls: { [key: string]: string } = {};

      // Upload files and validate formats
      for (const category of categories) {
        urls[category] = await putObject(
          `agent-kyc-documents/${agentId}/${category}.jpeg`,
          "image/jpeg"
      );
    }
    const progress = await prisma.agentprogress.update({
      where: { agentId: String(agentId) },
      data: { step: "uploadDocuments" },
    });

    res.status(200).json({ message: "Images uploaded successfully", presignedUrls : urls, progress });
    return;
  } catch (error) {
    console.error("Error uploading images:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to upload images";
    res.status(400).json({ error: errorMessage });
    return;
  }
});


agentProfileRouter.get("/progress/:id", authenticate, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const progress = await prisma.agentprogress.findUnique({
      where: { agentId: id },
    });
    console.log('Progress:', progress);
    if (progress) {
      res.status(200).json({ progress });
    } else {
      res.status(402).json({ message: 'No progress found for this user' });
    }
  } catch (error) {
    console.error('Error retrieving progress:', error);
    res.status(500).json({ error: 'Failed to retrieve progress' });
  }
});


agentProfileRouter.get("/agent/:agentId", authenticate, async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const agent = await prisma.agent.findUnique({
      where: { agentId },
    });
    res.status(200).json({ agent });
  }
  catch (error) {
    console.error('Error fetching agent requests:', error);
    res.status(500).json({ error: 'Failed to fetch agent ' });
  }
}
);

export { agentProfileRouter };