const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company"
    },
    minimumAge: Number,
    userAge: Number,
    allowed: Boolean,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Verification", verificationSchema);