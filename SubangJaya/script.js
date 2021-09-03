/*
* By Steve Teoh v 4.2 @ 2021/09/02 Live Data Display (Beta)
* For Research Purposes only. 
* Steve is an avid wargamer and crazy programmer that can code at amazing speed.
*/
var map = null;
var geocoder = null;
var myfeature = {};
var mygeometry = {};
var pointCount = 0;
var locations = [];
var gridWidth = 500; // radius ~= hex tile edge (a). 
var bounds = null;
var markers = [];
var places = [];
var lt1 = 0, ln1 = 0;
var pos = {};

var stateRequestURL = 'https://steveteoh.github.io/Hex4/Selangor/selangor.json';
var districtRequestURL = 'https://steveteoh.github.io/Hex4/Selangor/daerah/subang_jaya.json';
var mapID = "Subang Jaya";
const PLACE_BOUNDS = {
    name: "Subang Jaya",
    north: 3.085027,
    south: 2.976325,
    west: 101.549597,
    east: 101.730601,
};
const delta_lat = 0.00389;
const delta_lon = 0.006745;
const cols = (PLACE_BOUNDS.north - PLACE_BOUNDS.south) / delta_lat;  // 
const rows = (PLACE_BOUNDS.east - PLACE_BOUNDS.west) / delta_lon;    //
const grey = 'rgb(77, 77, 77)';     //for coloring unrelated borders
const green = 'rgb(0, 255, 0)';     //for less than 10 cases
const yellow = 'rgb(255, 255, 0)';  //for 11 - 50 cases
const orange = 'rgb(255, 82, 0)';   //for 50 - 99 cases
const red = 'rgb(255, 0, 0)';       //for 100 - 199 active cases
const medred = 'rgb(204, 0, 0)';    //for 200 -299 active cases
const darkred = 'rgb(165, 0, 0)';   //for > 300 active cases
const greenlevel = 10;
const yellowlevel = 50;
const orangelevel = 99;
const redlevel = 199;
const medredlevel = 299;
//const darkredlevel = infinity;

var SQRT3 = 1.73205080756887729352744634150587236;   // sqrt(3)

$(window).load(function () {
    bounds = new google.maps.LatLngBounds();
    map = new google.maps.Map(document.getElementById("map_canvas"), {
        center: { lat: 0, lng: 0 },
        scaleControl: true,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    });
    geocoder = new google.maps.Geocoder();
    var infoWindow = new google.maps.InfoWindow({ map: map });

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
        handleLocationError(false, infoWindow, map.getCenter());
    }

    //read csv file 
    const inputfile = getFileAjax("https://steveteoh.github.io/Hex4/Selangor/daerah/subang_jaya.csv");
    //console.log(inputfile);
    const data = csvToArray(inputfile, ',');
    //console.log(data);

    var layer1 = new google.maps.Data();
    layer1.loadGeoJson(districtRequestURL, { idPropertyName: 'name' },
        function (features) {
            myfeature = layer1.getFeatureById(mapID);
            layer1.forEach((feature) => {
                mygeometry = feature.getGeometry();
                //replace loop with data from csv file
                //var header = "lat,lon,label,placename,weeklyactive,totalactive,weeklyrecovered,totalrecovered,weeklydeaths,totaldeaths,weight,timestamp";
                data.forEach(function (item, index) {
                    //for (var index = 0; index < data.length; index++) {
                    lt1 = parseFloat(data[index]['lat']);
                    ln1 = parseFloat(data[index]['lon']);
                    pos = { lat: lt1, lng: ln1 };
                    //console.log(pos);
                    var locationname = data[index]['placename'];
                    var label1 = data[index]['label'];
                    var weeklyactive = parseInt(data[index]['weeklyactive']);
                    var totalactive = parseInt(data[index]['totalactive']);
                    var weeklyrecovered = parseInt(data[index]['weeklyrecovered']);
                    var totalrecovered = parseInt(data[index]['totalrecovered']);
                    var weeklydeaths = parseInt(data[index]['weeklydeaths']);
                    var totaldeaths = parseInt(data[index]['totaldeaths']);
                    places.push([lt1, ln1, label1, locationname, weeklyactive, totalactive, weeklyrecovered, totalrecovered, weeklydeaths, totaldeaths, totalactive / totalrecovered, '2021-08-15T12:11:01.587Z\ ']);
                    console.log(places[places.length - 1]);
                    //}
                });
            });

            // Adding a marker just so we can visualize where the actual data points are.
            places.forEach(function (place, p) {
                latlng = new google.maps.LatLng({ lat: place[0], lng: place[1] });
                const marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    label: place[4].toString(),       //instead of index() we show the totalactive  //`${p + 1}`,
                    title: place[3],
                });
                //marker.setIcon("https://maps.google.com/mapfiles/ms/icons/blue.png");

                //Attaching related information onto the marker
                attachMessage(marker, place[2] + '<br>place name: ' + place[3] +
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

    hideMarkers();  //initially hide all markers for faster display

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

function getFileAjax(url) {
    var result = "";
    $.ajax({
        url: url,
        async: false,
        success: function (data) {
            result = data;
        }
    });
    return result;
}

function csvToArray(str, delimiter = ",") {
    // slice from start of text to the first \n index. use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

    // slice from \n index + 1 to the end of the text. use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");

    // Map the rows: split values from each row into an array use headers. reduce to create an object. 
    // object properties derived from headers: values. the object passed as an element of the array
    var arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
        }, {});

        return el;
    });
    //return the array
    return arr;
}

/*
 * Export data to CSV using download dialog* 
 */
function exportToCsvFile(sourcedata) {
    var header = "lat,lon,label,placename,weeklyactive,totalactive,weeklyrecovered,totalrecovered,weeklydeaths,totaldeaths,weight,timestamp";
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
    download(url, 'subang_jaya.csv');  //call download helper fn
    // Release the object URL
    URL.revokeObjectURL(url);
}

// helper function
const download = (path, filename) => {
    const anchor = document.createElement('a');
    anchor.href = path;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
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
    var point = new google.maps.LatLng(latlng);  //centroid version does not cover the geographical boundary well.
    //to extend the checking of latlng of centroid to 6 vertices.
    //If any 3 of the vertices is inside,
    //then the coordinate is considered inside.
    var found = false;
    //console.log("geom:" + geom);
    //console.log("array:" + geom.getArray());

    array.every(function (item, i) {
        // If shape is multipolygon
        if (geom.getType() == "Multipolygon")
            var list = item.getAt(0).getArray();
        //else if shape is polygon
        else if (geom.getType() == "Polygon")
            var list = item.getArray();
        //console.log(list);
        var poly = new google.maps.Polygon({
            paths: list,
        });
        if (google.maps.geometry.poly.containsLocation(point, poly)) {
            //console.log("found inside poly [" + i + "]");
            found = true;
            // the `every()` loop stops iterating through the array whenever the callback function returns a false value.
            return false;
        }
        else {
            //console.log("Not found at poly [" + i + "]. Searching next poly");
            found = false;
            // Make sure you return "true". If you don't return a value, the `every()` loop will stop.
            return true;
        }
    });
    return found;
}

// Attaches an info window to a marker with the provided message. When the marker is clicked, the info window will open with the message.
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
    var color = (position[1] > medredlevel) ? darkred :
                (position[1] > redlevel) ? medred :
                (position[1] > orangelevel) ? red :
                (position[1] > yellowlevel) ? orange :
                (position[1] > greenlevel) ? yellow : green;
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
    var color = (position[1] > medredlevel) ? darkred :
                (position[1] > redlevel) ? medred :
                (position[1] > orangelevel) ? red :
                (position[1] > yellowlevel) ? orange :
                (position[1] > greenlevel) ? yellow : green;
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