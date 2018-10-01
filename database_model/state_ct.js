const mongoose =require('mongoose');
var state_heatmapSchema = mongoose.Schema({
	id: {type: String,unique: true,index: true},
	name:{type:String},
	cords:{type:String},
	state_coordinate:{type:String}
})

var state_heatmap= mongoose.model("state_heatmap",state_heatmapSchema);
module.exports= state_heatmap;