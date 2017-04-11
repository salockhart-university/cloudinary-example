'use strict';

function getFileList(callback) {
	$.get('/img', function (data) {
		callback(data);
	});
}

function deleteFile(public_id, callback) {
	$.ajax({
		url: '/img/' + public_id,
		type: 'DELETE',
		success: function (data) {
			callback(data);
		}
	})
}

function downloadFile(public_id) {
	const url = '/img/' + public_id;
	window.open(url, '_blank');
}

function uploadRemoteFile(url, callback) {
	$.post('/img?url=' + url, function (data) {
		callback(data);
	})
}

function uploadLocalFile(form, callback) {
	const data = new FormData();	// http://stackoverflow.com/questions/5392344/sending-multipart-formdata-with-jquery-ajax
	data.append('file', $('#upload-local-file')[0].files[0]);

	$.ajax({
		url: '/img',
		type: 'POST',
		data: data,
		cache: false,
		contentType: false,
		processData: false,
		success: callback
	});
}

function fileListToHTML(files, callback) {
	const html = files.map(function (file) {
		const li = $("<div>", {
			class: 'file-list-item'
		});

		const download = $("<input>", {
			type: 'button',
			value: 'Download'
		});
		download.click(function (data) {
			downloadFile(file.public_id);
		});

		const remove = $("<input>", {
			type: 'button',
			value: 'Delete'
		});
		remove.click(function (data) {
			deleteFile(file.public_id, function () {
				refresh();
			})
		});

		li.append($("<img>", {
			src: file.url
		}));
		li.append(download);
		li.append(remove);
		return li;
	});
	callback(html);
}

function refresh() {
	getFileList(function (files) {
		fileListToHTML(files, function (html) {
			$('#file-list').html(html);
		})
	});
}

$(document).ready(function () {
	refresh();

	$('#upload-remote-button').click(function () {
		const url = $('#upload-remote-url').val();
		if (url) {
			uploadRemoteFile(url, function () {
				refresh();
			})
		}
	});

	$('#upload-local-form').submit(function (event) {
		event.preventDefault();
		uploadLocalFile(this, function () {
			refresh();
		});
	});
});