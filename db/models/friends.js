var Mongoose = require("mongoose");

var Friend = new Mongoose.Schema({
    Owner: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
    Friend: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
});

module.exports = Mongoose.model("Friend", Friend);
