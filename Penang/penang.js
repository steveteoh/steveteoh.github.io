/*
* By Steve Teoh v 4.2.5.5 @ 2021/09/02 Live Data Display (Beta)
* For Research Purposes only. 
* Purpose: Area Display Tool 
* Steve is an avid wargamer and crazy programmer that can code at amazing speed.
*/
var map = null;
var geocoder = null;
var myfeature = {};
var mygeometry = {};
var locations = [];
var gridWidth = 500 * 2; // radius ~= hex tile edge (a). 
var bounds = null;
var markers = [];
var places = [];
var lt1 = 0, ln1 = 0;
var pos = {};
var grandtotal = 0;

var stateRequestURL = 'https://steveteoh.github.io/Maps/Penang/penang.json';
var districtRequestURL = ['https://steveteoh.github.io/Maps/Penang/island.json', 'https://steveteoh.github.io/Maps/Penang/seberangperai.json'];
var mapID = ["Majlis Bandaraya Pulau Pinang", "Majlis Perbandaran Seberang Perai"];
var inputURL = ['https://steveteoh.github.io/Maps/Penang/island.csv', 'https://steveteoh.github.io/Maps/Penang/seberangperai.csv'];
//var inputURL = "http://localhost:1337/islands.csv";

const grey = 'rgb(77, 77, 77)';       //for coloring unrelated borders
const green = 'rgb(0, 255, 0)';       //for 0 cases
const yellow = 'rgb(255, 255, 102)';  //for  1 - 20 cases
const orange = 'rgb(255, 153, 0)';    //for 21 - 39 cases
const red = 'rgb(255, 67, 67)';       //for 40 - 80 active cases
const medred = 'rgb(204, 0, 0)';      //for 81 - 199 active cases
const purple = 'rgb(102, 0, 102)';    //for 200 - 300 active cases
const blue = 'rgb(0, 0, 255)';        //for > 300 active cases
const greenlevel = 0;
const yellowlevel = 20;
const orangelevel = 40;
const redlevel = 80;
const medredlevel = 200;
const purplelevel = 300;
//const bluelevel = infinity;

const SQRT3 = 1.73205080756887729352744634150587236;   // sqrt(3)

$(window).load(function () {
    bounds = new google.maps.LatLngBounds();
    map = new google.maps.Map(document.getElementById("map_canvas"), {
        center: { lat: 0, lng: 0 },
        scaleControl: true,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    });

    findMylocation();

    //Get the State administrative boundary through geojson file
    map.data.loadGeoJson(stateRequestURL);
    map.data.setStyle({
        //fillColor: grey,
        fillOpacity: 0.0,
        strokeWeight: 1
    });

    drawDistrict(districtRequestURL[0], inputURL[0], mapID[0]);
    drawDistrict(districtRequestURL[1], inputURL[1], mapID[1]);

    // add event listeners for the buttons
    document.getElementById("show-markers").addEventListener("click", showMarkers);
    document.getElementById("hide-markers").addEventListener("click", hideMarkers);

    //hideMarkers();  //initially hide all markers for faster display
});


function drawDistrict(districtRequestURL, inputURL, mapID) {
    //read csv file 
    const inputfile = getFileAjax(inputURL);       //console.log(inputfile);
    const data = csvToArray(inputfile, ',');       //console.log(data);

    var mylayer = new google.maps.Data();
    var subtotal = 0;
    mylayer.loadGeoJson(districtRequestURL, { idPropertyName: 'Nama' },
        function (features) {
            myfeature = mylayer.getFeatureById(mapID);
            mylayer.forEach((feature) => {
                mygeometry = feature.getGeometry();
                //replace the loop with data read from a csv file
                //header = "lat,lon,label,placename,weeklyactive,totalactive,weeklyrecovered,totalrecovered,weeklydeaths,totaldeaths,weight,timestamp";
                data.forEach(function (item, index) {
                    lt1 = parseFloat(data[index]['lat']);
                    ln1 = parseFloat(data[index]['lon']);
                    pos = { lat: lt1, lng: ln1 };
                    var locationname = data[index]['placename'];
                    var label1 = data[index]['label'];
                    var weeklyactive = parseInt(data[index]['weeklyactive']);
                    subtotal += weeklyactive;
                    //console.log(mapID + " #" + index + " weekly=" + weeklyactive + " subtotal=" + subtotal.toString());
                    var totalactive = parseInt(data[index]['totalactive']);
                    var weeklyrecovered = parseInt(data[index]['weeklyrecovered']);
                    var totalrecovered = parseInt(data[index]['totalrecovered']);
                    var weeklydeaths = parseInt(data[index]['weeklydeaths']);
                    var totaldeaths = parseInt(data[index]['totaldeaths']);
                    var weightage = parseInt(data[index]['weight']);
                    var timestamp = data[index]['timestamp'];
                    places.push([lt1, ln1, label1, locationname, weeklyactive, totalactive, weeklyrecovered, totalrecovered, weeklydeaths, totaldeaths, weightage, timestamp]);
                });
                grandtotal += subtotal;
                //console.log("grandtotal=" + grandtotal.toString());
                document.getElementById('grandtotal').innerText = ` ${grandtotal.toString()} cases`;
            });

            switch (mapID) {
                case "Majlis Bandaraya Pulau Pinang":
                    document.getElementById('pgLastUpdate').innerText += `Penang updated: ${new Date(data[0]['timestamp']).toLocaleString()} (${subtotal.toString()} cases),    `;
                    subtotal = 0;
                    break;
                case "Majlis Perbandaran Seberang Perai":
                    document.getElementById('prLastUpdate').innerText += `Seberang Perai updated: ${new Date(data[0]['timestamp']).toLocaleString()} (${subtotal.toString()} cases).`;
                    subtotal = 0;
                    break;
                default:
                    subtotal = 0;
                    break;
            }


            // Adding a marker just so we can visualize where the actual data points are.
            places.forEach(function (place, p) {
                latlng = new google.maps.LatLng({ lat: place[0], lng: place[1] });
                let iconUrl = "https://maps.google.com/mapfiles/ms/icons/";
                let thisColor = (place[4] > purplelevel) ? "blue" :
                    (place[4] > medredlevel) ? "purple" :
                        (place[4] > orangelevel) ? "red" :                   //red and medred uses the same red marker (limited color choice!)
                            (place[4] > yellowlevel) ? "orange" :
                                (place[4] > greenlevel) ? "yellow" : "green";
                iconUrl += thisColor + ".png";
                const marker = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    label: place[4].toString(),  //instead of index=`${p + 1}`, we show the totalactive
                    title: place[3],
                    icon: {
                        url: iconUrl,
                        scaledSize: new google.maps.Size(100, 75), // scaled size
                    }
                });
                //marker.setIcon("https://maps.google.com/mapfiles/ms/icons/blue.png");

                //Attaching related information onto the marker
                attachMessage(marker, place[2] + '<br>place name: ' + place[3] +
                    '<br>Coordinates: (' + place[0] + ',' + place[1] + ')' +
                    '<br>Current Active cases: ' + place[4] +
                    '       | Previous Active cases: ' + place[5] +
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

            hideMarkers();  //initially hide all markers for faster display

            // Now, we draw our hexagons! 
            locations = makeBins(places);
            locations.forEach(function (place, p) {
                drawVerticalHexagon(map, place, gridWidth);
            });
        }
    );
    mylayer.setStyle({
        //    fillColor: grey,
        fillOpacity: 0.0,
        strokeWeight: 1
    });
}

function findMylocation() {
    geocoder = new google.maps.Geocoder();
    var infoWindow = new google.maps.InfoWindow({ map: map });
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                pos = { lat: position.coords.latitude, lng: position.coords.longitude };
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
                //map.setCenter(pos);
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

//Ajax method to read file from url
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

// Quick and Dirty csv to array function, not ecma compliant. You may want to use better ones available 
function csvToArray(str, delimiter = ",") {
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);  // slice from start of text to the first \n index. split() to create an array from string by delimiter    
    const rows = str.slice(str.indexOf("\n") + 1).split("\n"); // slice from \n index + 1 to the end of the text. split() to create an array of each csv value row
    var arr = rows.map(function (row) {
        // Map the rows: split values from each row into an array use headers. reduce to create an object. 
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            // object properties is derived from headers:values, and then passed as an element of the array
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });
    return arr;      //return the array
}

//Handler for "Browser doesn't support Geolocation error"
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation ? "Error: The Geolocation service failed." : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
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
    var color = (position[1] > purplelevel) ? blue :
        (position[1] > medredlevel) ? purple :
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
        strokeOpacity: 0.6,
        strokeWeight: 1,
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