model = require('./mongoose.model.js');
lodash = require('lodash');
var clientCoordinates = {};

//create a donation
function createMarker(data, socket, clients) {
    data.ip = socket.conn.transport.socket._socket.remoteAddress;
    data.loc = { "type": "Point", "coordinates": data.coordinates };
    model.create(data).then(function(doc) {
        socket.emit('message', 'Your donation added to the map. You can edit or delete using the link below:<br/><a target="_blank" href="http://localhost:1111/?key=' + doc._id + '">http://localhost:1111/?key=' + doc._id + '</a>');
        syncRead(doc.loc, clients);
    }).catch(function(err) {
        socket.emit('message', 'An error occured while creating donation.');
    });
}

//read a donation with coords
function readMarker(data, socket, clients) {
    clientCoordinates[socket.id] = data.coordinates;
    model.aggregate(
        [{
            "$geoNear": {
                "near": {
                    "type": "Point",
                    "coordinates": data.coordinates
                },
                "distanceField": "distance",
                "spherical": true,
                "maxDistance": 10000
            }
        }],
        function(err, results) {
            if (results && results.length > 0) {
                results = lodash.forEach(results),
                    function(item) {
                        //remove before send for security
                        item._id = 0;
                    }
            }
            socket.emit('readMarker', results);
        }
    )
}

//check donation key
function readMarkerKey(data, socket, clients) {
    model.findOne({ '_id': data }).then(function(doc) {
        if (doc && doc._id) {
            socket.emit('readMarkerKey', doc)
        } else {
            socket.emit('message', 'Nothing found.');
        }
    }).catch(function(err) {
        socket.emit('message', 'An error occured while finding donation.');
    });
}

//update a donation
function updateMarker(data, socket, clients) {
    model.findOneAndUpdate({ '_id': data._id }, data).then(function(doc) {
        socket.emit('message', 'Your donation informations successfully updated.');
        syncRead(doc.loc, clients);
    }).catch(function(err) {
        socket.emit('message', 'An error occured while updating donation.');
    });
}

//delete a donation
function deleteMarker(data, socket, clients) {
    model.findOneAndRemove({ '_id': data }).then(function(doc) {
        socket.emit('message', 'Your donation successfully removed.');
        syncRead(doc.loc, clients);
    }).catch(function(err) {
        socket.emit('message', 'An error occured while deleting donation.');
    });
}

//remove socket data if client disconnects
function disconnect(socket, clients) {
    if (clients[socket.id]) {
        delete clients[socket.id];
        if (clientCoordinates[socket.id]) {
            delete clientCoordinates[socket.id];
        }
    }
}

//sync clients in coordinate range
function syncRead(data, clients) {
    lodash.forEach(clientCoordinates, function(item, key) {
        var d = getDistanceFromLatLonInKm(data.coordinates[0], data.coordinates[1], item[0], item[1]);
        if (d < 50) {
            clients[key].emit('syncMarker', '');
        }
    });
}


/**** https://stackoverflow.com/a/27943/2826456 *****/
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

module.exports.createMarker = createMarker;
module.exports.readMarker = readMarker;
module.exports.readMarkerKey = readMarkerKey;
module.exports.updateMarker = updateMarker;
module.exports.deleteMarker = deleteMarker;
module.exports.disconnect = disconnect;