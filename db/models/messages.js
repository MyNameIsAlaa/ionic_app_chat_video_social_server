var Mongoose = require("mongoose");

var Message = new Mongoose.Schema({
    from: {type: String, required: true },
    to: {type: String, required:true },
    username: {type: String },
    message: {type:String},
    Date: { type: Date, default: Date.now },
});

module.exports = Mongoose.model("Message", Message);
