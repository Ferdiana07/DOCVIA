const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  subject: { type: String, trim: true, required: true, maxlength: 160 },
  description: { type: String, trim: true, required: true, maxlength: 2000 },
  status: { type: String, enum: ['open', 'in_review', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  adminResponse: { type: String, trim: true, default: '', maxlength: 2000 },
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

disputeSchema.index({ openedBy: 1, createdAt: -1 });
disputeSchema.index({ status: 1, priority: 1, createdAt: -1 });

module.exports = mongoose.model('Dispute', disputeSchema);
