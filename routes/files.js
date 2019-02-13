var Router = require("express").Router();
var User = require("../db/models/Uses");
var FileDB = require("../db/models/files");
var path = require('path');
var fs = require('fs');
var util = require('util');
var formidable = require('formidable');
var Mongoose = require("mongoose");
var passport = require("passport");
var JWT = require("jsonwebtoken");

const Config = require('../config');

Router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  userID = req.user._id;
  FileDB.find({ Owner: Mongoose.Types.ObjectId(userID) }).select('fileName').exec((err, files) => {
    if (err) return res.status(500).json({ "message": "Error getting files!" });
    if (!files) return res.status(500).json({ "message": "No Files!" });
    return res.status(200).json(files);
  });
});


Router.get('/:file', (req, res) => {
  fs.exists(__dirname + '/../uploads/' + req.params.file, (exists) => {
    if (!exists) return res.status(500).json({ "message": "File Not Found!" });
    res.status(200).sendFile(path.resolve(__dirname + '/../uploads/' + req.params.file));
  });
});



Router.get('/ID/:id', (req, res) => {
  FileDB.findById(Mongoose.Types.ObjectId(this.params.id), (err, result) => {
    fs.exists(__dirname + '/../uploads/' + result.fileName, (exists) => {
      if (!exists) return res.status(500).json({ "message": "File Not Found!" });
      res.status(200).sendFile(path.resolve(__dirname + '/../uploads/' + result.fileName));
    });
  })
});


Router.post('/upload', passport.authenticate('jwt', { session: false }), (req, res) => {
  OwnderID = req.user._id;
  files = [],

    form = new formidable.IncomingForm();

  form.multiples = true;
  form.keepExtensions = true;

  fs.exists(__dirname + '/../uploads', (exists) => {
    if (!exists) fs.mkdir(__dirname + '/../uploads');

    form.uploadDir = path.join(__dirname + '/../uploads');

    form.on('file', function (field, file) {
      nfo = path.parse(file.path);
      files.push(nfo['base']); //
    });

    form.on('error', function (err) {
      return res.status(500).json({ "message": err });
    });

    form.on('end', function () {
      var Prepare = [];
      var promises = files.map((file) => {
        return new Promise((resolve, reject) => {
          let myFile = new FileDB({
            Owner: OwnderID,
            fileName: file,
            file_url: Config.http.domain + '/api/file/' + file
          }).save((err, file) => {
            if (err) return reject(err);
            Prepare.push({
              'id': file._id,
              'fileName': file.fileName,
              'file_url': Config.http.domain + '/api/file/' + file
            });
            resolve();
          })
        })
      });
      Promise.all(promises).then(() => {
        res.status(200).send(Prepare);
      })
    });

    form.parse(req);

  });



})



module.exports = Router;