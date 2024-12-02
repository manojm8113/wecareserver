const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Username: { type: String, required: true },
    Address: { type: String, required: true },
    Zip: { type: Number, required: true },
    Phone: { type: Number, required: true },
    Email: { type: String, unique: true, required: true },
    Password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
