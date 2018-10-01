var express = require('express');
var router = express.Router();
const async= require('async');
const State = require('../database_model/state_ct');
const Country = require('../database_model/country_st');
const Cities = require('../database_model/cities_ct');
var url_get=require("../my_modules/mapcords");

var Pusher = require('pusher');
  
var pusher = new Pusher({
   appId: '609025',
	key: '24e9d0687e80f1b51c74',
	 secret: '552c492bc3024f95f5df',
	  cluster: 'ap2',
	   encrypted: true
});

var timer=0;

router.get("/city",(req,res)=>{
	console.log("Run 1 city");	
		get=req.query;
		process_url=get.url;
		var url_data=null;
		var state_temp=null;
		var cities_temp=null;
		async.waterfall([
			function(callback){
				url_get.url_fetch(process_url, {}, (req,res)=>{
					url_data=""+res;
					console.log("Getting Data");
					callback(null,"val1");
				});
			},
			function(data,callback){
				res_temp=JSON.parse(url_data);
				state_temp=res_temp.state;
				cities_temp=res_temp.cities;
				callback(null,"val2");
			},
			function(data,callback){
				//console.log(state_temp.length);
				console.log("plug State");
				new State(state_temp).save((suc)=>{
					if(suc){
						console.log("State Inserted");
					}else{
						console.log("Error, not added");
					}
					callback(null,"val2");
				});
			},
			function(data,callback){
				console.log(cities_temp.length);
				console.log("plug Cities");
				Cities.insertMany(cities_temp,(err)=>{
					if(err && err.code==11000){
						console.log("Data Exists");

					}
					callback(null,"val2");
				});
			},
			function(data,callback){
				console.log("Executed");
				res.send("Voila!");
			},
		],function(err,result){
				console.log(err);
		}
		);
		//timer=0;
});
var fetch=require("../my_modules/fetch");
router.get("/latcheck",(req,res)=>{
		lat=req.query.lat;
		lng=req.query.lng;
		process_url="http://neta-app.com/api/v1/constituencies/latlng?lat="+lat+"&lng="+lng+"";
		var url_data=null;
		var assembly_id=null;
		var json_Data=null;
		async.waterfall([
			function(callback){
				console.log("Zone 1");
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
				url_data=url_fetch(process_url,{},(req,res)=>{
					url_data=""+res;
					console.log("Getting Data");
					callback(null,"val1");
				});
				
			},
			function(data,callback){
				json_Data=JSON.parse(url_data);
				assembly_id=json_Data.data.selected.assembly_id;
				console.log("Zone 3");
				console.log(assembly_id);
				res.send(assembly_id);
			},
		],function(err,result){
				console.log(err);
		}
		);
});
router.get("/national",(req,res)=>{
		get=req.query;
		process_url=get.url;
		var url_data=null;
		async.waterfall([
			function(callback){
				url_get.url_fetch(process_url, {}, (req,res)=>{
					url_data=""+res;
					console.log("Getting Data");
					callback(null,"val1");
				});
			},
			function(data,callback){
				res_temp=JSON.parse(url_data);
				console.log(res_temp.length);
				console.log("plug country");
				Country.insertMany(res_temp);
				res.send(url_data);
			},
		],function(err,result){
				console.log(err);
		}
		);
});
router.get("/pusher",(req,res)=>{
	Get=req.query;
	/*state_parse={
		"state_id":"9782ecfe-2cd9-4f45-8f16-5c9a8e1b0344",
		"cities":{"id":"a174f79e-c365-458d-bdb4-2c7ccbed0207","rating":"3","cl":"green","avg_rating":"4","avg_cl":"yellow"}	
	};*/
//http://localhost:3000/map/pusher?lat=31.2522116&lng=75.7031153&rating=4&color=green&average_rating=2&average_color=yellow
	state_parse={
		"lat":""+Get.lat+"","lng":""+Get.lng+"","rating":""+Get.rating+"","cl":""+Get.color+"",
		"avg_rating":""+Get.average_rating+"","avg_cl":""+Get.average_color+""
		};
	console.log("Avn");
	pusher.trigger('punjab', 'my-event', { "area": state_parse});
	
	res.render("../views/pusherHandle",{});
});
function genRandomColor(){
	var hex = Math.floor( Math.random() * 0xFFFFFF );
	var res = document.getElementById('result');
	var result = hex.toString(16);
	return result;
}
router.post("/renderMap",(req,res)=>{
	
		state_parse=req.body.dataReq;
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
		assembly_id=null;
		mapCall="";
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
				console.log("Got Assembly Id: "+assembly_id);
				callback(null,"val1");
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
							if(state_id=="8eb01723-df81-43ff-95be-302f60229bda"){
								mapCall="mapBuild";
							}else{
								mapCall="mapBuild1";
							}
							//console.log("Entered "+j);
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
			res.render("../views/"+mapCall+"",{message:message});
		},
	],function(err,result){
			console.log(err);
	}
	);

});



module.exports = router;