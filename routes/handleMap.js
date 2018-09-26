var express = require('express');
var router = express.Router();
const async= require('async');
const State = require('../database_model/state_ct');
var url_get=require("../my_modules/mapcords");
var timer=0;
router.get("/cord",(req,res)=>{
	if(timer++==1){
		get=req.query;
		process_url=get.url;
		var url_data=null;
		console.log("Async Problem");
		async.waterfall([
			function(callback){
				url_get.url_fetch(process_url, {}, (req,res)=>{
					url_data=""+res;
					console.log("Getting");
					callback(null,"val1");
				});
			},
			function(data,callback){
				res_temp=JSON.parse(url_data);
				console.log(res_temp.length);
				console.log("plug");
				State.insertMany(res_temp);
				res.send(url_data);
			},
		],function(err,result){
				console.log(err);
		}
		);
		timer=0;
	}
});


module.exports = router;