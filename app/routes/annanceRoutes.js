const express = require('express');
const router = express.Router();
const annanceController = require('../controllers/annanceController');
const { authJwt } = require("../middlewares");
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // The directory where files will be stored
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // File name with unique suffix and original extension
    }
  });
  
  // Initialize upload middleware
const upload = multer({ storage: storage });


router.post('/',upload.single('image'), annanceController.createAnnance);
router.post('/mail',upload.single('image'), annanceController.createAnnanceMail);

router.get('/', annanceController.getAllAnnances);
router.get('/:id', annanceController.getAnnanceById);
router.get('/user/:userId/role/:roleId', annanceController.getAnnancesByUserAndRole);
//router.get('/', annanceController.getAnnancesByUserOrRole);

router.put('/:id', annanceController.updateAnnanceById);
//[authJwt.verifyToken ,authJwt.isModerator]
router.delete('/:id',[authJwt.verifyToken ], annanceController.deleteAnnanceById);

module.exports = router;
