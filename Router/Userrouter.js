const express = require('express');
const router = express.Router();
const User = require('../Model/Userschema');
const cryptojs = require('crypto-js');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const verifyToken = require('../Verification/verifyToken');

// Signup Route
router.post('/signup', async (req, res) => {
    console.log("body data", req.body);
    req.body.Password = cryptojs.AES.encrypt(req.body.Password, process.env.CRYPTO_SECRET).toString();
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        res.status(200).json("success");
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json("failed to register");
    }
});

// Get All Users Route
router.get('/getuserDatas', async (req, res) => {
    console.log("Fetching all users");
    try {
        const allUsers = await User.find();
        res.status(200).json(allUsers);
    } catch (err) {
        console.error("Fetch all users error:", err);
        res.status(500).json("failed");
    }
});

// Get Single User by Email
router.get('/getData', async (req, res) => {
    console.log("Fetching user by email:", req.body.Email);
    try {
        const user = await User.findOne({ Email: req.body.Email });
        res.status(200).json(user);
    } catch (err) {
        console.error("Fetch user by email error:", err);
        res.status(500).json("failed");
    }
});

// Get Single User by ID with Token Verification
router.get('/Getdatas/:id', verifyToken, async (req, res) => {
    console.log("Fetching user by ID from params:", req.params.id);
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    } catch (err) {
        console.error("Fetch user by ID error:", err);
        res.status(500).json("failed");
    }
});



// Delete User by ID
router.delete('/deletedata/:id', async (req, res) => {
    console.log("Deleting user by ID:", req.params.id);
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        res.status(200).json(deletedUser);
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json("failed");
    }
});

// Update User by ID
router.put('/updateData/:id', async (req, res) => {
    console.log("Updating user by ID:", req.params.id);
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json("Internal server error");
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const findUser = await User.findOne({ Email: req.body.Email });
        if (!findUser) {
            return res.status(401).json({ message: 'Email not registered' });
        }

        const decryptedPassword = cryptojs.AES.decrypt(findUser.Password, process.env.CRYPTO_SECRET);
        const originalPassword = decryptedPassword.toString(cryptojs.enc.Utf8);

        if (req.body.Password !== originalPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: findUser._id },
            process.env.JWTSEKEY,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, id: findUser._id });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
});
// Forgot Password route
router.post('/forgot-password', async (req, res) => {
    try {
        const findUser = await User.findOne({ Email: req.body.Email });
        if (!findUser) {
            return res.status(401).json({ message: 'Email not registered' });
        }

        const resetToken = cryptojs.lib.WordArray.random(32).toString();
        const hashedResetToken = cryptojs.AES.encrypt(resetToken, process.env.CRYPTO_SECRET).toString();

        findUser.resetPasswordToken = hashedResetToken;
        findUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await findUser.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL,
            to: findUser.Email,
            subject: 'Password Reset',
            html: `<p>You requested a password reset. Click the link below to reset your password:</p>
                   <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(500).json({ message: 'Error sending email', error: error.message });
            }
            res.status(200).json({ message: 'Password reset email sent' });
        });
    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
});

// Reset Password route
router.put('/reset-password/:token', async (req, res) => {
    try {
        const resetToken = req.params.token;
        console.log(`Received reset token: ${resetToken}`);

        const findUser = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!findUser) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        const encryptedPassword = cryptojs.AES.encrypt(req.body.Password, process.env.CRYPTO_SECRET).toString();
        findUser.Password = encryptedPassword;
        findUser.resetPasswordToken = undefined;
        findUser.resetPasswordExpires = undefined;

        await findUser.save();
        res.status(200).json({ message: 'Password has been reset' });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
});

module.exports = router;
