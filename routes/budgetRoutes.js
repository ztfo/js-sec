const express = require('express');
const { Budget } = require('../models/index');
const router = express.Router();

// get all budgets
router.get('/', async (req, res) => {
    const budgets = await Budget.findAll();
    res.json(budgets);
});

// get a specific budget by id
router.get('/:id', async (req, res) => {
    const budget = await Budget.findByPk(req.params.id);
    res.json(budget);
});

// create a new budget
router.post('/', async (req, res) => {
    const newBudget = await Budget.create(req.body);
    res.json(newBudget);
});

// update a budget
router.put('/:id', async (req, res) => {
    const updatedBudget = await Budget.update(req.body, {
        where: { id: req.params.id },
    });
    res.json(updatedBudget);
});

// delete a budget
router.delete('/:id', async (req, res) => {
    await Budget.destroy({
        where: { id: req.params.id },
    });
    res.json({ message: 'Budget deleted' });
});

module.exports = router;