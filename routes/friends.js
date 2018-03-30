var Router = require("express").Router();
var User = require("../db/models/Uses");
var Friend = require("../db/models/friends");

var Mongoose = require("mongoose");
var config = require("../config/config");
var passport = require("passport");
var JWT = require("jsonwebtoken");

Mongoose.connect(config.mlab.URL,(error)=>{
  if(error) console.log(error);
});


Router.get('/', passport.authenticate('jwt', {session: false}), (req,res)=>{
  res.send(req.user);
 });


 
module.exports = Router;