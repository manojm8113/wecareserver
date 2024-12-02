const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppointmentSchema = new Schema({
  patientName: { type: String, required: true },
  patientAge: { type: Number, required: true },
  phone: { type: String, required: true },
  section: { type: String, required: true },
  doctor: { type: String, required: true },
  date: { type: Date, required: true },
  paymentId: { type: String, required: true },
  orderId: { type: String, required: true },
});

module.exports = mongoose.model('Appointment', AppointmentSchema);