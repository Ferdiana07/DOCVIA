const PlatformSetting = require('../models/PlatformSetting');

const getPlatformSettings = () => PlatformSetting.findOneAndUpdate(
  { key: 'default' },
  { $setOnInsert: { key: 'default' } },
  { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
);

module.exports = { getPlatformSettings };
