import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: String, required: true }, // ✅ fixed here
  show: { type: String, required: true, ref: 'Show' },
  amount: { type: Number, required: true },
  bookedSeats: { type: Array, required: true },
  isPaid: { type: Boolean, default: true },
  paymentLink: { type: String },
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
