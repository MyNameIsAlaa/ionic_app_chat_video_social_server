var Mongoose = require("mongoose");

var Comment = new Mongoose.Schema({
    User: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
    Date: { type: Date, default: Date.now },
    Comment: {type: String}
});


var Post = new Mongoose.Schema({
    Owner: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
    body:{type:String},
    date: {type: Date},
    files:[{type: Mongoose.Schema.Types.ObjectId, ref:'File'}],
    comments: [Comment],
    likes: [{type: Mongoose.Schema.Types.ObjectId, ref:'User'}]
});

module.exports = Mongoose.model("Post", Post);
