var express = require('express');
var router = express.Router();
const async = require('async');
const fetch1 = require('node-fetch');
var fetch = require("../my_modules/fetch");
// var cache = require("./cache");

var geoJsonPoints = require("./geoJsonPoints");
var geoJsonNational = require("./geoJsonNational");
var geoJsonStates = require("./geoJsonStates");
var geoJsonCities = require("./geoJsonCities");

router.get("/state", (req, res) => {

	console.log("Inside State route");
	var lat = req.query.lat;
	var lng = req.query.lng;
	var candidateId = req.query.candidature_id;

	var message = [];
	var city_ids = [];
	var state_id, zoom;

	async.waterfall([

		function (callback) {
			// console.log("Zone 1a");
			var url_fetch = function (url, options, callback) {
				if (!callback && typeof options === 'function') {
					callback = options;
					options = undefined;
				}
				var urls = url;
				fetch.fetchUrl(urls, {}, (error, meta, body) => {
					if (error) {
						return console.log('ERROR', error.message || error);
					}
					return callback(null, body);
				});
			}
			process_url = "http://neta-app.com/api/v1/constituencies/latlng?lat=" + lat + "&lng=" + lng + "";
			// console.log("Zone 1b");
			url_data = url_fetch(process_url, {}, (req, res) => {
				// console.log("Zone 1c");
				url_data = "" + res;
				// console.log("Getting Data");
				callback(null, "val1");
			});

		},
		function (data, callback) {
			// console.log("Zone 2a");
			let json_Data = JSON.parse(url_data);
			state_id = json_Data.data.id;
			let cities = json_Data.data.parliament;
			for (let i = 0; i < cities.length; i++) {
				for (let j = 0; j < cities[i].assembly.length; j++) {
					city_ids.push(cities[i].assembly[j].id);
				}

				if (i == cities.length - 1) {
					// console.log("Iterator", i);
					callback(null, city_ids);
				}
			}
		},
		function (data, callback) {
			// console.log("Zone 2a");
			const body = {
				ratee_id: candidateId,
				region_ids: data
			};

			fetch1('https://api.neta-app.com/v2/ratees/regional_stats', {
				method: 'post',
				body: JSON.stringify(body),
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
			})
				.then(res => res.json())
				.then(json => {
					console.log(json);
					callback(null, json);
				});
		},
		function (json, callback) {
			// console.log('In Generate Message');
			let data = json.data;
			let cities_data = geoJsonCities.geoJsonCities[state_id];
			// console.log("Cities Data:- ", cities_data);
			// console.log("Cities Data Zoom :-",cities_data[0].properties.zoom);
			// console.log("GeoJson Data Zoom :-",geoJsonCities.geoJsonCities[state_id][0].properties.zoom);
			if (cities_data[0].properties.zoom) {
				zoom = cities_data[0].properties.zoom
				// console.log("In Zoom");
			}
			else {
				zoom = 6.2;
			}

			if (cities_data[0].properties.lat && cities_data[0].properties.lng) {
				lat = cities_data[0].properties.lat;
				lng = cities_data[0].properties.lng;
			}

			// cities_data.shift();
			// console.log("After Shift");
			for (let i = 0; i < city_ids.length; i++) {
				// console.log("City id:- ", city_ids[i]);
				let str = data[city_ids[i]];
				let res = str.split(",");
				let avg_rating = Math.round(res[1]);
				let hex_code, geoJson;
				if (avg_rating == 1) {
					hex_code = "#ff3125";
				}
				else if (avg_rating == 2) {
					hex_code = "#ffa425";
				}
				else if (avg_rating == 3) {
					hex_code = "#dfce3b";
				}
				else if (avg_rating == 4) {
					hex_code = "#8cad30";
				}
				else if (avg_rating == 5) {
					hex_code = "#30ad63";
				}

				for (let j = 1; j < cities_data.length; j++) {
					if (cities_data[j].id == city_ids[i]) {
						geoJson = cities_data[j];
						// console.log("GEOJSON", geoJson);
						break;
					}
				}

				message.push({
					regionId: city_ids[i],
					name: geoJson ? geoJson.properties.name : "",
					data: JSON.stringify(geoJson),
					color: hex_code
				});

				if (i == city_ids.length - 1) {
					callback(null, message);
				}
			}
		},
		function (data, callback) {
			console.log("CallBack Cycle Completed");
			res.render("../views/state", {
				message: message,
				lat: lat,
				lng: lng,
				stateCords: JSON.stringify(geoJsonCities.geoJsonCities[state_id]),
				zoom: zoom
			});
		},
	], function (err, result) {
		console.log(err);
	});

});

router.get("/national", (req, res) => {

	message = [];
	state_ids = [];
	city_ids_all = [];
	state_city_data = {};
	candidateId = req.query.candidature_id;
	console.log("Candidate Id is:- ", candidateId);
	async.waterfall([

		function (callback) {
			// console.log("Zone 1a");
			var url_fetch = function (url, options, callback) {
				if (!callback && typeof options === 'function') {
					callback = options;
					options = undefined;
				}
				var urls = url;
				fetch.fetchUrl(urls, {}, (error, meta, body) => {
					if (error) {
						return console.log('ERROR', error.message || error);
					}
					return callback(null, body);
				});
			}
			process_url = "https://api.neta-app.com/v2/country_states/all";
			url_data = url_fetch(process_url, {}, (req, res) => {
				url_data = "" + res;
				// console.log("Getting Data 1");
				callback(null, "val1");
			});

		},
		function (data, callback) {
			json_Data = JSON.parse(url_data);
			results = json_Data.data.results;
			for (let i = 0; i < results.length; i++) {
				state_ids[i] = results[i].id;
				if (i == results.length - 1) {
					callback(null, state_ids);
				}
			}
		},
		function (data, callback) {
			console.log("Zone 2a");
			// for (let i = 0; i < data.length; i++) {
			// 	state_data = geoJsonCities.geoJsonCities[data[i]];
			// 	let city_ids = [];
			// 	if (state_data) {
			// 		for (let j = 1; j < state_data.length; j++) {
			// 			city_ids.push(state_data[j].id);
			// 			city_ids_all.push(state_data[j].id);
			// 		}
			// 		state_city_data[data[i]] = city_ids;
			// 	}
			// }
			// console.log("State Cities IDs :- ", state_city_data);
			const body = {
				ratee_id: candidateId,
				// region_ids: city_ids_all
				region_ids: data
			};

			fetch1('https://api.neta-app.com/v2/ratees/regional_stats', {
				method: 'post',
				body: JSON.stringify(body),
				headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
			})
				.then(res => res.json())
				.then(json => {
					// console.log(json);
					// console.log("Cities Array Length", city_ids_all.length);
					callback(null, json);
				})
				.catch(err => {
					console.log("Error is ", err);
				});
		},
		function (json, callback) {
			// console.log('In Generate Message');
			data = json.data;
			// for (let i = 0; i < city_ids_all.length; i++) {
			// 	let str = data[city_ids_all[i]];
			// 	if (!str) {
			// 		str = '0,0'
			// 	}
			// 	if (str) {
			// 		let res = str.split(",");
			// 		let avg_rating = Math.round(res[1]);
			// 		let hex_code, geoJson, name, p, req_state;
			// 		if (avg_rating == 0) {
			// 			hex_code = "#D3D3D3";
			// 		}
			// 		else if (avg_rating == 1) {
			// 			hex_code = "#ff3125";
			// 		}
			// 		else if (avg_rating == 2) {
			// 			hex_code = "#ffa425";
			// 		}
			// 		else if (avg_rating == 3) {
			// 			hex_code = "#dfce3b";
			// 		}
			// 		else if (avg_rating == 4) {
			// 			hex_code = "#8cad30";
			// 		}
			// 		else if (avg_rating == 5) {
			// 			hex_code = "#30ad63";
			// 		}
			// 		for (let j = 0; j < state_ids.length; j++) {
			// 			let city_ids = state_city_data[state_ids[j]];
			// 			if (city_ids) {
			// 				for (let k = 0; k < city_ids.length; k++) {
			// 					if (city_ids_all[i] == city_ids[k]) {
			// 						req_state = state_ids[j];
			// 						break;
			// 					}
			// 				}
			// 				if (req_state) break;
			// 			}
			// 		}

			// 		let citiesGeoJson = geoJsonCities.geoJsonCities[req_state];
			// 		for (let j = 0; j < citiesGeoJson.length; j++) {
			// 			if (city_ids_all[i] == citiesGeoJson[j].id) {
			// 				geoJson = citiesGeoJson[j];
			// 				break;
			// 			}
			// 		}

			// 		if (geoJson) {
			// 			name = geoJson.properties.name;
			// 		}

			// 		message.push({
			// 			regionId: city_ids_all[i],
			// 			name: name,
			// 			data: JSON.stringify(geoJson),
			// 			color: hex_code,
			// 			// pointData: p
			// 		});
			// 		if (i == 3896) {
			// 			callback(null, message);
			// 		}
			// 	}
			// }

			for (let i = 0; i < state_ids.length; i++) {
				// console.log("State id:- ", state_ids[i]);
				let str = data[state_ids[i]];
				let res = str.split(",");
				let avg_rating = Math.round(res[1]);
				let hex_code, geoJson, name, p;
				if (avg_rating == 1) {
					hex_code = "#ff3125";
				}
				else if (avg_rating == 2) {
					hex_code = "#ffa425";
				}
				else if (avg_rating == 3) {
					hex_code = "#dfce3b";
				}
				else if (avg_rating == 4) {
					hex_code = "#8cad30";
				}
				else if (avg_rating == 5) {
					hex_code = "#30ad63";
				}

				geoJson = geoJsonStates.geoJsonStates[state_ids[i]];
				if (geoJson) {
					// console.log("GEOJSON", geoJson);
					name = geoJson.features[0].properties.name;
					p = geoJsonPoints.geoJsonPoints[state_ids[i]];
					// console.log("Points", p);
					if (p)
						p = [p[1], p[0]];
				}
				message.push({
					regionId: state_ids[i],
					name: name,
					data: JSON.stringify(geoJson),
					color: hex_code,
					pointData: p
				});

				if (i == state_ids.length - 1) {
					callback(null, message);
				}
			}
		},
		function (data, callback) {
			// console.log('Message:-',message);
			console.log("Callback Cycle Completed");
			callback(null, 'done');
		}
	], function (err, result) {
		res.render("../views/national", {
			message: message,
			nationalCords: JSON.stringify(geoJsonNational.geoJsonNational)
		});
	});
});

// router.get("/rest", cache.cache(20), (req, res) => {
// 	setTimeout(() => {
// 		res.render('../views/index', { title: 'Hey', message: 'Hello there', date: new Date() })
// 	}, 5000) //setTimeout was used to simulate a slow processing request
// });


module.exports = router;