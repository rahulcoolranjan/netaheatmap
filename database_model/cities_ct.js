const mongoose =require('mongoose');
var city_heatmapSchema = mongoose.Schema({
	id: {type: String,unique: true,index: true},
	name:{type:String},
	cords:{type:String},
	state_id:{type:String}
})

var city_heatmap= mongoose.model("city_heatmap",city_heatmapSchema);
module.exports= city_heatmap;