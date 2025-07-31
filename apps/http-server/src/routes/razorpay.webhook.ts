import { prisma } from "@repo/db/prisma";
import crypto from "crypto";
import dotenv from "dotenv";
import { Request, Response } from "express";
dotenv.config();

export const RazorpayWebhookHandler = async (req : Request, res : Response) => {
  const signature = req.headers["x-razorpay-signature"] as string;
  const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

  try {
    const rawBody = req.body;

    if (!rawBody) {
      console.error("No raw body found");
      res.status(400).send("No body");
      return;
    }

    const expectedSignature = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook signature mismatch");
      res.status(400).send("Invalid signature");
      return;
    }

    const event = JSON.parse(rawBody.toString("utf8"));
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

    // Default response for unhandled events
    res.status(200).send("Event not handled");
    return;
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).send("Internal server error");
  }
};