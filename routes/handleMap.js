var express = require('express');
var router = express.Router();
const async= require('async');
var fetch=require("../my_modules/fetch");
const State = require('../database_model/state_ct');
const Country = require('../database_model/country_st');
const Cities = require('../database_model/cities_ct');
var url_get=require("../my_modules/mapcords");
var nurl_get=require("../my_modules/nationalcord");
var Pusher = require('pusher');
  
var pusher = new Pusher({
   appId: '609025',
	key: '24e9d0687e80f1b51c74',
	 secret: '552c492bc3024f95f5df',
	  cluster: 'ap2',
	   encrypted: true
});

var timer=0;
router.get("/pusher",(req,res)=>{
	timer=0;
	if(timer==0){
	Get=req.query;
	/*state_parse={
		"state_id":"9782ecfe-2cd9-4f45-8f16-5c9a8e1b0344",
		"cities":{"id":"a174f79e-c365-458d-bdb4-2c7ccbed0207","rating":"3","cl":"green","avg_rating":"4","avg_cl":"yellow"}	
	};*/
//http://localhost:3000/map/pusher?lat=31.2522116&lng=75.7031153&rating=4&color=green&average_rating=2&average_color=yellow
async.waterfall([
			
	function(callback){
		console.log("Zone 1a");
		var url_fetch=function(url, options, callback) {
			if (!callback && typeof options === 'function') {
				callback = options;
				options = undefined;
			}
			var urls=url;
			fetch.fetchUrl(urls, {},(error, meta, body) => {
				if (error) {
					return console.log('ERROR', error.message || error);
				}
				return callback(null,body);
			});					
		}
		process_url="http://neta-app.com/api/v1/constituencies/latlng?lat="+Get.lat+"&lng="+Get.lng+"";
		url_data=url_fetch(process_url,{},(req,res)=>{
			url_data=""+res;
			console.log("Getting Data");
			callback(null,"val1");
		});
		
	},
	function(data,callback){
		json_Data=JSON.parse(url_data);
		assembly_id=json_Data.data.selected.assembly_id;
		state_code = json_Data.data.code;
		console.log("Got Assembly Id: "+assembly_id);
		console.log("Got State Code: "+state_code);
		state_parse={
			"lat":""+Get.lat+"","lng":""+Get.lng+"","rating":""+Get.rating+"","cl":""+Get.color+"",
			"avg_rating":""+Get.average_rating+"","avg_cl":""+Get.average_color+""
			};
		console.log("Avn");
		pusher.trigger(state_code+"-"+Get.candidateId, 'my-event', { "area": state_parse});
	    timer++;	
		res.render("../views/pusherHandle",{ stateCode: state_code, assemblyId: assembly_id, candidateId: Get.candidateId });
	},
],function(err,result){
	console.log(err);
}
);
}
});
function genRandomColor(){
	var hex = Math.floor( Math.random() * 0xFFFFFF );
	var res = document.getElementById('result');
	var result = hex.toString(16);
	return result;
}
router.post("/renderMap",(req,res)=>{	
		state_parse=req.body.dataReq;
        assembly_id=req.body.assemblyId;
		state_parse=JSON.parse(state_parse)["area"];
		// console.log(state_parse);
		// console.log(state_parse.lat);
		lat=state_parse.lat;
		lng=state_parse.lng;
		rating=state_parse.rating;
		cl=state_parse.cl;
		avg_rating=state_parse.avg_rating;
		avg_cl=state_parse.avg_cl;
		state_all=[];
		city_all=[];
		cns=0;
		console.log("State Parse c" );
		async.waterfall([
			function(callback){
					cities=[];
					Cities.find({"id":assembly_id}).then((data_ct)=>{
						//console.log("Entered "+j);
						state_id=data_ct[0].state_id;
						//console.log("Entered On "+ct_cnt);
						//console.log(data_ct);
						console.log("Fetched Id city "+data_ct[0].id);
						city_coords=data_ct.cords;
						ps=state_parse.cities;
						cities.push({"city_id":data_ct[0].id,"city_cords":data_ct[0].cords,"rating":rating,"cl":cl,"avg_rating":avg_rating,"avg_cl":avg_cl})
						State.find({"id":state_id}).then((data)=>{
							state_cords=data[0].cords;
							state_cordinate=data[0].state_coordinate;
							state_cords=state_cords.replace(/&#34;/gi, '"');
							console.log("STATE");
							//console.log(state_cords);
							message={"state_cord":state_cords,"lat":lat,"lng":lng,"city_color":cl,"cords":state_cordinate,"cities":cities};
							callback(null,"val3");
						});
					});
		},
		function(data,callback){
			console.log("Runner");
			//console.log(message);
			res.render("../views/mapbuild",{message:message});
		},
	],function(err,result){
			console.log(err);
	}
	);

});







router.post("/nationalMap",(req,res)=>{
	
	state_parse=req.body.dataReq;
	console.log(req.body);
	
	state_parse=JSON.parse(state_parse)["area"];
	// console.log(state_parse);
	// console.log(state_parse.lat);
	lat=state_parse.lat;
	lng=state_parse.lng;
	rating=state_parse.rating;
	cl=state_parse.cl;
	avg_rating=state_parse.avg_rating;
	avg_cl=state_parse.avg_cl;
	state_all=[];
	city_all=[];
	process_url=null;
	national_cords=null;
	cns=0;
	console.log("State Parse c" );
	assembly_id=null;
	async.waterfall([
		
		function(callback){
			console.log("Zone 1a");
			var url_fetch=function(url, options, callback) {
				if (!callback && typeof options === 'function') {
					callback = options;
					options = undefined;
				}
				var urls=url;
				fetch.fetchUrl(urls, {},(error, meta, body) => {
					if (error) {
						return console.log('ERROR', error.message || error);
					}
					return callback(null,body);
				});					
			}
			process_url="http://neta-app.com/api/v1/constituencies/latlng?lat="+lat+"&lng="+lng+"";
			url_data=url_fetch(process_url,{},(req,res)=>{
				url_data=""+res;
				console.log("Getting Data");
				callback(null,"val1");
			});
			
		},
		function(data,callback){
			json_Data=JSON.parse(url_data);
			assembly_id=json_Data.data.selected.assembly_id;
			//console.log("Got Process Url: "+process_url);
			console.log("Got Assembly Id: "+assembly_id);
			callback(null,"val1");
		},
		function(data,callback){
			Country.find({"id":"none"}).then((data)=>{
				console.log("Country data");
				national_cords=data[0].cords;
				callback(null,"val3");
			});
		},
		function(data,callback){
				cities=[];
				Cities.find({"id":assembly_id}).then((data_ct)=>{
					//console.log("Entered "+j);
					state_id=data_ct[0].state_id;
					//console.log("Entered On "+ct_cnt);
					//console.log(data_ct);
					console.log("Fetched Id city "+data_ct[0].id);
					city_coords=data_ct.cords;
					ps=state_parse.cities;
					cities.push({"city_id":data_ct[0].id,"city_cords":data_ct[0].cords,"rating":rating,"cl":cl,"avg_rating":avg_rating,"avg_cl":avg_cl})
					State.find({"id":state_id}).then((data)=>{
						state_cords=data[0].cords;
						state_cordinate=data[0].state_coordinate;
						state_cords=state_cords.replace(/&#34;/gi, '"');
						console.log("STATE");
						//console.log(state_cords);
						message={"national_cord":national_cords,"state_cord":state_cords,"lat":lat,"lng":lng,"city_color":cl,"cords":state_cordinate,"cities":cities};
						callback(null,"val3");
					});
				});
	},
	function(data,callback){
		console.log("Runner");
		//console.log(message);
		res.render("../views/mapbuild1",{message:message});
	},
],function(err,result){
		console.log(err);
}
);

});



module.exports = router;