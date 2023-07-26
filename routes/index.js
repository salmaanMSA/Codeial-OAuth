const express = require('express');
const homeController = require('../controllers/homeController');


const router = express.Router();


router.get('/', homeController.viewHome); // view home page
router.use('/users', require('./userRoutes')); // initialize user routes


module.exports = router;