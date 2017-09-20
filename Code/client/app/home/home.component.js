function homeController($scope, $state, $stateParams, $modal, socket, esriLoader) {
    $scope.view = 0; //map after load statement
    $scope.markers = []; //donation in range
    $scope.layer = 0; //pins graphic layer
    $scope.showDonor = {} //selected donor/marker 
    $scope.updateDonor = {} //selected donor/marker 
    $scope.mapOptions = { scale: 100000, center: [-118.13190796501, 33.9559771581243] } //map init
    $scope.bloodTypes = ['0-', '0+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
    $scope.loading = true; //loading text;

    //Popup modals init
    var newDonationModal = $modal({ scope: $scope, templateUrl: 'app/templates/modal.newDonation.html', show: false });
    var showDonationModal = $modal({ scope: $scope, templateUrl: 'app/templates/modal.showDonation.html', show: false });
    var updateDonationModal = $modal({ scope: $scope, templateUrl: 'app/templates/modal.updateDonation.html', show: false });

    //if client accepts to give location set it as a init map parameter
    /*if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(location) {
            $scope.mapOptions.center = [location.coords.longitude, location.coords.latitude];
        });
    }*/

    //esri map lazy loader starts here
    esriLoader.require([
        'esri/Map',
        'esri/geometry/support/webMercatorUtils',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/geometry/Point',
        'esri/Graphic',
        'esri/layers/GraphicsLayer',
        "esri/core/watchUtils",
        "esri/tasks/Locator"
    ], function(Map, webMercatorUtils, SimpleMarkerSymbol, Point, Graphic, GraphicsLayer, watchUtils, Locator) {

        //map init
        $scope.map = new Map({ basemap: 'streets' }); //map type
        $scope.locator = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"); //geolocation api

        //map loaded and ready
        $scope.onMapViewCreated = function(view) {
            $scope.view = view; //loaded map reference
            $scope.mapInit(); //run all related functions
            $scope.loading = false;
            $scope.disableZooming(view);
        };

        //map ready
        $scope.mapInit = function() {


            /* READ SOCKETS */
            //first read request with init coords
            socket.emit('readMarker', { coordinates: $scope.mapOptions.center });

            //get donations if requested by coords
            socket.on('readMarker', function(data) {
                if (data.length > 0) {
                    $scope.map.removeAll() //clear old markers etc.
                    $scope.layer = new GraphicsLayer; //set a new layer
                    $scope.map.add($scope.layer); //add it to map
                    $scope.markers = []; //set markers init
                    angular.forEach(data, function(item) { //loop donations
                        var geometryPoint = new Point(item.loc.coordinates[0], item.loc.coordinates[1]); //create point
                        var graphicPoint = new Graphic(geometryPoint, SimpleMarkerSymbol([255, 255, 255, 64], 10, "esriSMSCircle"))
                        $scope.layer.graphics.add(graphicPoint); //add point to layer
                        $scope.markers[graphicPoint.uid] = item; //add donation marker with its point id
                    });
                }
                $scope.loading = false;
            });

            //sync if there is a sync request from server for the client
            socket.on('syncMarker', function(data) {
                socket.emit('readMarker', { coordinates: [$scope.view.extent.center.longitude, $scope.view.extent.center.latitude] });
                $scope.loading = true;
            });

            //detect coordinate changes and set last coordinates
            watchUtils.whenTrue($scope.view, "stationary", function() {
                socket.emit('readMarker', { coordinates: [$scope.view.extent.center.longitude, $scope.view.extent.center.latitude] });
                $scope.loading = true;
            });


            /* UPDATE SOCKETS */
            //check the key for to show a update form to client
            if ($stateParams.key) {
                socket.emit('readMarkerKey', $stateParams.key);
                $scope.loading = true;
            }
            //show update form for the request
            socket.on('readMarkerKey', function(item) {
                if (item._id) {
                    //but add a marker for it first
                    var geometryPoint = new Point(item.loc.coordinates[0], item.loc.coordinates[1]); //create point
                    var graphicPoint = new Graphic(geometryPoint, SimpleMarkerSymbol([243, 73, 91, 1], 10, "esriSMSCircle"))
                    $scope.layer.graphics.add(graphicPoint); //add point to layer
                    $scope.markers[graphicPoint.uid] = item; //add donation with its point id
                    $scope.updateDonor = item;
                    updateDonationModal.show();
                }
                $scope.loading = false;
            });

            /* MESSAGE SOCKET */
            //show a message if server sends
            socket.on('message', function(data) {
                $modal({ content: data, templateUrl: 'app/templates/modal.message.html', show: true });
                $scope.loading = false;
            });

            /* OTHER METHODS */
            //detect click event and open newDonation or showDonation modal.
            $scope.view.on('click', function(event) {
                $scope.view.hitTest(event)
                    .then(function(response) {
                        if (response.results[0].graphic && response.results[0].graphic.uid) {
                            //check uid for to understand it is a donation marker, show showDonation modal
                            $scope.showDonor = $scope.markers[response.results[0].graphic.uid];
                            showDonationModal.show();
                        } else {
                            //its not in a marker area, show newDonation modal
                            $scope.newDonor = {
                                coordinates: webMercatorUtils.xyToLngLat(event.mapPoint.x, event.mapPoint.y)
                            }
                            //get its address from lat lng first
                            $scope.locator.locationToAddress(webMercatorUtils.webMercatorToGeographic(event.mapPoint), 100).then(function(asd) {
                                $scope.newDonor['address'] = asd.address;
                                $scope.newDonor.bloodGroup = $scope.bloodTypes[0];
                                newDonationModal.show();
                            }).otherwise(function() {
                                $modal({ content: 'We can not finding this address right now, please use a different address.', templateUrl: 'app/templates/modal.message.html', show: true });
                            });
                        }
                    });
            });
        }


        //send deleteDonation form
        $scope.deleteDonation = function() {
            socket.emit('deleteMarker', $scope.updateDonor._id);
            updateDonationModal.hide();
            $scope.loading = true;
        }

        //send newDonation form
        $scope.newDonation = function(form) {
            if (form.$valid) {
                socket.emit('createMarker', $scope.newDonor);
                newDonationModal.hide();
                $scope.loading = true;
            }
        }

        //send updateDonation form
        $scope.updateDonation = function(form) {
            if (form.$valid) {
                console.log($scope.updateDonor);
                socket.emit('updateMarker', $scope.updateDonor);
                updateDonationModal.hide();
                $scope.loading = true;
            }
        }

        /**** https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=view-disable-zoom *****/
        $scope.disableZooming = function(view) {
            view.popup.dockEnabled = true;
            function stopEvtPropagation(evt) { evt.stopPropagation(); }
            view.popup.actions = [];
            view.ui.components = ["attribution"];
            view.on("mouse-wheel", stopEvtPropagation);
            view.on("double-click", stopEvtPropagation);
            view.on("double-click", ["Control"], stopEvtPropagation); 
            view.on("drag", ["Shift"], stopEvtPropagation);
            view.on("drag", ["Shift", "Control"], stopEvtPropagation);
            view.on("key-down", function(evt) {
                var prohibitedKeys = ["+", "-", "Shift", "_", "="];
                var keyPressed = evt.key;
                if (prohibitedKeys.indexOf(keyPressed) !== -1) {}
            });
            return view;
        }

    });
}


//Connect the component to the module/app
angular.module('bdn').component('home', {
    templateUrl: 'app/home/home.template.html',
    controller: homeController
}).config(["$stateProvider", function($stateProvider) {
    $stateProvider.state('home', {
        url: '/?key',
        template: "<home></home>"
    })
}]);