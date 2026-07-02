const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Company = require("./models/Company");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   MongoDB CONNECT
========================= */
mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log("🗄️ MongoDB connected");
})
.catch((error) => {
    console.log("MongoDB error:", error);
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
    res.json({
        project: "PrivAge",
        version: "1.1.0",
        status: "running"
    });
});

/* =========================
   TEST ROUTE
========================= */
app.get("/test", (req, res) => {
    res.json({
        message: "PrivAge test ishladi"
    });
});

/* =========================
   CREATE COMPANY (API KEY GENERATOR)
========================= */
app.post("/companies", async (req, res) => {

    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            success: false,
            message: "name and email required"
        });
    }

    const apiKey =
        "priv_live_" + Math.random().toString(36).substring(2, 15);

    const company = await Company.create({
        name,
        email,
        apiKey
    });

    res.json({
        success: true,
        company
    });
});

/* =========================
   VERIFY AGE (REAL DB VERSION)
========================= */
app.post("/verify-age", async (req, res) => {

    const { apiKey, minimumAge, userAge } = req.body;

    if (!apiKey) {
        return res.status(401).json({
            success: false,
            message: "API key required"
        });
    }

    const company = await Company.findOne({ apiKey });

    if (!company) {
        return res.status(403).json({
            success: false,
            message: "Invalid API key"
        });
    }

    if (minimumAge === undefined || userAge === undefined) {
        return res.status(400).json({
            success: false,
            message: "minimumAge and userAge are required"
        });
    }

    const allowed = userAge >= minimumAge;

    res.json({
        success: true,
        company: company.name,
        verified: true,
        allowed,
        requiredAge: minimumAge
    });
});

/* =========================
   SERVER START
========================= */
app.listen(3000, () => {
    console.log("🚀 PrivAge API running on port 3000");
});