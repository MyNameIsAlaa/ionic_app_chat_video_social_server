var Mongoose = require("mongoose");
var deepPopulate = require('mongoose-deep-populate')(Mongoose);

var Friend = new Mongoose.Schema({
    Owner: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
    Friend: {type: Mongoose.Schema.Types.ObjectId, ref:'User'},
});

Friend.plugin(deepPopulate, {
    populate: {
      'Friend': {
        select: '-password',
      },
      'Friend.profile_pic': {
        select: '-Owner',
      }
    }
  });
  
module.exports = Mongoose.model("Friend", Friend);
