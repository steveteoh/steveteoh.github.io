/*
* By Steve Teoh v 1.0.0 @ 2021/10/26 Live Data Display for Districts in Malaysia
* (For Research Purposes only. Free for reuse with explicit consent from the author and a formal acknowledgement is stated in the header)
* Purpose: Area Display Tool
* 
* Credits: 
* 1. Google Map API documentation https://developers.google.com/maps/documentation/javascript/combining-data#maps_combining_data-javascript
* 2. Source Data https://github.com/MoH-Malaysia/covid19-public/tree/main/
* 
* Knowledge required:
* javascript
* css, html
* json, geojson, csv
* Google Map API
* 
* Issues: 
* Still many unresolved items as the MOH data is full of inconsistencies in district names and representation, e.g. 'pelbagai', '&', 'dan' etc
* You may need to implement a language parser to handle these kinds of input.
* 
* ----
* Steve is an avid wargamer and crazy programmer who can code at amazing speed. 
* Kindly contact Steve Teoh at [@teohcheehooi](https://twitter.com/teohcheehooi) or email to [Steve](mailto:chteoh@1utar.my?subject=Map "Map")
*
*/

const mapStyle = [
    {
        stylers: [{ visibility: "off" }],
    },
    {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [{ visibility: "on" }, { color: "#fcfcfc" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ visibility: "on" }, { color: "#bfd4ff" }],
    },
];

let map;
let markers;
let infoWindow;
let censusMin = Number.MAX_VALUE,
    censusMax = -Number.MAX_VALUE;
let myDistricts;
let lastDate = new Date().toISOString().split('T')[0];
let baseaddress = "https://steveteoh.github.io";

/** This is the main initMap function to be called during the Google API init  */
function initMap() {
    loadDistricts(baseaddress + "/json/districts.json");   //can be on localhost or actual site
    loadSelectOptions(baseaddress + "/json/variables-districts.json");  //can be on localhost or actual site

    // load the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 4, lng: 109 },
        zoom: 7,
        mapTypeControl: false,
        styles: mapStyle,
    });
    // set up the style rules and events for google.maps.Data
    map.data.setStyle(styleFeature);
    map.data.addListener("mouseover", mouseInToRegion);
    map.data.addListener("mouseout", mouseOutOfRegion);

    // wire up the button
    const selectBox = document.getElementById("census-variable");

    google.maps.event.addDomListener(selectBox, "change", () => {
        clearCensusData();
        //extract the variables from the selectBox
        const items = selectBox.options[selectBox.selectedIndex].value.toString().split(',');

        //load the census data according to selection
        loadCensusData(items[0], items[1], items[2], items[3]);
    });

    // Latest: Add a listener for the click event.  
    map.data.addListener("click", showClick);
    infoWindow = new google.maps.InfoWindow();

    // state polygons only need to be loaded once, do them now
    loadMapShapes();
}

/**
 * Latest: Reacts to click event by showing the related state statistics
 * 
 * @param {any} event
 */
function showClick(event) {
    let contentString = "<b>Details</b><br>" +
        event.feature.getProperty('shapeName') + " total = " + event.feature.getProperty("census-total").toLocaleString() +
        "<br>" + event.feature.getProperty('clusters');
    // Replace the info window's content and position.
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
}


/** Loads the state boundary polygons from a GeoJSON source. */
function loadMapShapes() {
    // load state outline polygons from a GeoJson file
    map.data.loadGeoJson("https://steveteoh.github.io/Maps/geoBoundaries-MYS-ADM2_simplified.geojson", { idPropertyName: 'DISTRICT' },
        (features) => {
            for (var i = 0; i < features.length; i++) {
                var bounds = new google.maps.LatLngBounds();
                features[i].getGeometry().forEachLatLng(function (latlng) {
                    bounds.extend(latlng);
                });
                var lats = parseFloat(bounds.getCenter().toUrlValue().split(',')[0]);
                var lons = parseFloat(bounds.getCenter().toUrlValue().split(',')[1]);

                markers = new MarkerWithLabel({
                    position: new google.maps.LatLng({ lat: lats, lng: lons }),
                    draggable: false,
                    raiseOnDrag: true,
                    map: map,
                    labelContent: features[i].getProperty("shapeName"),   
                    labelAnchor: new google.maps.Point(80, 0),
                    labelClass: "labels",                           // the CSS class for the label
                    labelStyle: { opacity: 0.6 }
                });
                markers.setIcon("http://maps.google.com/mapfiles/kml/pal4/icon24.png");
            }
        }
    );

    // wait for the request to complete by listening for the first feature to be added
    google.maps.event.addListenerOnce(map.data, "addfeature", (e) => {
        google.maps.event.trigger(document.getElementById("census-variable"), "change");

    });
}

/**
 * Fills the selectList options with values from the data source file
 * 
 * @param {string} sourceFile
 */
function loadSelectOptions(sourceFile) {
    const selectList = document.getElementById("census-variable");
    var xhr = new XMLHttpRequest();
    xhr.open("GET", sourceFile);   //.json file
    xhr.onload = function () {
        const listing = JSON.parse(xhr.responseText);
        listing.shift();  // the first row contains column names
        listing.forEach((thisrow, index) => {
            const title = thisrow[0];
            const filename = thisrow[1];
            const keyid = thisrow[3];
            const elementid = thisrow[5];
            const isdate = thisrow[6];
            var opt = document.createElement("option");
            opt.value = filename + "," + keyid + "," + elementid + "," + isdate;  //option values contains 3 parts separated by commas
            opt.innerHTML = title;
            //append it to the select element
            selectList.appendChild(opt);
            document.getElementById("date-value").textContent = lastDate;
        });
    };
    xhr.send();
}

/**
 * Loads the list of states asynchronously into myStates array
 * 
 * @param {string} sourceFile
 */
function loadDistricts(sourceFile) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            myDistricts = JSON.parse(this.responseText); //return object
        }
    };
    xhr.open("GET", sourceFile);   //.json file
    xhr.send();
}

/**
 * Function to get the state index 
 * 
 * @param {any} districtName
 */
function getDistrictIndex(districtName) {
    for (let i = 0; i < Object.keys(myDistricts).length - 1; i++) {
        if ((myDistricts[i]['daerah'].toUpperCase() == districtName.toUpperCase()))
            return myDistricts[i]['no'];   
    };
    return 0;
}

/**
 * Loads the census data from the data source file.
 *
 * @param {string} filename
 * @param {number} keyId
 * @param {number} elementId
 */
function loadCensusData(filename, keyid, elementid, daily) {
    if (filename.endsWith("json")) {
        loadJsonItem(filename, keyid, elementid, daily);
    }
    else if (filename.endsWith("csv")) {
        loadCsvItem(filename, keyid, elementid, daily);
    }
    //Display initial Date
    document.getElementById("date-label").textContent = "Last Update";
    document.getElementById("date-box").style.display = "block";
    document.getElementById("date-value").textContent = lastDate;
}

/**
 * Date Function to return "Yesterday" in ISO format e.g. 2021-10-17 (for example)
 */
const yesterday = () => {
    let d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

/**
 * Loads data from a json file according to the specified key id (usually state id) and the element id (from the list of variables)
 * (WIP) ...
 *  
 * @param {any} filename
 * @param {any} keyId
 * @param {any} elementId
 * @param {any} daily
 */
function loadJsonItem(filename, keyId, elementId, daily) {
     // load the requested variable from the census API (using local copies)
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filename);   //.json
    xhr.onload = function () {
        const censusData = JSON.parse(xhr.responseText);
        censusData.shift(); // the first row contains column names
        censusData.forEach((row) => {
            const censusVariable = parseFloat(row[elementId]);
            const districtId = row[keyId];
            // keep track of min and max values
            if (censusVariable < censusMin) {
                censusMin = censusVariable;
            }

            if (censusVariable > censusMax) {
                censusMax = censusVariable;
            }

            const dist = map.data.getFeatureById(districtId); //get the state features from gmap
            // update the existing row with the new data
            if (dist) {
                dist.setProperty("census-variable", censusVariable);
            }
        });
        // update and display the legend
        document.getElementById("census-min").textContent = censusMin.toLocaleString();
        document.getElementById("census-max").textContent = censusMax.toLocaleString();
    };
    xhr.send();
}


/**
 * Loads data from a CSV file according to the specified key id (usually state id) and the element id (from the list of variables) 
 * 
 * @param {string} filename
 * @param {number} keyId
 * @param {number} elementId
 */
function loadCsvItem(filename, keyId, elementId, daily) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filename);   //.csv
    xhr.onload = function () {
        var censusData = xhr.responseText;
        if (censusData.includes("Malaysia"))                      // if contain whole Malaysia data, we drop it from state list
            censusData = censusData.slice(censusData.indexOf("\n") + 1);

        const arr = censusData.split("\n").slice(1); // the first row contains column names so we drop it, second row onwards is data!

        if (daily == "true") {
            lastDate = arr[arr.length - 2].split(',')[3];    //last item
        }
        else {
            lastDate = new Date().toISOString().split('T')[0];
        }

        arr.map(function (row, index) {
            const items = CSVtoArray(row); 
            var districtId = 0;

            //for new cases
            if (elementId == 7 && daily == "true") {
                if (items[3] != lastDate) {
                    return; //if daily data, skip previous dates
                }
            }

            //skip zero values
            if (items[elementId] == 0) {
                return; // skip zeroes
            }

            //Show only active, skip the rest
            if (elementId == 9 && items[6] != "active") {
                return;
            }

            var dists = [];
            if (items[keyId] != undefined)
                dists = items[keyId].split(',');   //to cater for mixed names (not 1-1 mapping) in the district field. What a mess....                          

            var censusVariable = 0, censusTotal = 0, wpcount = 0; //wpcount: to handle duplicate count for Wilayah areas in a line of data

            dists.map(function (item, index) {
                if (isNaN(item)) {    
                    //Reason: E.g. Name used as key id for districts
                    var districtIndex = getDistrictIndex(item.trimStart()); //trim any leading spaces
                    districtId = districtIndex;
                }
                else {
                    districtId = item;  
                }

                if (districtId == 150) wpcount++;
                if (wpcount > 1) {
                    return;  //skip to avoid duplicate count for wilayah
                }

                censusVariable = isNaN(items[elementId]) ? 0 : parseFloat(items[elementId]);
                if (isNaN(censusVariable)) censusVariable = 0;

                //construct the message for cluster property
                var msg = " " + items[3] + ", " + items[0] + ", " + items[5] + ", " + items[6] + ", total=" + censusVariable;

                // keep track of min and max values
                if (censusVariable < censusMin) {
                    censusMin = censusVariable;
                }
                if (censusVariable > censusMax) {
                    censusMax = censusVariable;
                }

                const distr = map.data.getFeatureById(districtId);
                // update the existing row with the new data
                if (distr) {
                    censusTotal = distr.getProperty("census-total");
                    if (typeof (censusTotal) == "undefined") censusTotal = 0;
                    distr.setProperty("census-variable", censusVariable);
                    distr.setProperty("census-total", censusTotal + censusVariable);

                    var info = distr.getProperty("clusters");
                    if (typeof (info) == "undefined") info = "";
                    distr.setProperty("clusters", info + "<br>" + msg);

                    // keep track of min and max values
                    if (censusTotal + censusVariable < censusMin) {
                        censusMin = censusTotal + censusVariable;
                    }
                    if (censusTotal + censusVariable > censusMax) {
                        censusMax = censusTotal + censusVariable;
                    }
                }
            });
        });
        // update and display the legend
        document.getElementById("census-min").textContent = censusMin.toLocaleString();
        document.getElementById("census-max").textContent = censusMax.toLocaleString();
    };
    xhr.send();
}

/**
 * Return array of string values, or NULL if CSV string not well formed regex.
 * 
 * @param {any} text
 */
function CSVtoArray(text) {
    //Sorry. MOH's data is simply non RFC4180 compliant so there is no need for this strict regex checking.

    //var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    // Return NULL if input string is not well formed CSV string.
    // if (!re_valid.test(text)) return null;

    var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

    var a = [];                     // Initialize array to receive values.
    text.replace(re_value,          // "Walk" the string using replace with callback.
        function (m0, m1, m2, m3) {
            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });
    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};

/** Removes census data from each shape on the map and resets the UI. */
function clearCensusData() {
    censusMin = Number.MAX_VALUE;
    censusMax = -Number.MAX_VALUE;
    map.data.forEach((row) => {
        row.setProperty("census-variable", undefined);
        row.setProperty("census-total", undefined);
        row.setProperty("clusters", undefined);
    });
    document.getElementById("data-box").style.display = "none";
    document.getElementById("data-caret").style.display = "none";
    document.getElementById("date-box").style.display = "none";  //also clear the date
}

/**
 * Applies a gradient style based on the 'census-total' column.
 * This is the callback passed to data.setStyle() and is called for each row in
 * the data set.  Check out the docs for Data.StylingFunction.
 *
 * @param {google.maps.Data.Feature} feature
 */
function styleFeature(feature) {
    const high = [5, 69, 54]; // color of largest datum
    const low = [151, 83, 34]; // color of smallest datum

    // delta represents where the value sits between the min and max
    const delta = (feature.getProperty("census-total") - censusMin) / (censusMax - censusMin);
    const color = [];

    for (let i = 0; i < 3; i++) {
        // calculate an integer color based on the delta
        color.push((high[i] - low[i]) * delta + low[i]);
    }

    // determine whether to show this shape or not
    let showRow = true;

    if (
        feature.getProperty("census-total") == null || isNaN(feature.getProperty("census-total"))
    ) {
        showRow = false;
    }

    let outlineWeight = 0.5,
        zIndex = 1;

    if (feature.getProperty("state") === "hover") {
        outlineWeight = zIndex = 2;
    }
    return {
        strokeWeight: outlineWeight,
        strokeColor: "#fff",
        zIndex: zIndex,
        fillColor: "hsl(" + color[0] + "," + color[1] + "%," + color[2] + "%)",
        fillOpacity: 0.75,
        visible: showRow,
    };
}

/**
 * Responds to the mouse-in event on a map shape (state).
 *
 * @param {?google.maps.MapMouseEvent} e
 */
function mouseInToRegion(e) {
    // set the hover state so the setStyle function can change the border
    e.feature.setProperty("state", "hover");
    const percent = ((e.feature.getProperty("census-variable") - censusMin) / (censusMax - censusMin)) * 100;

    // update the label
    document.getElementById("data-label").textContent = e.feature.getProperty("shapeName");
    document.getElementById("data-value").textContent = e.feature.getProperty("census-total").toLocaleString();
    document.getElementById("data-box").style.display = "block";
    document.getElementById("data-caret").style.display = "block";
    document.getElementById("data-caret").style.paddingLeft = percent + "%";
    //update data
    document.getElementById("date-label").textContent = "Last Update";
    document.getElementById("date-value").textContent = lastDate;
    document.getElementById("date-box").style.display = "block";
}

/**
 * Responds to the mouse-out event on a map shape (state).
 *
 * @param {?google.maps.MapMouseEvent} e
 */
function mouseOutOfRegion(e) {
    // reset the hover state, returning the border to normal
    e.feature.setProperty("state", "normal");
}
