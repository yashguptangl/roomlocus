import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import { prisma } from "@repo/db/prisma";
import bodyParser from "body-parser";

dotenv.config();

const paymentRouter = express.Router();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_SECRET!;
const SUCCESS_URL = process.env.SUCCESS_URL!;
const OWNER_DASHBOARD_URL = process.env.OWNER_DASHBOARD_URL!;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Middleware to log all payment requests
paymentRouter.use((req, res, next) => {
  console.log(`Payment request: ${req.method} ${req.path}`);
  next();
});

// Create Razorpay Order
paymentRouter.post("/razorpay", async (req, res) => {
  try {
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
      paymentFor,
      ownerId,
      leadCount,
      leadPrice,
    } = req.body;

    // Validate required fields
    if (!paymentFor || !email || !phone) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    let amount = 365; // Default for listing verification
    if (paymentFor === "lead") {
      if (!leadCount || !leadPrice || !ownerId) {
        res.status(400).json({ error: "Missing lead purchase details" });
        return;
      }
      amount = Number(leadCount) * Number(leadPrice);
    }

    // Check for existing successful payment for listings
    if (paymentFor === "listing" && listingId) {
      const existingPayment = await prisma.payment.findFirst({
        where: {
          listingId,
          status: "SUCCESS",
        },
      });

      if (existingPayment) {
        res.status(400).json({
          error: "Payment already completed for this listing",
          paymentId: existingPayment.id
        });
        return;
      }
    }

    const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create payment record in database
    const paymentRecord = await prisma.payment.create({
      data: {
        orderId,
        listingId: listingId || null,
        listingType: listingType || null,
        email,
        phone,
        amount,
        status: "PENDING",
        city: city || null,
        address: address || null,
        location: location || null,
        townSector: townSector || null,
        listingShowNo: listingShowNo || null
      },
    });

    // Create Razorpay order
    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: orderId,
      payment_capture: 1,
      notes: {
        paymentId: paymentRecord.id,
        listingId,
        listingType,
        paymentFor,
        ownerId,
        leadCount,
        leadPrice,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Update payment with Razorpay order ID
    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: { razorpayOrderId: razorpayOrder.id },
    });

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      keyId: RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: paymentFor === "lead" ? "Lead Purchase" : "Listing Verification",
      description: paymentFor === "lead"
        ? `Purchase of ${leadCount} leads`
        : "Listing verification fee",
      prefill: { name: firstname, email, contact: phone },
      notes: options.notes,
      backendOrderId: orderId,
      paymentFor,
    });
    return;
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      error: "Order creation failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
    return;
  }
});

// Payment Verification
paymentRouter.post("/razorpay/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      backendOrderId,
      paymentFor,
      ownerId,
      leadCount,
    } = req.body;

    // Validate signature
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("Signature verification failed");
      res.status(400).json({ error: "Invalid payment signature" });
      return
    }

    // Update payment status
    const payment = await prisma.payment.update({
      where: { orderId: backendOrderId },
      data: {
        status: "SUCCESS",
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
      },
    });

    // Handle listing verification
    if (paymentFor === "listing" && payment.listingId && payment.listingType) {
      const updateData = { paymentDone: true };
      const listingId = Number(payment.listingId);

      switch (payment.listingType) {
        case "flat":
          await prisma.flatInfo.update({ where: { id: listingId }, data: updateData });
          break;
        case "pg":
          await prisma.pgInfo.update({ where: { id: listingId }, data: updateData });
          break;
        case "room":
          await prisma.roomInfo.update({ where: { id: listingId }, data: updateData });
          break;
        case "hourlyroom":
          await prisma.hourlyInfo.update({ where: { id: listingId }, data: updateData });
          break;
      }

      const redirectUrl = new URL(SUCCESS_URL);
      redirectUrl.searchParams.append("listingId", payment.listingId);
      redirectUrl.searchParams.append("listingType", payment.listingType);
      redirectUrl.searchParams.append("paymentId", payment.id);
      redirectUrl.searchParams.append("address", payment.address ?? "");
      redirectUrl.searchParams.append("location", payment.location ?? "");
      redirectUrl.searchParams.append("city", payment.city ?? "");
      redirectUrl.searchParams.append("townSector", payment.townSector ?? "");
      redirectUrl.searchParams.append("listingShowNo", payment.listingShowNo ?? "");

      res.json({
        success: true,
        redirect: redirectUrl.toString()
      });
      return;
    }

    // Handle lead purchase
    if (paymentFor === "lead" && ownerId && leadCount) {
      await prisma.owner.update({
        where: { id: Number(ownerId) },
        data: { points: { increment: Number(leadCount) } },
      });

      res.json({
        success: true,
        redirect: OWNER_DASHBOARD_URL
      });
      return;
    }

    res.status(400).json({ error: "Invalid payment type" });
    return;

  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      error: "Payment verification failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
    return;
  }
});

// Webhook Handler
paymentRouter.post(
  "/razorpay/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["x-razorpay-signature"] as string;
    const body = req.body.toString('utf-8');

    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("base64");      


      if (expectedSignature !== signature) {
        console.error("Webhook signature mismatch");
        res.status(400).send("Invalid signature");
        return;
      }

      const event = JSON.parse(body);
      console.log("Webhook event received:", event.event);

      // Handle payment captured event
      if (event.event === "payment.captured") {
        const paymentData = event.payload.payment.entity;
        const razorpayOrderId = paymentData.order_id;
        const razorpayPaymentId = paymentData.id;

        // Find payment record
        const payment = await prisma.payment.findFirst({
          where: { razorpayOrderId },
        });

        if (!payment) {
          console.error("Payment record not found for order:", razorpayOrderId);
          res.status(404).send("Payment not found");
          return;
        }

        // Skip if already processed
        if (payment.status === "SUCCESS") {
          res.status(200).send("Already processed");
          return;
        }

        // Update payment status
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESS",
            razorpayPaymentId,
          },
        });

        // Update listing status if applicable
        if (payment.listingId && payment.listingType) {
          const updateData = { paymentDone: true };
          const listingId = Number(payment.listingId);

          switch (payment.listingType) {
            case "flat":
              await prisma.flatInfo.update({ where: { id: listingId }, data: updateData });
              break;
            case "pg":
              await prisma.pgInfo.update({ where: { id: listingId }, data: updateData });
              break;
            case "room":
              await prisma.roomInfo.update({ where: { id: listingId }, data: updateData });
              break;
            case "hourlyroom":
              await prisma.hourlyInfo.update({ where: { id: listingId }, data: updateData });
              break;
          }
        }

        console.log("Payment successfully processed via webhook");
        res.status(200).send("Webhook processed");
        return;
      }

      // Handle payment failed event
      if (event.event === "payment.failed") {
        const paymentData = event.payload.payment.entity;
        const razorpayOrderId = paymentData.order_id;

        await prisma.payment.updateMany({
          where: { razorpayOrderId, status: "PENDING" },
          data: { status: "FAILED" },
        });

        console.log("Payment marked as failed via webhook");
        res.status(200).send("Webhook processed");
        return;
      }

      res.status(200).send("Event not handled");
      return;

    } catch (error) {
      console.error("Webhook processing error:", error);
      res.status(500).send("Internal server error");
      return;
    }
  }
);

export default paymentRouter;