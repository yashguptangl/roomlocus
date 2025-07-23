
import { Router, Request, Response } from 'express';
import { prisma } from "@repo/db/prisma";
import sendOtpViaWhatsApp from '../utils/sendOtpViaWhatsapp';
const listingNoCheck = Router();

listingNoCheck.post("/preverify/send-otp", async (req: Request, res: Response) => {
  const { mobile } = req.body;
  if (!mobile) {
    res.status(400).json({ message: "Mobile is required" });
    return;
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  const existing = await prisma.tempMobileVerification.findUnique({
    where: { mobile },
  });

  if (existing) {
    // update existing
    await prisma.tempMobileVerification.update({
      where: { mobile },
      data: { otp, expiresAt, verified: false },
    });
  } else {
    // new record
    await prisma.tempMobileVerification.create({
      data: { mobile, otp, expiresAt },
    });
  }
    // Send OTP via WhatsApp
    await sendOtpViaWhatsApp(mobile, otp.toString());

  console.log(`OTP sent to ${mobile}: ${otp}`);
  res.status(200).json({ message: "OTP sent successfully to registered WhatsApp No" });
  return;
});

listingNoCheck.post("/preverify/verify-otp", async (req: Request, res: Response) => {
  const { mobile, otp } = req.body;

  const record = await prisma.tempMobileVerification.findUnique({
    where: { mobile },
  });

  if (!record) {
    res.status(404).json({ message: "Mobile not found" });
    return;
  }

  if (record.expiresAt < new Date()) {
    res.status(400).json({ message: "OTP expired" });
    return;
  }

  if (record.otp !== parseInt(otp)) {
    res.status(401).json({ message: "Invalid OTP" });
    return;
  }

  await prisma.tempMobileVerification.update({
    where: { mobile },
    data: { verified: true },
  });

  res.status(200).json({ message: "Mobile verified successfully" });
  return;
});

listingNoCheck.post("/preverify/resend-otp", async (req: Request, res: Response) => {
  const { mobile } = req.body;
  if (!mobile) {
    res.status(400).json({ message: "Mobile is required" });
    return;
  }

  // Call send-otp logic
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.tempMobileVerification.update({
    where: { mobile },
    data: { otp, expiresAt, verified: false },
  });

    // Send OTP via WhatsApp
    await sendOtpViaWhatsApp(mobile, otp.toString());
  console.log(`Resent OTP to ${mobile}: ${otp}`);
  res.status(200).json({ message: "OTP resent successfully" });
  return;
});

export default listingNoCheck;
