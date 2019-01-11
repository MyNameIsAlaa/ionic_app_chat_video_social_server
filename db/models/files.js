var Mongoose = require("mongoose");

var File = new Mongoose.Schema({
    Owner: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
    Post: {type: Mongoose.Schema.Types.ObjectId, ref:'Post'},
    fileName: {type:String},
    file_url: {type:String},
    uploadDate: {type: Date, default: Date.now},
});

module.exports = Mongoose.model("File", File);
