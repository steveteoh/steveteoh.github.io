/*
* By Steve Teoh v 1.1 @ 2021/08/22
* For Research Purposes only. 
* Steve is an avid wargamer and crazy programmer that can code at amazing speed.
*/
var map = null;
var myfeature = {};
var mygeometry = {};
var pointCount = 0;
var locations = [];
var gridWidth = 500; // hex tile edge (a). 
var bounds = null;
var markers = [];
var places = [];
var lt1 = 0, ln1 = 0;
var lt2 = 0, ln2 = 0;
var pos = {};

//Administrative boundary file - geojson (sourced from: https://github.com/TindakMalaysia/Selangor-Maps)
var districtRequestURL = 'https://steveteoh.github.io/Hex2/hulu_langat.json';
var stateRequestURL = 'https://steveteoh.github.io/Hex2/selangor.json';

//This is the limit for map panning. Not implemented for the time being.
const MAP_BOUNDS = {
    north: 10.316892,
    south: -4.9452478,
    west: 95.2936829,
    east: 121.0019857,
};

// Places are automatically generated using just north, south, east and west boundary coordinates. 
// E.g. Hulu Langat, Selangor (not yet according to map shape. Future version will include precise kmz boundaries)
const PLACE_BOUNDS = {
    north: 3.275179,
    south: 2.866524,
    west: 101.721198,
    east: 101.970060,
    //Selangor   and      Malaysia (warning!! do not use!! super heavy computation)
    //north: 3.809677,   //3.05506, 
    //south: 2.595847,   //3.02394,
    //west: 100.812550,  //101.780511, 
    //east: 101.958404,  //101.807490, 
};
const delta_lat = 0.00389;
const delta_lon = 0.006745;

const grey = 'rgb(77, 77, 77)';     //for coloring unrelated borders
const green = 'rgb(0, 255, 0)';     //for less than 10 cases
const yellow = 'rgb(255, 255, 0)';  //for 11 - 50 cases
const orange = 'rgb(255, 82, 0)';   //for 50 - 99 cases
const red = 'rgb(255, 0, 0)';       //for > 100 active cases
const greenlevel = 10;
const yellowlevel = 50;
const orangelevel = 99;
//const redlevel = infinity;

//combine odd and even hex columns from top left to bottom right
for (let k = 0; -(2 * k) * delta_lat + PLACE_BOUNDS.north >= PLACE_BOUNDS.south; ++k) {
    lt1 = -(2 * k) * delta_lat + PLACE_BOUNDS.north;
    lt2 = -(2 * k + 1) * delta_lat + PLACE_BOUNDS.north;
    for (let l = 0; (2 * l) * delta_lon + PLACE_BOUNDS.west <= PLACE_BOUNDS.east; ++l) {
        ln1 = (2 * l) * delta_lon + PLACE_BOUNDS.west;
        ln2 = (2 * l + 1) * delta_lon + PLACE_BOUNDS.west;
        var label1 = "Hex:(" + (2 * l).toString() + "," + (k).toString() + ")";
        var label2 = "Hex:(" + (2 * l + 1).toString() + "," + (k).toString() + ")";
        places.push([lt1, ln1, label1, 'Noname', 0, 0, 0, 0, 0, 0, 1, '2021-08-15T12:11:01.587Z']);
        places.push([lt2, ln2, label2, 'Noname', 0, 0, 0, 0, 0, 0, 1, '2021-08-15T12:11:01.587Z']);
    }
}

var SQRT3 = 1.73205080756887729352744634150587236;   // sqrt(3)

$(window).load(function () {
    bounds = new google.maps.LatLngBounds();
    map = new google.maps.Map(document.getElementById("map_canvas"), {
        center: { lat: 0, lng: 0 },
        scaleControl: true,
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        //latLngBounds: MAP_BOUNDS,  //MAP bound to be implemented in future
    });

    var infoWindow = new google.maps.InfoWindow({ map: map });
    // Ver 3: Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                infoWindow.setPosition(pos);
                infoWindow.setContent("Your Location");
                infoWindow.open(map);
                map.setCenter(pos);
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }

    //Get the district administrative boundary through geojson file
    var layer1 = new google.maps.Data();
    layer1.loadGeoJson(districtRequestURL, { idPropertyName: 'name' },
        function (features) {
            myfeature = layer1.getFeatureById("Hulu Langat");
            //layer1.forEach
            layer1.forEach((feature) => {
                console.log("feature: " + feature);
                const geometry = feature.getGeometry();
                console.log("geometry:" + geometry);
                console.log("type:" + geometry.getType());

                if (isInside(layer1, geometry, pos))
                    console.log("inside coord =" + pos);
            });
        }
    );
    layer1.setStyle({
        fillColor: red,
        fillOpacity: 0.1,
        strokeWeight: 1
    });

    // Adding a marker just so we can visualize where the actual data points are.
    places.forEach(function (place, p) {
        latlng = new google.maps.LatLng({ lat: place[0], lng: place[1] });
        const marker = new google.maps.Marker({
            position: latlng,
            map: map,
            label: `${p + 1}`,
            title: place[3],
        });
        marker.setIcon("http://maps.google.com/mapfiles/ms/icons/blue.png");
        //Attaching related information onto the marker
        attachMessage(marker, place[2] + ' : ' + place[3] +
            '<br>Coordinates: (' + place[0] + ',' + place[1] + ')' +
            '<br>Weekly Active cases: ' + place[4] +
            ' | Total Active cases: ' + place[5] +
            '<br>Weekly Deaths: ' + place[6] +
            ' | Total Deaths: ' + place[7] +
            '<br>Weekly Recovered:' + place[8] +
            ' | Total Recovered:' + place[9] +
            '<br>Weight:' + place[10] +
            '<br>Timestamp: ' + place[11]
        );
        markers.push(marker);

        // Fitting to bounds so the map is zoomed to the right place
        bounds.extend(latlng);
    });
    map.fitBounds(bounds);

    // add event listeners for the buttons
    document.getElementById("show-markers").addEventListener("click", showMarkers);
    document.getElementById("hide-markers").addEventListener("click", hideMarkers);

    // Now, we draw our hexagons! 
    locations = makeBins(places);

    locations.forEach(function (place, p) {
        // horizontal hex are not so useful, changed to vertical hex.
        // drawHorizontalHexagon(map, place, gridWidth);
        drawVerticalHexagon(map, place, gridWidth);
    });

    //Get the State administrative boundary through geojson file
    map.data.loadGeoJson(stateRequestURL);
    map.data.setStyle({
        fillColor: grey,
        fillOpacity: 0.1,
        strokeWeight: 1
    });

    hideMarkers();  //initially hide all markers for faster display
});

/**
 * Ver 3
 * Handler for "Browser doesn't support Geolocation error"
 */
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}

/** 
* ver 3 
* function to determine whether a point is inside a geometry. Previously method is ray casting algorithm.
*/
function isInside(layer, geom, latlng) {
    var array = geom.getArray();
    array.forEach(function (item, i) {
        var paths = item.getAt(0).getArray();
        console.log(paths);
        var poly = new google.maps.Polygon({
            paths: paths
        });
        if (google.maps.geometry.poly.containsLocation(latlng, poly)) {
            console.log("poly found");
            return true;
        }
        else {
            console.log("searching poly...");
            geom.getArray().forEach((g) => {
                isInside(layer, g, latlng);
            });
        }
        return false;
    });
}

// Attaches an info window to a marker with the provided message. When the
// marker is clicked, the info window will open with the message.
function attachMessage(marker, Message) {
    const infowindow = new google.maps.InfoWindow({
        content: Message,
    });
    marker.addListener("click", () => {
        infowindow.open(marker.get("map_canvas"), marker);
    });
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    };
}

// Removes the markers from the map, but keeps them in the array.
function hideMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

function drawVerticalHexagon(map, position, radius) {
    var color = (position[1] > orangelevel) ? red : (position[1] > yellowlevel) ? orange : (position[1] > greenlevel) ? yellow : green;
    var coordinates = [];
    var resultColor = color;
    for (var angle = 30; angle < 360; angle += 60) {
        //resultColor = google.maps.geometry.poly.containsLocation(position[0], mygeometry)? color: grey;  
        //note: if outside, skip and do not draw           
        coordinates.push(google.maps.geometry.spherical.computeOffset(position[0], radius, angle));
    }
    // Construct the polygon.
    var polygon = new google.maps.Polygon({
        paths: coordinates,
        position: position,
        strokeColor: resultColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: resultColor,
        fillOpacity: 0.15,
        geodesic: true
    });
    polygon.setMap(map);
}

function drawHorizontalHexagon(map, position, radius) {
    var color = (position[1] > orangelevel) ? red : (position[1] > yellowlevel) ? orange : (position[1] > greenlevel) ? yellow : green;
    var coordinates = [];
    var resultColor = color;

    for (var angle = 0; angle < 360; angle += 60) {
        //resultColor = google.maps.geometry.poly.containsLocation(position[0], mygeometry)? grey: color;     
        coordinates.push(google.maps.geometry.spherical.computeOffset(position[0], radius, angle));
    };

    // Construct the polygon.
    var polygon = new google.maps.Polygon({
        paths: coordinates,
        position: position,
        strokeColor: resultColor,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: resultColor,
        fillOpacity: 0.15,
        geodesic: true
    });
    polygon.setMap(map);
}

//ver 2
function getFile(url, fillcolor) {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    //request.responseType = 'json';
    request.responseType = 'text'; // now we're getting strings!
    request.send();

    request.onload = function () {
        const result = request.response;
        //populate data 
        loadGeoJsonString(fillcolor, result);
    };
}

//ver 2
function loadGeoJsonString(fillcolor, geoString) {
    try {
        const geojson = JSON.parse(geoString);
        map.data.addGeoJson(geojson);
        map.data.setStyle({
            fillColor: fillcolor,
            fillOpacity: 0.1,
            strokeWeight: 1
        });
    } catch (e) {
        alert("Not a GeoJSON file!");
        return
    }
    zoom(map);
}

/**
 * ver 2
 * Update a map's viewport to fit each geometry in a dataset
 * process geojson features - e.g. sempadan daerah
 */
function zoom(map) {
    const bounds = new google.maps.LatLngBounds();
    console.log("bounds:" + bounds.toString());
    map.data.forEach((feature) => {
        const geometry = feature.getGeometry();
        //mygeometry = feature.getGeometry();
        if (geometry) {
            console.log("geometry detected");
            processPoints(geometry, bounds.extend, bounds); //extending the bounds
        }
    });
    map.fitBounds(bounds);
}

/*
 *  ver 2
 *  Process each point in a Geometry using recursive function call, regardless of how deep the points may lie. 
 */
function processPoints(geometry, callback, thisArg) {
    if (geometry instanceof google.maps.LatLng) {               //latlng only
        callback.call(thisArg, geometry);
    } else if (geometry instanceof google.maps.Data.Point) {    //data point only
        callback.call(thisArg, geometry.get());
    } else {
        geometry.getArray().forEach((g) => {                      //array 
            processPoints(g, callback, thisArg);
        });
    }
}

// Below is my attempt at porting binner.py to Javascript.
// Borrowed from: https://github.com/ondeweb/Hexagon-Grid-overlay-on-Google-Map
// Original Source: https://github.com/coryfoo/hexbins/blob/master/hexbin/binner.py

function distance(x1, y1, x2, y2) {
    //console.log(x1, y1, x2, y2);
    result = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    //console.log("Distance: ", result);
    return
}

function nearestCenterPoint(value, scale) {
    div = value / (scale / 2);
    //console.log("div", div);
    mod = value % (scale / 2);
    //console.log("mod", mod);

    if (div % 2 == 1) {
        increment = 1;
    } else {
        increment = 0;
    }

    rounded = scale / 2 * (div + increment);

    if (div % 2 === 0) {
        increment = 1;
    } else {
        increment = 0;
    }

    rounded_scaled = scale / 2 * (div + increment);

    result = [rounded, rounded_scaled]
    //console.log("nearest centerpoint to", value, result);
    return result;
}

function makeBins(data) {
    bins = [];

    data.forEach(function (place, p) {
        x = place[0];
        y = place[1];
        cases = place[4];
        //console.log("Original location:", x, y);

        px_nearest = nearestCenterPoint(x, gridWidth);
        py_nearest = nearestCenterPoint(y, gridWidth * SQRT3);     //short diagonal (d2) = SQRT3 * edge (a)
        //incircle radius (r) = SQRT3 * edge(a) / 2
        //height (h) = 2 * radius (r) = short diagonal (d2)
        z1 = distance(x, y, px_nearest[0], py_nearest[0]);
        z2 = distance(x, y, px_nearest[1], py_nearest[1]);

        if (z1 > z2) {
            bin = new google.maps.LatLng({ lat: px_nearest[0], lng: py_nearest[0] });
            //console.log("Final location:", px_nearest[0], py_nearest[0]);
        } else {
            bin = new google.maps.LatLng({ lat: px_nearest[1], lng: py_nearest[1] });
            //console.log("Final location:", px_nearest[1], py_nearest[1]);
        }
        //multidimensional array consisting of (lat,lon) and cases
        bins.push([bin, cases]);

    })
    return bins;
}