var Mongoose = require("mongoose");

var Comment = new Mongoose.Schema({
    Post: {type: Mongoose.Schema.Types.ObjectId, ref:'Post'},
    User: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
    Date: { type: Date, default: Date.now },
    Comment: {type: String}
});

module.exports = Mongoose.model("Comment", Comment);