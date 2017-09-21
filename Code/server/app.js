var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var rootAddress = path.resolve(__dirname);
//Require ends

mongoose.connect('mongodb://erayadmin:erayadmin@ds143754.mlab.com:43754/blooddonor', {
    useMongoClient: true
});

require('./blooddonor/socket.router.js')(io);
  
app.use(express.static(path.join(path.resolve(__dirname), '/../client')));


http.listen((process.env.PORT || 1111));
console.log('Magic happens at localhost:' + (process.env.PORT || 1111));