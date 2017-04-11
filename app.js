'use strict';

const request = require('request');
const express = require('express');
const busboy = require('connect-busboy');
const app = express();
const cloudinary = require('cloudinary');
const stream = require('stream');

app.use(busboy({immediate: true}));		// https://github.com/mscdex/connect-busboy

app.use(express.static('public'));

app.get('/img', function (req, res) {
	cloudinary.api.resources(function (result) {	// http://cloudinary.com/documentation/admin_api
		res.status(200).send(result.resources);
	});
});

app.post('/img', function (req, res) {
	if (req.query.url) {
		cloudinary.v2.uploader.upload(req.query.url, function (error, result) {	// http://cloudinary.com/documentation/node_integration
			if (error) {
				return res.sendStatus(400);
			}
			res.status(200).send(result);
		});
	} else {
		const stream = cloudinary.uploader.upload_stream(function(result) {	// http://cloudinary.com/documentation/node_image_upload
			if (result.error) {
				return res.status(500).send('Internal Server Error');
			}
			res.status(200).send(result);
		});
		req.busboy.on('file', function (fieldname, file) {		// https://github.com/mscdex/connect-busboy
			file.pipe(stream);
		});
	}
});

app.get('/img/:id', function (req, res) {
	cloudinary.api.resource(req.params.id, function (result) {	// http://cloudinary.com/documentation/admin_api
		if (result.error) {
			return res.sendStatus(404);
		}
		request(result.secure_url).pipe(res);	// http://stackoverflow.com/questions/26288055/how-to-send-a-file-from-remote-url-as-a-get-response-in-node-js-express-app
	});
});

app.delete('/img/:id', function (req, res) {
	cloudinary.api.delete_resources([req.params.id], function (result) {	// http://cloudinary.com/documentation/admin_api
		if (result.deleted[req.params.id] === 'not_found') {
			return res.sendStatus(404);
		}
		res.sendStatus(200);
	});
});

app.listen(3000, function () {
	console.log('Listening on port 3000!')
});