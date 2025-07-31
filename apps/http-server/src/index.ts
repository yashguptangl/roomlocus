import express from "express";
import { userRouter } from "./routes/user.auth";
import { ownerRouter } from "./routes/owner";
import { listingRouter } from "./routes/listing";
import { ownerDashboard } from "./routes/owner.dashboard";
import { agentRouter } from "./routes/agent.auth";
import { agentProfileRouter } from "./routes/agent.profile";
import verificationRequestRouteByAgent from "./routes/agentVerification";
import cors from 'cors';
import "./cronJob";
import userDashboard from "./routes/user.dashboard";
import selfVerification from "./routes/selfVerification";
import paymentRouter from "./routes/payment";
import locationRouter from "./routes/location";
import nearmeRouter from "./routes/nearme";
import listingNoCheck from "./routes/listingVerifyNo";
import { RazorpayWebhookHandler } from "./routes/razorpay.webhook";

const app = express();

app.options('*', cors()); // Handle preflight requests for all routes


// 1. RAW body for Razorpay webhook (must be before json parser and before paymentRouter)
app.post("/api/v1/payment/razorpay/webhook",express.raw({ type: "application/json" }), RazorpayWebhookHandler);

// 2. CORS and JSON parser for all other routes
app.use(cors({
    origin: ["https://www.roomlocus.com", "http://localhost:3000", "https://roomlocus.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// 3. Register paymentRouter (webhook route is NOT inside this)
app.use("/api/v1/payment", paymentRouter);

// 4. Rest of your routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/owner", ownerRouter);
app.use("/api/v1/listing", listingRouter);
app.use("/api/v1/owner", ownerDashboard);
app.use("/api/v1/user", userDashboard);
app.use("/api/v1/agent", agentRouter);
app.use("/api/v1/agent", agentProfileRouter);
app.use("/api/v1/agent", verificationRequestRouteByAgent);
app.use("/api/v1/owner/self", selfVerification);
app.use("/api/v1/location", locationRouter);
app.use("/api/v1/near-me", nearmeRouter);
app.use("/api/v1/listing-no-check", listingNoCheck);

app.get("/api/health", (req, res) => {
    res.send("Hello World");
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});