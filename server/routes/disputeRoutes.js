const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const { createDispute, getMyDisputes } = require('../controllers/disputeController');

const router = express.Router();
router.use(authenticateUser);
router.get('/mine', getMyDisputes);
router.post('/', createDispute);

module.exports = router;
