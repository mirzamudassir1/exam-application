const express = require('express'), router = express.Router(), Exam = require('../models/Exam');
const err = (e, s) => ({ message: e.message }), h = (fn) => (req, res) => fn(req, res).catch(e => res.status(500).json(err(e)));
router.get('/', h(async (req, res) => res.json(await Exam.find())));
router.get('/:id', h(async (req, res) => { const e = await Exam.findById(req.params.id); return res.json(e || res.status(404).json({ message: 'Not found' })); }));
router.post('/', h(async (req, res) => res.status(201).json(await new Exam(req.body).save())));
router.put('/:id', h(async (req, res) => res.json(await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
router.delete('/:id', h(async (req, res) => { await Exam.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }));
module.exports = router;