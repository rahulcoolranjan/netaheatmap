const mongoose =require('mongoose');
var national_heatmapSchema = mongoose.Schema({
	id: {type: String,unique: true,index: true},
	name:{type:String},
	cords:{type:String}
})

var national_heatmap= mongoose.model("national_heatmap",national_heatmapSchema);
module.exports= national_heatmap;