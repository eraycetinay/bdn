var socketController = require('./socket.controller.js');
var clients = {};

//socket methods
module.exports = function(io) {
    io.on('connection', function(socket) {        
        clients[socket.id] = socket;

        socket.on('createMarker', function(data) { socketController.createMarker(data, socket, clients) });
        socket.on('readMarker', function(data) { socketController.readMarker(data, socket, clients) });
        socket.on('readMarkerKey', function(data) { socketController.readMarkerKey(data, socket, clients) });
        socket.on('updateMarker', function(data) { socketController.updateMarker(data, socket, clients) });
        socket.on('deleteMarker', function(data) { socketController.deleteMarker(data, socket, clients) });
 		socket.on('disconnect', function() { socketController.disconnect(socket, clients) }); 
    });
}