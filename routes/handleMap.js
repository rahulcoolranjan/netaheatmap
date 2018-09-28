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
		
	state_parse={
		"state_id":"9782ecfe-2cd9-4f45-8f16-5c9a8e1b0344",
		"cities":{"id":"e310976e-f4c9-4d2c-99c6-5e44f39d6c7e","rating":"3","cl":"green","avg_rating":"4","avg_cl":"yellow"}	
		};

	pusher.trigger('my-channel', 'my-event', { "message": state_parse});
	
	res.render("../views/pusherHandle",{});
});
router.post("/renderMap",(req,res)=>{
	
		state_parse=req.body.dataReq;
		state_parse=JSON.parse(state_parse)["message"];
		//console.log(state_parse);


		state_all=[];
		city_all=[];
		cns=0;
		console.log("State Parse " );
		
		async.waterfall([
			function(callback){
			State.find({"id":state_parse.state_id}).then((data)=>{
				state_coords=data[0].cords;
				//ps=state_parse.cities;
				state_id=state_parse.state_id;
				console.log("Searching for "+state_parse.state_id);
				console.log("Data over State Record --- ");
				//console.log(data);
				cities=[]
				ct_cnt=0;
				//state_city_length=state_parse.cities.length;
				//for(let j=0; j<state_parse[i].cities.length; j++){
					console.log("Cities :- "+state_parse.cities.id);
					Cities.find({"id":state_parse.cities.id}).then((data_ct)=>{
						//console.log("Entered "+j);
						ct_cnt++;
						console.log("Entered On "+ct_cnt);
						//console.log(data_ct);
						console.log("Fetched Id city "+data_ct[0].id);
						city_coords=data_ct.cords;
						ps=state_parse.cities;
						cities.push({"city_id":data_ct[0].id,"city_cords":data_ct[0].cords,"rating":ps.rating,"cl":ps.cl,"avg_rating":ps.avg_rating,"avg_cl":ps.avg_cl})
						console.log("----print---",cities);
						
						//if(ct_cnt>=state_city_length){
							message={"state_id":state_id,"cities":cities};
							console.log("Data --- ");
						//	console.log(message);
							//pusher.trigger('my-channel', 'my-event', { "message": message});
						//}
						callback(null,"val3");
					});
				//}

			});
		},
		function(data,callback){
			console.log("Runner");
			console.log(message);
			res.render("../views/mapbuild",{message:message});
		},
	],function(err,result){
			console.log(err);
	}
	);

});



module.exports = router;