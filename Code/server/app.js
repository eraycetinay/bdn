var express = require('express');
var mongoose = require('mongoose'); 
var path = require('path');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
//Require ends

mongoose.connect('mongodb://erayadmin:erayadmin@ds143754.mlab.com:43754/blooddonor', {
  useMongoClient: true
}); 
 
require('./blooddonor/socket.router.js')(io);

app.use('/assets',function(req,res,next){ 
	console.log(req.originalUrl);
	res.sendFile(path.join(__dirname, '/../client'+req.originalUrl));
});
app.use('/app',function(req,res,next){ 
	res.sendFile(path.join(__dirname, '/../client'+req.originalUrl));
});
app.use('*',express.static(path.join(__dirname, '/../client')));

http.listen(1111);
console.log('Magic happens at localhost:1111');