var express = require('express');
var router = express.Router();

// GET beerlist
router.get('/beerlist', function(req, res) {
	var db = req.db;
	db.collection('beerlist').find().toArray(function(err, items) {
		res.json(items);
	});
});

// POST to add new beer
router.post('/addbeer', function(req, res) {
	var db = req.db;
	db.collection('beerlist').insert(req.body, function(err, result) {
		res.send(
			// if success, return empty string
			// else return error message from database
			(err === null) ? {msg: ''} : {msg: err}
		);
	});
});

// PUT to update beer
router.put('/updatebeer/:id', function(req, res) {
	var db = req.db;
	var beerToUpdate = req.params.id;
	var updatedInfo = {$set: req.body};
	db.collection('beerlist').updateById(beerToUpdate, updatedInfo, function(err, result) {
		res.send(
			// if success, return empty string
			// else return error message from database
			(result === 1) ? {msg: ''} : {msg: err});
	});
});

// DELETE to remove a beer
router.delete('/deletebeer/:id', function(req, res) {
	var db = req.db;
	var beerToDelete = req.params.id;
	db.collection('beerlist').removeById(beerToDelete, function(err, result) {
		res.send(
			// if success, return empty string
			// else return error message from database
			(result === 1) ? {msg: ''} : {msg: err});
	});
});

module.exports = router;
