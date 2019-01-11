var Mongoose = require("mongoose");

var User = new Mongoose.Schema({
    username: {type: String, required: true, unique:true},
    email: {type: String, required:true, unique: true},
    password: {type: String, required:true},
    first_name: {type:String},
    last_name:{type:String},
    description:{type:String},
    gender:{type:String},
    phone:{type:String},
    profile_pic: {type: Mongoose.Schema.Types.ObjectId, ref:'File'},
    cover_pic: {type: Mongoose.Schema.Types.ObjectId, ref:'File'},
    dateOfBirth: {type:Date},
    country: {type:String},
    ip: {type:String},
    online: {type:Boolean},
    socket: {type:String},
    loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
        }
});

module.exports = Mongoose.model("User", User);
