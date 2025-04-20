import express from "express"
import { userRouter } from "./routes/user.auth";
import { ownerRouter } from "./routes/owner";
import { listingRouter } from "./routes/listing";
import { ownerDashboard } from "./routes/owner.dashboard";
import { agentRouter } from "./routes/agent.auth";
import { agentProfileRouter } from "./routes/agent.profile";
import  verificationRequestRouteByAgent  from "./routes/agentVerification";
import cors from 'cors';
import "./cronJob";
import userDashboard from "./routes/user.dashboard";
// import { setupWebSocketServer } from "ws/setupWebSocketServer";
import http from "http";
import agentVerification from "./routes/agentVerification";
import selfVerification from "./routes/selfVerification";


const app = express();
const server = http.createServer(app);
app.use(express.json());
app.options('*', cors()); // Handle preflight requests for all routes


// Use CORS middleware
app.use(cors({
    origin : ["http://localhost:3000"],
    methods : ['GET','POST','PUT','DELETE'],
}));


app.use("/api/v1/user",userRouter);
app.use("/api/v1/owner",ownerRouter);
app.use("/api/v1/listing",listingRouter);
app.use("/api/v1/owner",ownerDashboard);
app.use("/api/v1/user", userDashboard);
app.use("/api/v1/agent" , agentRouter);
app.use("/api/v1/agent", agentProfileRouter);
app.use("/api/v1/agent" , verificationRequestRouteByAgent);
app.use("/api/v1/owner/self", selfVerification)

app.get("/",(req,res) => {
    res.send("Hello World");
})

app.listen(3001 , () =>{
    console.log("Server is running on port 3001");
})