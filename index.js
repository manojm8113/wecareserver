const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Initialize express and environment variables
dotenv.config();
const app = express();

// Apply CORS middleware
app.use(cors({
    origin: "https://wecarehospital.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

// Import routes
const userRouter = require('./Router/Userrouter');
const userMessage = require('./Router/Contactrouter');
const doctors = require('./Router/Doctorrouter');
const doctorLogin = require('./Router/Doctorlogin');
const adminSignup = require('./Router/AdminRouter');
const adminLogin = require('./Router/AdminLogin');
const appointment = require('./Router/Appointmentrouter');

// Database connection
mongoose.connect(process.env.MongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database connected successfully.");
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
    });

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// API routes
app.use("/userRegister", userRouter);
app.use("/usermessage", userMessage);
app.use("/doctors", doctors);
app.use("/doctorLogin", doctorLogin);
app.use("/AdminSignup", adminSignup);
app.use("/AdminLogin", adminLogin);
app.use("/appointment", appointment);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
