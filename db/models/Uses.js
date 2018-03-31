var Mongoose = require("mongoose");

var User = new Mongoose.Schema({
    username: {type: String, required: true, unique:true},
    email: {type: String, required:true, unique: true},
    password: {type: String, required:true},
    first_name: {type:String},
    last_name:{type:String},
    profile_pic_URL: {type:String},
    online: {type:Boolean},
    socket: {type:String},
});

module.exports = Mongoose.model("User", User);
