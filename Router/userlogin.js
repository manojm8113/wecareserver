const express = require('express');
const router = express.Router();
const user = require('../Model/Userschema');
const jwt = require('jsonwebtoken');
const Crypto = require('crypto-js');
const nodemailer = require('nodemailer');

// Login route
router.post('/login', async (req, res) => {
    try {
        const finduser = await user.findOne({ Email: req.body.Email });
        if (!finduser) {
            return res.status(401).json({ message: 'Email not registered' });
        }

        const decryptedPassword = Crypto.AES.decrypt(finduser.Password, process.env.CRYPTO_SECRET);
        const originalPassword = decryptedPassword.toString(Crypto.enc.Utf8);

        if (req.body.Password !== originalPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: finduser._id },
            process.env.JWTSEKEY,
            { expiresIn: '1d' }
        );

        res.status(200).json({ token, id: finduser._id });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
});

router.post('/forgot-password', async (req, res) => {
    try {
        const finduser = await user.findOne({ Email: req.body.Email });
        if (!finduser) {
            return res.status(401).json({ message: 'Email not registered' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = Crypto.AES.encrypt(resetToken, process.env.CRYPTO_SECRET).toString();

        finduser.resetPasswordToken = hashedResetToken;
        finduser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await finduser.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const resetLink = `${process.env.CLIENT_URL}/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL,
            to: finduser.Email,
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

router.put('/reset-password/:token', async (req, res) => {
    try {
        const resetToken = req.params.token;
        console.log(`Received reset token: ${resetToken}`);

        const finduser = await user.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!finduser) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Update user's password
        const encryptedPassword = Crypto.AES.encrypt(req.body.Password, process.env.CRYPTO_SECRET).toString();
        finduser.Password = encryptedPassword;
        finduser.resetPasswordToken = undefined;
        finduser.resetPasswordExpires = undefined;

        await finduser.save();
        res.status(200).json({ message: 'Password has been reset' });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ message: "An error occurred", error: err.message });
    }
});

module.exports = router;
