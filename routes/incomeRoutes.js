const express = require('express');
const {
    addIncome,
    getAllIncome,
    deleteIncome,
    updateIncome,
    downloadIncomeExcel
} = require('../controllers/incomeController.js');
const {protect} = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/add', protect, addIncome);
router.get('/get', protect, getAllIncome);
router.get('/downloadexcel', protect, downloadIncomeExcel);
router.put('/:id', protect, updateIncome);
router.delete('/:id', protect, deleteIncome);


module.exports = router;