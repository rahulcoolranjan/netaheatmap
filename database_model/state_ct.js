const mongoose =require('mongoose');
var stateSchema = mongoose.Schema({
	id: {type: String},
	name:{type:String},
	cords:{type:String},
	state_id:{type:String}
})

var State= mongoose.model("State",stateSchema);
module.exports= State;