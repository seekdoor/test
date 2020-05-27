"use strict";

const http = require('http');
const zlib = require('zlib');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');

const moment = require('moment');

let homepage = function (_req, res) {
	res.writeHead(200, { 'Content-Type': 'text/html' });

	res.end('hello');
}

let getData = async (req, res, postItems) => {

	let [file_datetime, name, level] = req.querypath.split('/');

	let filepath = 'X:/micaps_high_surface/';

	file_datetime = moment(file_datetime);
	if (file_datetime.isBefore('2013-01-01')) {
		filepath += `${file_datetime.format('YYYY/MM')}/`;
	} else if (file_datetime.isBefore('2016-01-01')) {
		filepath += `${file_datetime.format('YYYY/M')}月/`;
	} else if (file_datetime.isBefore('2017-01-01')) {
		if (file_datetime.month() < 4) filepath += `${file_datetime.format('YYYY/')}1-4月/`;
		else filepath += `${file_datetime.format('YYYY/M')}月/`;
	} else if (file_datetime.isBefore( moment().subtract(7, 'days') )) {
		filepath += `${file_datetime.format('YYYYMM')}/`;
	} else {
		filepath = `X:/micaps/`;
	}

	if (file_datetime.isBefore('2018-03-01')) {
		if (level === 'surface') {
			filepath += `surface/${name}/${file_datetime.format('YYMMDDHH')}.000`;
		} else if (['height', 'temper', 'plot'].indexOf(name) !== -1) {
			filepath += `high/${name}/${level}/${file_datetime.format('YYMMDDHH')}.000`;
		}
	} else {
		if (level === 'surface') {
			name = name.replace(/plot|p0/g, function (c) {
				let result = '';
				if(c === 'plot') result = 'PLOT_GLOBAL_1H';
				else if(c === 'p0') result = 'ANALYSIS/PRES';//SURFACE\ANALYSIS\PRES  diamond 14 not support now!!!
				return result;
			});

			filepath += `SURFACE/${name}/${file_datetime.format('YYYYMMDDHHmm')}00.000`;
		} else if (['height', 'temper', 'plot'].indexOf(name) !== -1) {
			name = name.replace(/plot|height|temper/g, function (c) {
				let result = '';
				if(c === 'plot') result = 'PLOT';
				else if(c === 'height') result = 'ANALYSIS/HGT';//UPPER_AIR\ANALYSIS\HGT diamond 14 not support now!!!
				else if(c === 'temper') result = 'ANALYSIS/TMP';//UPPER_AIR\ANALYSIS\HGT diamond 14 not support now!!!
				return result;
			});

			filepath += `UPPER_AIR/${name}/${level}/${file_datetime.format('YYYYMMDDHHmm')}00.000`;
		}
	}

	console.log(filepath)

	if (fs.existsSync(filepath)) {
		res.writeHead(200, {
			'Content-Encoding': 'gzip',
			'Content-Type': 'text/plain; charset=utf-8'
		});

		const raw = fs.createReadStream(filepath);

		raw.pipe(zlib.createGzip()).pipe(res);

	} else {
		res.writeHead(404, "Not Found", { 'Content-Type': 'text/plain' });

		res.write("This request URL " + filepath + " was not found on this server.");

		res.end();

	}

}

let startHttpServer = function () {
	http.createServer(async (req, res) => {
		const host = req.headers.host;
		const hostname = url.parse('http://' + host).hostname;

		let pathname = url.parse(req.url).pathname;
		pathname = decodeURIComponent(pathname);

		console.log({ host, hostname, pathname });

		var postData = '';
		var postItems = {};

		req.on('data', function (chunk) {
			postData += chunk;
		});

		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
		res.setHeader('Access-Control-Allow-Headers', '*');
		res.setHeader('Access-Control-Max-Age', '86400');

		if (pathname === '/') {
			homepage(req, res);
		} else if (pathname.slice(0, 5) === '/data') {

			req.querypath = pathname.slice(6);
			req.on('end', async () => {
				//postItems = querystring.parse(postData);
				//console.log(postItems);
				try {
					await getData(req, res, postItems);
				} catch (e) {
					console.log(e.message);
					res.end();
				}

			});

		} else {
			homepage(req, res);
		}

	}).listen(2020, () => {
		console.log('listen on port 2020...');
	});
}

//--------test begin---------------------
/*
startHttpServer();
*/
//---------test end----------------------

exports.start = function () {
	startHttpServer();
}