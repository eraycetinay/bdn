var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:1111';

var options = {
    transports: ['websocket'],
    'force new connection': true
};

var markerObj = [{
    "address": "2700 Garfield Ave, Los Angeles, California, 90040",
    "bloodGroup": "0-",
    "firstName": "John",
    "lastName": "Doe",
    "contactNumber": "(01)234-5678-910",
    "email": "john@doe.com",
    "coordinates": [-118.134687148873, 33.9891823151631]
}, {
    "address": "956 Heritage Dr, West Covina, California, 91791",
    "bloodGroup": "0-",
    "lastName": "Doe",
    "firstName": "John",
    "contactNumber": "(01)234-5678-910",
    "email": "john@doe.com",
    "coordinates": [-117.871650603009, 34.0544420961452]
}, {
    "address": "15505 Cornet St, Santa Fe Springs, California, 90670",
    "bloodGroup": "0-",
    "firstName": "John",
    "lastName": "Doe",
    "contactNumber": "(01)234-5678-910",
    "email": "john@doe.com",
    "coordinates": [-118.050097980993, 33.8898529864626]
}];


var coordinateObj = { coordinates: [-117.871650603009, 34.0544420961452] };

describe("\tBlood Donor General System Tests. \n\tIt checks all methods and events\n\tcreateMarker,readMarker,readMarkerKey,updateMarker,deleteMarker\n\tsyncMarker,message\n", function() {



    var secret = '';
    it('Should create a marker and get a secret key', function(done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function(data) {
            client.emit('createMarker', markerObj[1]);
        });

        client.on('message', function(data) {
            data.should.be.type('string');
            secret = (data.split('?key=')[1]).split('"')[0];
            client.disconnect();
            done();
            console.log('\t'+secret + ' is markers secret key');
        });
    });


    it('Should read markers near client', function(done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function(data) {
            client.emit('readMarker', coordinateObj);
        });

        client.on('readMarker', function(data) {
            data.should.be.type('object');
            client.disconnect();
            done();
            console.log('\t'+data[data.length-1].firstName + '\'s marker found');            
        });

    });


    var obj = {};
    it('Should get created marker via its secret key', function(done) {
        var client = io.connect(socketURL, options);

        client.on('connect', function(data) {
            client.emit('readMarkerKey', secret);
        });

        client.on('readMarkerKey', function(data) {
            data.should.be.type('object');
            obj = data;            
            client.disconnect();
            done();
            console.log('\t'+data.lastName + ' is his lastname');
        }); 
    });

    it('Should update the marker\'s name and sync/read for near client', function(done) {
        var client = io.connect(socketURL, options);

        
        client.on('connect', function(data) {
            obj.firstName = 'Johnny.';
            client.emit('updateMarker', obj);
        });

        client.on('connect', function(data) {
            client.emit('readMarker', coordinateObj);
        });

        client.on('readMarker', function(data) {
            data.should.be.type('object'); 
            client.disconnect();
            done();
            console.log('\tHis name is changed to '+data[data.length-1].firstName);
        });
    });

    it('Should delete the marker updated and sync/read for near client', function(done) {
        var client = io.connect(socketURL, options);

        
        client.on('connect', function(data) { 
            client.emit('deleteMarker', secret);
        });

        client.on('connect', function(data) {
            client.emit('readMarker', coordinateObj);
        });

        client.on('readMarker', function(data) {
            data.should.be.type('object'); 
            client.disconnect();
            done();
            console.log('\tHis marker deleted');
        });
    });
});