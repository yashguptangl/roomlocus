import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import { prisma } from "@repo/db/prisma";

dotenv.config();

const paymentRouter = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_SECRET!;
const SUCCESS_URL = process.env.SUCCESS_URL!; // e.g. http://localhost:3000/owner/verification
const OWNER_DASHBOARD_URL = process.env.OWNER_DASHBOARD_URL!; // e.g. http://localhost:3000/owner/dashboard

console.log("Razorpay Key ID:", RAZORPAY_KEY_ID);
console.log("Razorpay Key Secret:", RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// 1. Create Razorpay Order (for both listing verification & lead buy)
paymentRouter.post("/razorpay", async (req, res) => {
  const {
    firstname,
    email,
    phone,
    listingId,
    listingType,
    address,
    location,
    city,
    townSector,
    listingShowNo,
    paymentFor, // "listing" or "lead"
    ownerId,    // for lead buy
    leadCount,  // for lead buy (number of leads to buy)
    leadPrice,  // for lead buy (price per lead)
  } = req.body;

  let amount = 365; // Default for listing verification
  if (paymentFor === "lead" && leadCount && leadPrice) {
    amount = Number(leadCount) * Number(leadPrice);
  }

  try {
    const orderId = "Order" + Math.floor(Math.random() * 1000000000);

    // Save order to DB
    await prisma.payment.create({
      data: {
        orderId,
        listingId: listingId ?? "",
        listingType: listingType ?? "",
        email,
        phone,
        amount,
        status: "PENDING",
        city,
        address,
        location,
        townSector,
        listingShowNo,
      },
    });

    // Create Razorpay order
    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: orderId,
      payment_capture: 1,
      notes: {
        listingId,
        listingType,
        address,
        location,
        city,
        townSector,
        listingShowNo,
        email,
        phone,
        paymentFor,
        ownerId,
        leadCount,
        leadPrice,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      keyId: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: paymentFor === "lead" ? "Lead Purchase" : "Listing Verification",
      description: paymentFor === "lead"
        ? `Buy ${leadCount} Leads`
        : "Listing Verification Fee",
      prefill: { name: firstname, email, contact: phone },
      notes: options.notes,
      backendOrderId: orderId, // DB ka orderId
      paymentFor,
    });
  } catch (err: any) {
    console.log("Razorpay Create Order Error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

// 2. Razorpay Payment Verification & Redirect
paymentRouter.post("/razorpay/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    backendOrderId, // DB ka orderId (frontend se bhejna)
    paymentFor,     // "listing" or "lead"
    ownerId,        // for lead buy
    leadCount,      // for lead buy
  } = req.body;

  // Signature verify
  const generated_signature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    res.status(400).json({ error: "Payment verification failed" });
    return;
  }

  try {
    // Update payment status in DB
    const payment = await prisma.payment.update({
      where: { orderId: backendOrderId },
      data: { status: "SUCCESS" },
    });

    if (paymentFor === "listing") {
      // Listing verification flow
      if (payment.listingType === "flat") {
        await prisma.flatInfo.update({
          where: { id: Number(payment.listingId) },
          data: { paymentDone: true },
        });
      } else if (payment.listingType === "pg") {
        await prisma.pgInfo.update({
          where: { id: Number(payment.listingId) },
          data: { paymentDone: true },
        });
      } else if (payment.listingType === "room") {
        await prisma.roomInfo.update({
          where: { id: Number(payment.listingId) },
          data: { paymentDone: true },
        });
      } else if (payment.listingType === "hourlyroom") {
        await prisma.hourlyInfo.update({
          where: { id: Number(payment.listingId) },
          data: { paymentDone: true },
        });
      }

      // Redirect to verification page with all params
      const redirectUrl = new URL(SUCCESS_URL);
      redirectUrl.searchParams.append("listingId", payment.listingId);
      redirectUrl.searchParams.append("listingType", payment.listingType);
      redirectUrl.searchParams.append("address", payment.address ?? "");
      redirectUrl.searchParams.append("location", payment.location ?? "");
      redirectUrl.searchParams.append("city", payment.city ?? "");
      redirectUrl.searchParams.append("townSector", payment.townSector ?? "");
      redirectUrl.searchParams.append("listingShowNo", payment.listingShowNo ?? "");

       res.json({ success: true, redirect: redirectUrl.toString() });
       return;
    } else if (paymentFor === "lead" && ownerId && leadCount) {
      // Lead buy flow: Owner ke points update karo
      await prisma.owner.update({
        where: { id: Number(ownerId) },
        data: { points: { increment: Number(leadCount) } },
      });

      // Redirect to owner dashboard
      res.json({ success: true, redirect: OWNER_DASHBOARD_URL });
        return;
    } else {
    res.status(400).json({ error: "Unknown payment type" });
    return;
    }
  } catch (err) {
    console.log("Razorpay Payment Update Error:", err);
    res.status(500).json({ error: "Payment update failed" });
    return;
  }
});

export default paymentRouter;