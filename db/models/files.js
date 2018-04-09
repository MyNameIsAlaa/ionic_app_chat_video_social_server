var Mongoose = require("mongoose");

var File = new Mongoose.Schema({
    Owner: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
    fileName: {type:String, required: true},
});

module.exports = Mongoose.model("File", File);
