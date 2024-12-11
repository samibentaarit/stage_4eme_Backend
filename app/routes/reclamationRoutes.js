const express = require('express');
const reclamationController = require('../controllers/reclamationController');
const router = express.Router();

router.post('/default', reclamationController.createReclamationDefault);
router.post('/', reclamationController.createReclamation);

router.get('/', reclamationController.getAllReclamations);
router.get('/:id', reclamationController.getReclamationById);
// Route to get annances for a specific user
router.get('/my/:userId', reclamationController.getReclamationsForUser);

router.put('/:id', reclamationController.updateReclamationById);

router.delete('/:id', reclamationController.deleteReclamationById);

module.exports = router;