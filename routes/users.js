var Router = require("express").Router();
var User = require("../db/models/Uses");
var Friend = require("../db/models/friends");
var Post = require("../db/models/posts");
var Friend = require("../db/models/friends");
var FileDB = require("../db/models/files");
var path = require('path');
var async = require('async');
var passport = require("passport");
var JWT = require("jsonwebtoken");



Router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  User.find({}, (err, users) => {
    res.status(200).json(users);
  })
});


Router.get('/:userID', passport.authenticate('jwt', { session: false }), (req, res) => {

  if (!req.params.userID) return res.status(500).json({ "message": "USER ID IS REQUIRED!" });

  if (!Mongoose.Types.ObjectId.isValid(req.params.userID)) return res.status(500).json({ "message": "USER ID NOT VALID!" });

  var id = Mongoose.Types.ObjectId(req.params.userID);

  async.series([
    function (callback) {
      User.findOne({ _id: id }).select("-password").exec((error, user) => {
        if (error) return res.status(500).json({ "message": error });
        if (!user) return res.status(500).json({ "message": "USER NOT FOUND!" });
        callback(null, user);
      })
    },
    function (callback) {
      Friend.aggregate([{
        $match: {
          Owner: Mongoose.Types.ObjectId(id)
        }
      }, {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }], function (err, friends) {
        if (err) return res.status(500).json({ "message": err });
        callback(null, { "Friends": friends });
      });
    },
    function (callback) {
      Post.aggregate([{
        $match: {
          Owner: Mongoose.Types.ObjectId(id)
        }
      }, {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }], function (err, posts) {
        if (err) return res.status(500).json({ "message": err });
        callback(null, { "Posts": posts });
      });

    }
  ],
    function (err, result) {
      res.status(200).json(result);
    });


});

Router.post('/search', passport.authenticate('jwt', { session: false }), (req, res) => {
  if (!req.body.username) res.status(500).json({ "message": "USER ID IS REQUIRED!" });

  let username = String(req.body.username).trim().toLowerCase();
  User.findOne({ username: username }).select("-password").exec((error, user) => {
    if (error) return res.status(500).json({ "message": error });
    if (!user) return res.status(500).json({ "message": "USER NOT FOUND!" });
    res.status(200).json({ "user": user });
  });
});


Router.get('/picture/:id', (req, res) => {
  if (!req.params.id) res.status(500).json({ "message": "USER ID IS REQUIRED!" });
  var id = Mongoose.Types.ObjectId(req.params.id);

  User.findOne({ _id: id }).select("profile_pic").populate("profile_pic").exec((error, result) => {
    if (error) return res.status(500).json({ "message": error });
    if (!result) return res.status(500).json({ "message": "USER NOT FOUND!" });
    if (result.profile_pic === null || result.profile_pic === undefined) return res.status(500).json({ "message": "PICTURE NOT FOUND!" });
    res.status(200).sendFile(path.resolve('./uploads/' + result.profile_pic.fileName), {}, (eror) => {
      if (eror) return res.status(500).json({ "message": "PICTURE NOT FOUND!" });
    });
  });
});


Router.post('/location', passport.authenticate('jwt', { session: false }), (req, res) => {

  coords = [Number];
  coords[0] = req.body.longitude;
  coords[1] = req.body.latitude;


  var id = Mongoose.Types.ObjectId(req.user._id);
  User.findOneAndUpdate({ _id: id }, { loc: coords }, (error, result) => {
    if (error) return res.status(500).json({ "message": error });
    if (!result) return res.status(500).json({ "message": "NOT RESULTS!" });
    res.status(200).json(result);
  });


});


Router.post('/update', passport.authenticate('jwt', { session: false }), (req, res) => {
  userID = req.user._id;
  NewData = req.body;
  User.findOneAndUpdate({ _id: userID }, NewData, (error, result) => {
    if (error) return res.status(500).json({ "message": error });
    if (!result) return res.status(500).json({ "message": "USER NOT FOUND!" });
    res.status(200).json("saved!");
  });
});

Router.post('/explorer', passport.authenticate('jwt', { session: false }), (req, res) => {

  limit = Number(req.body.limit) || Number(15);  // 15 users per page
  page = Number(req.body.page) || Number(0);

  maxDistance = req.body.maxDistance || 10;  // 10 kilo
  maxDistance /= 6371;

  coords = [Number];
  coords[0] = req.body.longitude || 0;
  coords[1] = req.body.latitude || 0;

  User.find({
    loc: {
      $near: coords,
      $maxDistance: maxDistance
    }
  }).limit(limit).skip(page).
    populate('profile_pic').select({ password: 0 }).exec((error, users) => {
      if (error) return res.status(500).json({ "message": error });
      if (!users) return res.status(500).json({ "message": "NOT RESULTS!" });;
      data = []
      var Promises = users.map((user, i) => {
        return new Promise((resolve, reject) => {
          FileDB.find({ Owner: Mongoose.Types.ObjectId(user._id), Post: { $exists: true } }).select("fileName _id").limit(5).exec((eee, files) => {
            data.push({
              user: user,
              files: files
            });
            resolve();
          });
        })
      });
      Promise.all(Promises).then(() => {
        res.status(200).send(data);
      })
    });

});

Router.post('/signup', (req, res) => {

  newData = req.body;

  if (req.body.username) {
    newData.username = String(req.body.username).trim().toLowerCase();
  } else {
    return res.status(500).json({ "message": "USERNAME IS REQUIRED!" });
  }
  if (req.body.email) {
    newData.email = String(req.body.email).trim();
  } else {
    return res.status(500).json({ "message": "EMAIL IS REQUIRED!" });
  }
  if (req.body.password) {
    newData.password = req.body.password;
  } else {
    return res.status(500).json({ "message": "PASSWORD IS REQUIRED!" });
  }

  User.findOne({
    username: req.body.username,
  }).exec((err, user) => {
    if (user) return res.status(500).json({ "message": "USERNAME IS TAKEN!" });
    var newUser = new User(newData);
    newUser.save((error, user) => {
      if (error) return res.status(500).json({ "message": "Unable to signuo now." });
      if (!user) return res.status(500).json({ "message": "Unable to signuo now." });
      res.status(200).json(user);
    });
  })




});



Router.post('/login', (req, res) => {

  PostData = {};

  if (!req.body.username) {
    res.status(500).json({ "message": "USERNAME IS REQUIRED" })
  }
  if (!req.body.password) {
    res.status(500).json({ "message": "PASSWORD IS REQUIRED" });
  }
  User.findOne({
    username: String(req.body.username).trim().toLowerCase(),
    password: String(req.body.password).trim()
  }).select("-password").exec((error, user) => {
    if (error) return res.status(500).json({ "message": "Unable to login" });
    if (!user) return res.status(500).json({ "message": "WRONG USERNAME & PASSWORD!" });
    res.status(200).json({
      "token": JWT.sign({ _id: user._id }, "NineVisions"),
      "user": user
    });
  });

});


module.exports = Router;