const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'default' },
  platformName: { type: String, trim: true, maxlength: 80, default: 'DOCVIA' },
  supportEmail: { type: String, trim: true, maxlength: 160, match: [/^\S+@\S+\.\S+$/, 'Support email must be valid'], default: 'support@docvia.local' },
  supportPhone: { type: String, trim: true, maxlength: 40, default: '' },
  appointmentLeadTimeHours: { type: Number, min: 0, max: 168, default: 1 },
  allowPatientCancellation: { type: Boolean, default: true },
  cancellationCutoffHours: { type: Number, min: 0, max: 168, default: 2 },
  reminder24hEnabled: { type: Boolean, default: true },
  reminder2hEnabled: { type: Boolean, default: true },
  maintenanceMode: { type: Boolean, default: false },
  privacyNotice: { type: String, trim: true, maxlength: 4000, default: 'Medical information is visible only to the patient and the doctor assigned to the appointment.' },
  termsNotice: { type: String, trim: true, maxlength: 4000, default: 'DOCVIA supports appointment coordination and does not replace emergency medical services.' },
}, { timestamps: true });

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
