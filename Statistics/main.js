/*
* By Steve Teoh v 1.0.0 @ 2021/10/06 Live Data Display for Malaysia
* (For Research Purposes only. Free for reuse as long as a formal acknowledgement is stated in the header)
* Purpose: Area Display Tool
* Credits: 
* 1. Google Map API documentation https://developers.google.com/maps/documentation/javascript/combining-data#maps_combining_data-javascript
* 2. Source Data https://github.com/MoH-Malaysia/covid19-public/tree/main/
* 
* Knowledge required:
* javascript
* css, html
* json, geojson, csv
* Google Map API
* ----
* Steve is an avid wargamer and crazy programmer who can code at amazing speed. 
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
let infoWindow;
let censusMin = Number.MAX_VALUE,
    censusMax = -Number.MAX_VALUE;
let myStates = [];
let lastDate = new Date().toISOString().split('T')[0];
let baseaddress = "https://steveteoh.github.io";

/** This is the main initMap function to be called during the Google API init  */
function initMap() {
    loadStates(baseaddress + "/json/states.json");   //can be on localhost or actual site
    loadSelectOptions(baseaddress + "/json/variables-states.json");  //can be on localhost or actual site

    // load the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 4, lng: 109 },
        zoom: 6,
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
    let contentString =
        "<b>Details</b><br>" +
        event.feature.getProperty('shapeName') + " total = " + event.feature.getProperty("census_variable").toLocaleString();

    // Replace the info window's content and position.
    infoWindow.setContent(contentString);
    infoWindow.setPosition(event.latLng);
    infoWindow.open(map);
}

/** Loads the state boundary polygons from a GeoJSON source. */
function loadMapShapes() {
    // load state outline polygons from a GeoJson file
    map.data.loadGeoJson(baseaddress + "/Maps/geoBoundaries-MYS-ADM1_simplified.geojson", { idPropertyName: 'STATE' });

    // wait for the request to complete by listening for the first feature to be added
    google.maps.event.addListenerOnce(map.data, "addfeature", () => {
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
            opt.value = filename + "," + keyid + "," + elementid + "," + isdate;
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
function loadStates(sourceFile) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            myStates = JSON.parse(this.responseText);
        }
    };
    xhr.open("GET", sourceFile);   //.json file
    xhr.send();
}

/**
 * Function to get the state index 
 * 
 * @param {any} stateName
 */
function getStateIndex(stateName) {
    for (let i = 0; i < myStates.length - 1; i++) {
        if (myStates[i][0] == stateName)
            return myStates[i][1];
    };
    return -1;
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
    document.getElementById("date-label").textContent = "Last Upd";
    document.getElementById("date-box").style.display = "block";
    document.getElementById("date-value").textContent = lastDate;
}

/**
 * Date Function to return "Yesterday" in ISO format e.g. 2021-10-07
 */
const yesterday = () => {
    let d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

/**
 * Loads data from a json file according to the specified key id (usually state id) and the element id (from the list of variables)
 * (WIP) 
 *  
 * @param {any} filename
 * @param {any} keyId
 * @param {any} elementId
 * @param {any} daily
 */
function loadJsonItem(filename, keyId, elementId, daily) {
    // load the requested variable from the census API (using local copies)
    var xhr = new XMLHttpRequest();
    xhr.open("GET", filename);
    xhr.onload = function () {
        const censusData = JSON.parse(xhr.responseText);
        censusData.shift();
        censusData.forEach((row) => {
            const censusVariable = parseFloat(row[0]);
            const stateId = row[1];
            // keep track of min and max values
            if (censusVariable < censusMin) {
                censusMin = censusVariable;
            }

            if (censusVariable > censusMax) {
                censusMax = censusVariable;
            }

            const state = map.data.getFeatureById(stateId); //get the state features from gmap
            // update the existing row with the new data
            if (state) {
                state.setProperty("census_variable", censusVariable);
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
            lastDate = arr[arr.length - 2].split(',')[0];
        }
        else {
            lastDate = new Date().toISOString().split('T')[0];
        }

        arr.map(function (row, index) {
            const items = row.split(',');
            var stateId = 0;

            if (daily == "true") {
                if (items[0] != lastDate) {
                    return; //if daily data, skip previous dates until the latest
                }
            }

            if (isNaN(items[keyId])) {
                //Reason: E.g. Name used as key id for state
                var stateIndex = getStateIndex(items[keyId]);
                stateId = stateIndex;
            }
            else {
                stateId = items[keyId];
            }

            var censusVariable = isNaN(items[elementId]) ? 0 : parseFloat(items[elementId]);
            if (isNaN(censusVariable)) censusVariable = 0;
            //double protection, in case the government decides not to release certain variables, the data will be null which cannot be displayed (happening in 9/10/2021?!)

            // keep track of min and max values
            if (censusVariable < censusMin) {
                censusMin = censusVariable;
            }
            if (censusVariable > censusMax) {
                censusMax = censusVariable;
            }
            const state = map.data.getFeatureById(stateId);
            // update the existing row with the new data
            if (state) {
                state.setProperty("census_variable", censusVariable);
            }
        });
        // update and display the legend
        document.getElementById("census-min").textContent = censusMin.toLocaleString();
        document.getElementById("census-max").textContent = censusMax.toLocaleString();
    };
    xhr.send();
}

/** Removes census data from each shape on the map and resets the UI. */
function clearCensusData() {
    censusMin = Number.MAX_VALUE;
    censusMax = -Number.MAX_VALUE;
    map.data.forEach((row) => {
        row.setProperty("census_variable", undefined);
    });
    document.getElementById("data-box").style.display = "none";
    document.getElementById("data-caret").style.display = "none";
    document.getElementById("date-box").style.display = "none";  //also clear the date
}

/**
 * Applies a gradient style based on the 'census_variable' column.
 * This is the callback passed to data.setStyle() and is called for each row in
 * the data set.  Check out the docs for Data.StylingFunction.
 *
 * @param {google.maps.Data.Feature} feature
 */
function styleFeature(feature) {
    const high = [5, 69, 54]; // color of largest datum
    const low = [151, 83, 34]; // color of smallest datum

    // delta represents where the value sits between the min and max
    const delta = (feature.getProperty("census_variable") - censusMin) / (censusMax - censusMin);
    const color = [];

    for (let i = 0; i < 3; i++) {
        // calculate an integer color based on the delta
        color.push((high[i] - low[i]) * delta + low[i]);
    }

    // determine whether to show this shape or not
    let showRow = true;

    if (
        feature.getProperty("census_variable") == null || isNaN(feature.getProperty("census_variable"))
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
    const percent = ((e.feature.getProperty("census_variable") - censusMin) / (censusMax - censusMin)) * 100;

    // update the label
    document.getElementById("data-label").textContent = e.feature.getProperty("shapeName");
    document.getElementById("data-value").textContent = e.feature.getProperty("census_variable").toLocaleString();
    document.getElementById("data-box").style.display = "block";
    document.getElementById("data-caret").style.display = "block";
    document.getElementById("data-caret").style.paddingLeft = percent + "%";
    //update data
    document.getElementById("date-label").textContent = "Last Upd";
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
