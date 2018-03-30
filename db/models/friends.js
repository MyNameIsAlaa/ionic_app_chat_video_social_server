var Mongoose = require("mongoose");

var Friend = new Mongoose.Schema({
    Owner: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
    FriendID: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
});

module.exports = Mongoose.model("Friend", Friend);
