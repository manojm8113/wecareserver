const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Appointment = require('../Model/AppoinmentSchema'); // Ensure the model name and path are correct
const verifyToken = require('../Verification/doctorsToken');
const router = express.Router();

// Razorpay Payment Creation
router.post('/booking', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = {
      amount: amount * 100, // Convert to the smallest currency unit
      currency: currency,
      receipt: receipt,
    };

    const order = await razorpay.orders.create(options);
    console.log('Order Created:', order);

    if (!order) {
      return res.status(500).send('Error creating Razorpay order');
    }

    res.json(order);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).send('Error creating Razorpay order');
  }
});

// Validate Razorpay Payment and Save Appointment
router.post('/order/validate', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    patientName,
    patientAge,
    phone,
    section,
    doctor,
    date,
  } = req.body;

  // Verify payment signature
  const sha = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
  sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest = sha.digest('hex');

  if (digest !== razorpay_signature) {
    return res.status(400).json({ msg: 'Transaction is not legit!' });
  }

  try {
    const newAppointment = new Appointment({
      patientName,
      patientAge,
      phone,
      section,
      doctor,
      date,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'Pending',
    });

    const savedAppointment = await newAppointment.save();

    res.json({
      msg: 'success',
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      appointment: savedAppointment,
    });
  } catch (err) {
    console.error('Error saving appointment:', err);
    res.status(500).send('Error saving appointment');
  }
});

// Fetch All Appointments
router.get('/getappointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ msg: 'Failed to fetch appointments' });
  }
});

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Change service if using a different email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use an app-specific password for security
  },
});

// Approve Appointment
router.post('/approve-appointment', async (req, res) => {
  const { appointmentId, userEmail } = req.body;

  try {
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'Approved' });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Appointment Approved',
      text: 'Your appointment has been successfully approved.',
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Appointment approved and email sent.' });
  } catch (error) {
    console.error('Error approving appointment:', error);
    res.status(500).json({ message: 'Error approving appointment.' });
  }
});

// Cancel Appointment
router.post('/cancel-appointment', async (req, res) => {
  const { appointmentId, userEmail } = req.body;

  try {
    await Appointment.findByIdAndUpdate(appointmentId, { status: 'Canceled' });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Appointment Canceled',
      text: 'Your appointment has been canceled.',
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Appointment canceled and email sent.' });
  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({ message: 'Error canceling appointment.' });
  }
});

// Fetch Appointments for a Specific Doctor
router.get('/appointments/:doctorId', verifyToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const appointments = await Appointment.find({ doctor: doctorId });

    if (!appointments.length) {
      return res.status(404).json({ msg: 'No appointments found' });
    }

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).send('Error fetching appointments');
  }
});

module.exports = router;
