/*
* By Steve Teoh v 4.2.5 @ 2021/09/02
* For Research Purposes only. Strictly non-commercial.
* Steve is an avid wargamer and crazy programmer that can code at amazing speed.
*/
var map = null;
var geocoder = null;
var myfeature = {};
var mygeometry = {};
var pointCount = 0;
var locations = [];
var gridWidth = 500*2; // radius ~= hex tile edge (a). 
var bounds = null;
var markers = [];
var places = [];
var lt1 = 0, ln1 = 0;
var lt2 = 0, ln2 = 0;
var pos = {};


//This is the limit for Malaysia map panning. Not implemented for the time being.
const MAP_BOUNDS = {
    north: 10.316892, south: -4.9452478, west: 95.2936829, east: 121.0019857,
};

//Administrative boundary file - geojson (sourced from: https://github.com/TindakMalaysia/Selangor-Maps)
var stateRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/selangor.json';

//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/subang_jaya.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/shah_alam.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/selayang.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/sabak_bernam.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/petaling_jaya.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/hulu_selangor.json';
var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/ampang_jaya.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/kuala_selangor.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/sepang.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/kuala_langat.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/klang.json';
//var districtRequestURL = 'https://steveteoh.github.io/Hex4.2.5.1/Selangor/daerah/hulu_langat.json';

//var mapID = "Subang Jaya";
//var mapID = "Shah Alam";
//var mapID = "Selayang";
//var mapID = "Sabak Bernam";     
//var mapID = "Petaling Jaya";
//var mapID = "Hulu Selangor";
var mapID = "Ampang Jaya";
//var mapID = "Kuala Selangor";
//var mapID = "Sepang";         //NOTE: - isinside does not work with holes (putrajaya) yet...revising. Alternative - visual method
//var mapID = "Kuala Langat";   
//var mapID = "Klang";          //MULTI - need to adjust the geojson boundary for pulau
//var mapID = "Hulu Langat";    //MULTI


// Places are automatically generated using just north, south, east and west boundary coordinates. 
// E.g. Hulu Langat, Selangor (not yet according to map shape. Future version will include precise kmz boundaries)
const PLACE_BOUNDS = {
    //name: "Subang Jaya",
    //north: 3.085027,
    //south: 2.976325,
    //west: 101.549597,
    //east: 101.730601,
    //name: "Shah Alam",
    //north: 3.223441,
    //south: 2.958439,
    //west: 101.441838,
    //east: 101.591569,
    //name: "Selayang",
    //north: 3.401885,
    //south: 3.199615,
    //west: 101.430351,
    //east: 101.836780,
    //name: "Sabak Bernam",
    //north: 3.8706898,
    //south: 3.485592,
    //west: 100.813934,
    //east: 101.349522,
    //name: "Petaling Jaya",
    //north: 3.208809,
    //south: 3.070647,
    //west: 101.550759,
    //east: 101.663325,
    //name: "Hulu Selangor",
    //north: 3.804692,	
    //south: 3.321608,
    //west: 101.319496,
    //east: 101.814739,
    name: "Ampang Jaya",
    north: 3.292435,
    south: 3.081443,
    west: 101.733063,
    east: 101.853560,
    //name: "Kuala Selangor",
    //north: 3.600000,  
    //south: 3.158670,
    //west: 101.10080,
    //east: 101.49380,
    //name: "Sepang",
    //north: 3.012039,
    //south: 2.594652,
    //west: 101.589953,
    //east: 101.78966,
    //name: "Kuala Langat",
    //north: 2.978663,
    //south: 2.643984,
    //west: 101.286413,
    //east: 101.681967,
    //name: "Klang",
    //north: 3.19289,
    //south: 2.88442,
    //west: 101.199003,
    //east: 101.524080,
    //name: "Hulu Langat",
    //north: 3.275179,  
    //south: 2.866524,  
    //west: 101.721198, 
    //east: 101.970060, 

    //Selangor and  Malaysia (warning!! Do not use!! Super heavy computations!!). 
    //Should offload the computation to web server instead of just using client-side javascript
    //or use a periodic, pregenerated dataset in geojson format.
    //name: "Selangor",
    //north: 3.8706898,	
    //south: 2.594652, 
    //west: 100.813934, 
    //east: 101.97006,
    //name: "Malaysia",
    //north: 
    //south: 
    //west: 
    //east: 

};
const delta_lat = 0.003890*2;
const delta_lon = 0.006745*2;

//const cols = (PLACE_BOUNDS.north - PLACE_BOUNDS.south) / delta_lat; // 105.05 -> 106
//const rows = (PLACE_BOUNDS.east - PLACE_BOUNDS.west) / delta_lon;    // 36.89  -> 37
const grey = 'rgb(77, 77, 77)';     //for coloring unrelated borders
const green = 'rgb(0, 255, 0)';     //for less than 10 cases
const yellow = 'rgb(255, 255, 0)';  //for 11 - 50 cases
const orange = 'rgb(255, 82, 0)';   //for 50 - 99 cases
const red = 'rgb(255, 0, 0)';       //for > 100 active cases
const greenlevel = 10;
const yellowlevel = 50;
const orangelevel = 99;
//const redlevel = infinity;

var SQRT3 = 1.73205080756887729352744634150587236;   // sqrt(3)

$(window).load(function () {
    bounds = new google.maps.LatLngBounds();
    map = new google.maps.Map(document.getElementById("map_canvas"), {
        center: { lat: 0, lng: 0 },
        scaleControl: true,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        //latLngBounds: MAP_BOUNDS,  //MAP bound to be implemented in future
    });
    geocoder = new google.maps.Geocoder();
    const infoWindow = new google.maps.InfoWindow({ map: map });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                const posmarker = new google.maps.Marker({
                    position: pos,
                    map,
                    title: "Your Location",
                });
                infoWindow.setPosition(pos);
                infoWindow.setContent("Your Location detected by the browser");
                infoWindow.close();
                posmarker.addListener("click", () => {
                    infoWindow.open({
                        anchor: posmarker,
                        shouldFocus: false,
                    });
                });
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
            myfeature = layer1.getFeatureById(mapID);
            layer1.forEach((feature) => {
                mygeometry = feature.getGeometry();
                //example - my location
                //isInside(mygeometry, pos) ?
                //    console.log("inside coord: " + pos.lat + "," + pos.lng) :
                //    console.log("outside coord: " + pos.lat + "," + pos.lng);
                //example of not found
                //pos = {  lat: -1,  lng: -30, };
                //isInside(mygeometry, pos) ?
                //    console.log("inside coord: " + pos.lat + "," + pos.lng) :
                //    console.log("outside coord: " + pos.lat + "," + pos.lng);
                ////future version will read the coordinate and related data from a json file (instead of two for loop), 
                ////and determine whether the hex should be added to the boundary or not.
                ////
                //search odd and even hex columns from top left to bottom right
                let counter = 0;
                for (let k = 0; -(2 * k) * delta_lat + PLACE_BOUNDS.north >= PLACE_BOUNDS.south; ++k) {
                    lt1 = -(2 * k) * delta_lat + PLACE_BOUNDS.north;
                    lt2 = -(2 * k + 1) * delta_lat + PLACE_BOUNDS.north;
                    for (let l = 0; (2 * l) * delta_lon + PLACE_BOUNDS.west <= PLACE_BOUNDS.east; ++l) {
                        ln1 = (2 * l) * delta_lon + PLACE_BOUNDS.west;
                        ln2 = (2 * l + 1) * delta_lon + PLACE_BOUNDS.west;
                        pos = { lat: lt1, lng: ln1 };

                        if (isInside(mygeometry, pos) == true) {
                            counter++;
                            var locationname = "n/a"; //geocodeLatLng(geocoder, map, pos); //warning. geolocation is a paid service
                            var label1 = "Daerah: " + mapID + "<br>No:" + counter + "<br>Hex coord:(" + (2 * l).toString() + ";" + (k).toString() + ")";
                            var weeklyactive = 0; //Math.floor(Math.random() * 101); // generates a random integer from 0 to 100:
                            var totalactive = 1; //Math.floor(Math.random() * 1001); // generates a random integer from 0 to 1000:
                            var weeklyrecovered = 0; //Math.floor(Math.random() * 101); // generates a random integer from 0 to 100:
                            var totalrecovered = 0; //Math.floor(Math.random() * 1001); // generates a random integer from 0 to 1000:
                            var weeklydeaths = 0; //Math.floor(Math.random() * 11); // generates a random integer from 0 to 10:
                            var totaldeaths = 0; //Math.floor(Math.random() * 101); // generates a random integer from 0 to 100:
                            places.push([lt1, ln1, label1, locationname, weeklyactive, totalactive, weeklyrecovered, totalrecovered, weeklydeaths, totaldeaths, totalactive / totalrecovered, '2021-09-05T12:11:01.587Z']);
                            // if not inside -> splice outside hex
                            //places.splice(38 * k + 2 * l + l, 1);  // a * k + 2l + 1
                        }
                        
                        pos = { lat: lt2, lng: ln2 };
                        if (isInside(mygeometry, pos) == true) {
                            counter++;
                            var locationname = "n/a"; //geocodeLatLng(geocoder, map, pos); //warning. geolocation is a paid service
                            var label2 = "Daerah: " + mapID + "<br>No:" + counter + "<br>Hex coord:(" + (2 * l + 1).toString() + ";" + (k).toString() + ")";
                            var weeklyactive = 0; //Math.floor(Math.random() * 101); // generates a random integer from 0 to 100:
                            var totalactive = 1; //Math.floor(Math.random() * 1001); // generates a random integer from 0 to 1000:
                            var weeklyrecovered = 0; //Math.floor(Math.random() * 101); // generates a random integer from 0 to 100:
                            var totalrecovered = 0; //Math.floor(Math.random() * 1001); // generates a random integer from 0 to 1000:
                            var weeklydeaths = 0; //Math.floor(Math.random() * 11); // generates a random integer from 0 to 10:
                            var totaldeaths = 0; //Math.floor(Math.random() * 101); // generates a random integer from 0 to 100:
                            places.push([lt2, ln2, label2, locationname, weeklyactive, totalactive, weeklyrecovered, totalrecovered, weeklydeaths, totaldeaths, totalactive / totalrecovered, '2021-09-05T12:11:01.587Z']);
                            // if not inside -> splice outside hex
                            //places.splice(38 * k + 2 * l + 2, 1);  // a * k + 2l + 2
                        }
                    }
                }
            });
            //export CSV file
            var header = "lat,lon,label,placename,weeklyactive,totalactive,weeklyrecovered,totalrecovered,weeklydeaths,totaldeaths,weight,timestamp";
            exportToCsvFile(header, places, mapID);

            // Adding a marker just so we can visualize where the actual data points are.
            places.forEach(function (place, p) {
                latlng = new google.maps.LatLng({ lat: place[0], lng: place[1] });
                const marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    label: `${p + 1}`,
                    title: place[3],
                });
                marker.setIcon("https://maps.google.com/mapfiles/ms/icons/blue.png");
                //Attaching related information onto the marker
                attachMessage(marker, place[2] + ' : place name: ' + place[3] +
                    '<br>Coordinates: (' + place[0] + ',' + place[1] + ')' +
                    '<br>Weekly Active cases: ' + place[4] +
                    '       | Total Active cases: ' + place[5] +
                    '<br>Weekly Deaths: ' + place[6] +
                    '       | Total Deaths: ' + place[7] +
                    '<br>Weekly Recovered:' + place[8] +
                    '       | Total Recovered:' + place[9] +
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
            hideMarkers();  //initially hide all markers for faster display

            // Now, we draw our hexagons! 
            locations = makeBins(places);
            locations.forEach(function (place, p) {
                // horizontal hex are not so useful, changed to vertical hex.
                // drawHorizontalHexagon(map, place, gridWidth);
                drawVerticalHexagon(map, place, gridWidth);
            });
        }
    );
    layer1.setStyle({
        fillColor: red,
        fillOpacity: 0.1,
        strokeWeight: 1
    });

    //Get the State administrative boundary through geojson file
    map.data.loadGeoJson(stateRequestURL);
    map.data.setStyle({
        fillColor: grey,
        fillOpacity: 0.1,
        strokeWeight: 1
    });
});

function geocodeLatLng(geocoder, map, pos) {
    geocoder.geocode({ location: pos })
        .then((response) => {
            if (response.results[0]) {
                map.setZoom(11);
                return response.results[0].formatted_address;
            }
            else {
                return "place name n/a";
            }
        })
        .catch((e) => {
            console.log("Geocoder failed due to: " + e);
        });
}

/*
 * Export data to CSV using download dialog* 
 */
function exportToCsvFile(header, sourcedata, filename) {
    var info = "";
    for (var i in sourcedata) {
        info += sourcedata[i] + "\n";
    }
    var myCsv = "\n" + info;
    const data = header + myCsv;
    // Create a Blob object
    const blob = new Blob([data], { type: 'text/csv' });
    // Create an object URL
    const url = URL.createObjectURL(blob);
    // Download file
    download(url, filename+'.csv');
    // Release the object URL
    URL.revokeObjectURL(url);
}

//Helper Function for downloading CSV
const download = (path, filename) => {
    // Create a new link
    const anchor = document.createElement('a');
    anchor.href = path;
    anchor.download = filename;
    // Append to the DOM
    document.body.appendChild(anchor);
    // Trigger `click` event
    anchor.click();
    // Remove element from DOM
    document.body.removeChild(anchor);
};

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
* function to determine whether a point is inside a geometry. This is a quick alternative method to the previous "ray casting" algorithm.
*/
function isInside(geom, latlng) {
    var array = geom.getArray();
    var point = new google.maps.LatLng(latlng);     //centroid version does not cover the geographical boundary well.
                                                    //To extend the checking of latlng of centroid to 6 vertices:
                                                    //If any 3 of the vertices is inside, the coordinate is considered inside.    
    var found = false;
    //console.log("geom:" + geom); console.log("type:" + geom.getType()); console.log("array:" + geom.getArray());
    array.every(function (item, i) {
        var geoType = geom.getType();
        var list = undefined;
        if (geoType == "MultiPolygon") {
            list = item.getAt(0).getArray();
        }
        else if (geoType == "Polygon") {
            list = item.getArray();
        }
        else {
            //Irrelevant types: "Point", "MultiPoint", "LineString", "MultiLineString", "LinearRing","GeometryCollection".
            console.log("irrelevant type " + geoType);
            found = false;
            return false;
        }
        var poly = new google.maps.Polygon({
            paths: list,
        });
        //console.log(list);

        if (google.maps.geometry.poly.containsLocation(point, poly)) {
            found = true;
            //console.log("found inside poly [" + i + "]");
            // the `every()` loop stops iterating through the array whenever the callback function returns a false value.
            return false;
        }
        else {
            found = false;
            //console.log("Not found at poly [" + i + "]. Searching next poly");
            // Make sure you return "true". If you don't return a value, the `every()` loop will stop.
            return true;
        }
    });
    return found;
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
    for (var angle = 30; angle < 360; angle += 60) {
        coordinates.push(google.maps.geometry.spherical.computeOffset(position[0], radius, angle));
    }
    // Construct the polygon.
    var polygon = new google.maps.Polygon({
        paths: coordinates,
        position: position,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.3,
        geodesic: true
    });
    polygon.setMap(map);
}

function drawHorizontalHexagon(map, position, radius) {
    var color = (position[1] > orangelevel) ? red : (position[1] > yellowlevel) ? orange : (position[1] > greenlevel) ? yellow : green;
    var coordinates = [];

    for (var angle = 0; angle < 360; angle += 60) {
        coordinates.push(google.maps.geometry.spherical.computeOffset(position[0], radius, angle));
    };
    // Construct the polygon.
    var polygon = new google.maps.Polygon({
        paths: coordinates,
        position: position,
        strokeColor: color,
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: color,
        fillOpacity: 0.15,
        geodesic: true
    });
    polygon.setMap(map);
}

//ver 2
function getGeoJSONFile(url, fillcolor) {
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