const express = require('express');
const { getPlatformSettings } = require('../utils/platformSettings');

const router = express.Router();
router.get('/public', async (req, res, next) => {
  try {
    const settings = await getPlatformSettings();
    res.status(200).json({ success: true, data: {
      platformName: settings.platformName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      maintenanceMode: settings.maintenanceMode,
      privacyNotice: settings.privacyNotice,
      termsNotice: settings.termsNotice,
    } });
  } catch (error) { next(error); }
});

module.exports = router;
