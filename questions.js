const express = require('express'), router = express.Router(), Q = require('../models/Question');
const h = fn => (req, res) => fn(req, res).catch(e => res.status(500).json({ message: e.message }));
router.get('/', h(async (req, res) => res.json(await Q.find())));
router.get('/exam/:examId', h(async (req, res) => res.json(await Q.find({ examId: req.params.examId }))));
router.post('/', h(async (req, res) => res.status(201).json(await new Q(req.body).save())));
router.put('/:id', h(async (req, res) => res.json(await Q.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
router.delete('/:id', h(async (req, res) => { await Q.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));
module.exports = router;