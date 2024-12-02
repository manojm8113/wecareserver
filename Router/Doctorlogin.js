const router = require('express').Router();
const doctor = require('../Model/DoctorsSchema');
const JWT = require('jsonwebtoken');
const Crypto = require('crypto-js');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find doctor and validate password
        const finddoctor = await doctor.findOne({ email });
        if (!finddoctor) {
            return res.status(401).json({ message: 'Email not registered' });
        }

        const decryptedPassword = Crypto.AES.decrypt(finddoctor.password, process.env.crypto);
        const originalPassword = decryptedPassword.toString(Crypto.enc.Utf8);

        if (password !== originalPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Generate JWT token
        const doctorToken = JWT.sign({ id: finddoctor._id }, process.env.JWTSEKEY, { expiresIn: '1d' });

        // Send response with doctorToken and doctor ID
        res.status(200).json({ doctorToken, id: finddoctor._id });
    } catch (err) {
        res.status(500).json({ message: 'An error occurred', error: err.message });
    }
});

module.exports = router;
