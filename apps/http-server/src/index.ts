import express from "express"
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
import bodyParser from "body-parser";
const app = express();

app.options('*', cors()); // Handle preflight requests for all routes

// Apply body parsers and cors globally **before** routers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json()); // body-parser.json() is similar to express.json(), you may only need one
app.use(cors({
    origin: ["https://www.roomlocus.com", "http://localhost:3000", "https://roomlocus.com"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// ---- Register paymentRouter (webhook) FIRST ----
app.use("/api/v1/payment", paymentRouter);


// ---- Rest of your routes ----
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
})

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});