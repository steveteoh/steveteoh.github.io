/*
* By Steve Teoh v 1.1.0.0 @ 2021/12/02 User Travel Location Generator
* For Research Purposes only.
* Purpose: Simulation Tool
* Steve is an avid wargamer and crazy programmer that can code at amazing speed.
*/

let dateBegin = "20211101";
let dateEnd = "20211130";

//------------------------------
var baseaddress = "https://steveteoh.github.io";   //localhost = "http://localhost:1337";
var filename = "klangvalley"
var summaryfilename = "klangvalley_monthly_summary-2021-11.csv";
var primaryschfilename = "https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/vaccination/vax_school.csv";      //easier to read KKM hosted data
var secondaryschfilename = "https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/vaccination/vax_school.csv";    //easier to read KKM hosted data
var iptafilename = "ipta.csv";                                                                                                 //self-hosted on baseaddress
var iptsfilename = "";                                                                                                         //To do. not enough time to work as data entry clerk
var foldername = "selangor";

const delta_lat = 0.0077800;
const delta_lon = 0.0134817;

var myfeature = {};
var mygeometry = {};
var onWaterAPIKey = "uUcuKBJfAjJZcwBsSuo7";               //Steve punya key. DO NOT SHARE!
var areaRequestURL = '/Maps/states/selangor.geojson';
var mapID = "Selangor";
var country = "Malaysia", state = "Selangor", district = "", city = "", region = "";


//Nov 23,25 not available on KKM's website https://covid-19.moh.gov.my/kajian-dan-penyelidikan/nilai-r-malaysia
//Note: values are approximated for the two missing dates 23/11 and 25/11!!

var rNaughtMY = [0.96, 0.95, 0.94, 0.94, 0.92, 0.91, 0.92, 0.94, 0.96, 0.99, 1.00, 1.04, 1.05, 1.05, 1.05, 1.04, 1.03, 1.02, 1.01, 1.01, 1.00, 1.00, 1.00, 0.99, 0.99, 0.97, 0.96, 0.96, 0.95, 0.95];
var rNaughtSL = [0.98, 0.98, 1.00, 1.01, 0.99, 0.99, 0.99, 1.00, 1.01, 1.03, 1.03, 1.04, 1.04, 1.04, 1.04, 1.05, 1.06, 1.05, 1.07, 1.08, 1.07, 1.06, 1.05, 1.04, 1.04, 1.02, 1.01, 1.00, 0.99, 0.99];
var rNaughtKL = [1.01, 1.01, 1.01, 0.99, 0.96, 0.98, 1.00, 1.00, 1.02, 1.03, 1.04, 1.06, 1.05, 1.05, 1.04, 1.05, 1.09, 1.09, 1.09, 1.08, 1.06, 1.05, 1.05, 1.05, 1.06, 1.04, 1.02, 1.00, 1.00, 1.02];
var rNaughtPU = [1.06, 1.05, 1.07, 1.11, 1.06, 1.09, 1.03, 1.06, 1.07, 1.06, 1.16, 1.17, 1.20, 1.20, 1.17, 1.15, 1.12, 1.06, 1.12, 1.17, 1.13, 1.15, 1.13, 1.12, 1.04, 1.03, 1, 1.00, 0.99, 0.98];

//Simulation parameter  - Sample Qty
var multiplier = 1;   //1=100samples, 10=1000samples, 100=10,000samples, 1000=100,000samples etc.

//Simulated personnel according to the age groups
var personnel = [];

//Final simulation results container
var simulation = [];

//destinations for various types of students
var primary = [];
var secondary = [];
var unicollege = [];

//state maps with corresponding cases
//Note: Records loaded are filtered by (totalcases > 0) so that we remove non inhabitat areas like forests etc.
var places = [];
var placesAll = [];

//Age group: according to KKM's population.csv data
var ageGroup = [
    { category: "6 & below", total: 307388, percentage: 3.65, role: "children", min: 1, max: 6 },
    { category: "7 to 12", total: 359604, percentage: 4.27, role: "primary", min: 7, max: 12 },
    { category: "13 to 18", total: 1537800, percentage: 18.26, role: "secondary", min: 13, max: 18 },
    { category: "19 to 22", total: 53054, percentage: 0.63, role: "uni/college", min: 19, max: 22 },
    { category: "23 to 60", total: 5377254, percentage: 63.85, role: "working people", min: 23, max: 60 },
    { category: "above 60", total: 786600, percentage: 9.34, role: "retiree", min: 60, max: 100 },
    //{ category: "population", total: 8421700, percentage: 100, role: "total population", min: 1, max: 120 },
];

//lifestyle definition (extensible)
//amendment(s): minimum must have at least one waypoint (i.e. present location) and cannot be zero
var lifestyleParam = [
    { category: "CHILDREN", min_days: 5, max_days: 7, fraction: 1, min_distance: 5000, max_distance: 10000, min_pts: 1, max_pts: 2 },                           //dest: random
    { category: "PRIMARY", min_days: 5, max_days: 6, fraction: 1, min_distance: 5000, max_distance: 10000, min_pts: 2, max_pts: 4 },                            //dest: ~primary
    { category: "SECONDARY", min_days: 5, max_days: 6, fraction: 1, min_distance: 10000, max_distance: 20000, min_pts: 2, max_pts: 6 },                         //dest: ~secondary
    { category: "UNI/COLLEGE", min_days: 5, max_days: 6, fraction: 1, min_distance: 10000, max_distance: 20000, min_pts: 2, max_pts: 6 },                       //dest: ~ipta,ipts
    { category: "WORKING people: general", min_days: 5, max_days: 6, fraction: 0.45, min_distance: 10000, max_distance: 40000, min_pts: 3, max_pts: 5 },        //dest: random
    { category: "WORKING people: sales", min_days: 5, max_days: 6, fraction: 0.20, min_distance: 10000, max_distance: 100000, min_pts: 3, max_pts: 8 },         //dest: random
    { category: "WORKING people: office", min_days: 5, max_days: 6, fraction: 0.15, min_distance: 10000, max_distance: 40000, min_pts: 3, max_pts: 5 },         //dest: random
    { category: "WORKING people: not working", min_days: 0, max_days: 7, fraction: 0.15, min_distance: 0, max_distance: 50000, min_pts: 1, max_pts: 8 },        //dest: random
    { category: "WORKING people: vacation", min_days: 1, max_days: 7, fraction: 0.025, min_distance: 100000, max_distance: 100000, min_pts: 10, max_pts: 30 },  //dest: random
    { category: "WORKING people: leave @ home", min_days: 1, max_days: 7, fraction: 0.025, min_distance: 0, max_distance: 80000, min_pts: 1, max_pts: 8 },      //dest: random
    { category: "RETIREE", min_days: 7, max_days: 7, fraction: 1, min_distance: 5000, max_distance: 10000, min_pts: 1, max_pts: 5 }                             //dest: random
]

/**
 * RNaught mapping functions (only state level r0 is available)
 * To do: convert to auto loading from file in future
 *
 * @param {any} statename
 * @param {any} date
 */
function stateR0(statename, date) {
    var r0 = 0;
    switch (statename) {
        case 'Selangor':
            r0 = rNaughtSL[date - dateBegin]; break;
        case 'KL':
            r0 = rNaughtKL[date - dateBegin]; break;
        case 'Putrajaya':
            r0 = rNaughtPU[date - dateBegin]; break;
        default:
            r0 = rNaughtMY[date - dateBegin]; break;
    }
    return r0;
}

//----------------------------------
//   Exception handling functions  |
//----------------------------------

/**
 * Function to check whether a coordinate falls on water 
 * 
 * @param {any} APIKey
 * @param {any} lat
 * @param {any} lon
 */
async function onWater(APIKey, lat, lon) {
    /* Request: https://api.onwater.io/api/v1/results/3.016585707355601,101.14110816668111?access_token=uUcuKBJfAjJZcwBsSuo7
     * Response:
       { "query": "3.016585707355601,101.14110816668111", "request_id": "674c233b-b391-4788-8753-791c62640ef2",
         "lat": 3.016585707355601, "lon": 101.14110816668111,   "water": true   }
     */
    var url = "https://api.onwater.io/api/v1/results/" + lat + "," + lon + "?access_token=" + APIKey;
    let response = await fetch(url);
    let data = await response.json();
    let iswater = data.water;
    //console.log(lat + "," + lon + ":"+ data.water);
    return (iswater);
}

/**
 * GeoJson method to check state boundary
 *
 * @param {any} areaRequestURL
 * @param {any} mapID
 * @param {any} lat
 * @param {any} lon
 * @param {any} mindist
 * @param {any} minlat
 * @param {any} minlon
 * @param {any} index
 */
function isBounded(areaRequestURL, mapID, lat, lon, mindist, minlat, minlon, index) {
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
    var mapProp = {
        center: new google.maps.LatLng(lat, lon),
        zoom: 5,
    };
    var pos = { lat: parseFloat(lat), lng: parseFloat(lon) };
    map.data.loadGeoJson(areaRequestURL, { idPropertyName: 'ShapeName' },
        function (features) {
            myfeature = map.data.getFeatureById(mapID);
            map.data.forEach((feature) => {
                mygeometry = feature.getGeometry();
                if (isInside(mygeometry, pos)) {
                    console.log("gmap geomet --- point " + lat + "," + lon + " is INSIDE of " + mapID + " state. min dist= " + mindist + " m to (" + minlat + "," + minlon + " ind=" + index);
                    return true;
                }
                else {
                    console.log("gmap geomet --- point " + lat + "," + lon + " is outside of " + mapID + " state. min dist= " + mindist + " m");
                    return false;
                }
            });
        }
    )
}

/**
* by Steve (Code derived from Hex Grid Generator) Ver 3.x
* Function to determine whether a point is inside a geometry. This is a quick alternative method to the previous "ray casting" algorithm.
 * 
 * @param {any} geom
 * @param {any} latlng
 */
function isInside(geom, latlng) {
    var array = geom.getArray();
    var point = new google.maps.LatLng(latlng);     //centroid version does not cover the geographical boundary well.
    //To extend the checking of latlng of centroid to 6 vertices:
    //If any 3 of the vertices is inside, the coordinate is considered inside.    
    var found = false;
    // console.log("geom:" + geom); console.log("type:" + geom.getType()); console.log("array:" + geom.getArray());
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

/**
// Function to determine whether the generated point is in "water" (aka masuk air)
 * returns true or false 
 *
 * @param {any} lat
 * @param {any} lon
 */
async function testWater(lat, lon) {
    await onWater(onWaterAPIKey, lat, lon).then(iswater => {
        console.log("onwater.io  --- point " + lat + "," + lon + " in water? " + iswater);
        return iswater;
    });
}

/**
 * Function to quickly determine the address of a given point via Google Map reverse geolocation services (may not be 100% accurate)
 * Returns the 'state name' where the point is located
 * Calls: getStateName function
 *
 * @param {any} lats
 * @param {any} lons
 */
async function testState(lats, lons) {
    await getStateName(new google.maps.LatLng({ lat: lats, lng: lons }));
    console.log("gmap revgeo --- point " + lats + "," + lons + " is in " + state);
}

/**
 * Get the state name for a given lat,lon via geocoder  services
 * 
 * @param {any} latlng
 */
async function getStateName(latlng) {
    //Change to Google reverse geocoding
    var geocoder = new google.maps.Geocoder();
    let myPromise = new Promise(function (resolve) {
        geocoder.geocode({ location: latlng })
            .then((response) => {
                if (response.results[0]) {
                    for (var i = 0; i < response.results[0].address_components.length; i++) {
                        if (response.results[0].address_components[i].types[0] == "country") {
                            //this is the object you are looking for Country
                            country = response.results[0].address_components[i].long_name;
                            //console.log(country);
                        }
                        if (response.results[0].address_components[i].types[0] == "administrative_area_level_1") {
                            //this is the object you are looking for State
                            state = response.results[0].address_components[i].long_name;
                            //console.log(state);
                        }
                        if (response.results[0].address_components[i].types[0] == "administrative_area_level_2") {
                            //this is the object you are looking for District / County
                            district = response.results[0].address_components[i].long_name;
                            //console.log(district);
                        }
                        if (response.results[0].address_components[i].types[0] == "administrative_area_level_3") {
                            //this is the object you are looking for Region
                            region = response.results[0].address_components[i].long_name;
                            //console.log(region);
                        }
                        if (response.results[0].address_components[i].types[0] == "locality") {
                            //this is the object you are looking for City / Locality
                            city = response.results[0].address_components[i].long_name;
                            //console.log(city);
                        }
                    }
                    nation = { country: country, state: state, district: district, region: region, city: city };
                    //we just use statename here
                    resolve(state);
                }
                else {
                    resolve("not found");
                }
            })
            .catch((e) => {
                console.log("Error processing " + latlng.lat + "," + latlng.lon + "Geocoder failed due to: " + e);
            });
    });
    await myPromise.then((resolve) => {
        //console.log(resolve);
        return resolve;
    });
}


//----------------------
//   Main function     |
//----------------------

//Initialization Function (called during loading of script)
//
function initData() {
    //Start
    //1. Load the state daily active cases summary 
    LoadStateCasesSummary(baseaddress + "/data/" + foldername + "/" + summaryfilename);
    LoadStateCasesFull(baseaddress + "/data/" + foldername + "/" + summaryfilename);

    //2. Load the primary and secondary schools
    //-----------------------------------------------------------------
    //  {code, school, state, district, postcode, lat, lon, ....}
    //  code:  XYZxxxx       X: state, Y: level, Z: type of school
    //-----------------------------------------------------------------
    //          ^2nd char 
    //primary = B(SK), C(SJK)                                //level 1
    //secondary = E (SMK & T6), F (SM Agama),  R  (Agama)    //level 2
    //vokasional = H (kolej vokasional), K (sm teknik)       //level 3
    //-----------------------------------------------------------------
    LoadSchool(10, 1, primary, primaryschfilename);       //10=Selangor, 14=KL, 16=Putrajaya
    LoadSchool(14, 1, primary, primaryschfilename);       //easier to read KKM hosted data
    LoadSchool(16, 1, primary, primaryschfilename);
    LoadSchool(10, 2, secondary, secondaryschfilename);
    LoadSchool(14, 2, secondary, secondaryschfilename);
    LoadSchool(16, 2, secondary, secondaryschfilename);
    LoadSchool(10, 3, secondary, secondaryschfilename);
    LoadSchool(14, 3, secondary, secondaryschfilename);
    LoadSchool(16, 3, secondary, secondaryschfilename);

    //3. Load the uni and colleges. Can add more when data is available
    //No,Name,State,Code,Lat,Lon
    LoadUniCollege(10, unicollege, baseaddress + "/data/" + iptafilename);  //10=Selangor, 14=KL, 16=Putrajaya
    LoadUniCollege(14, unicollege, baseaddress + "/data/" + iptafilename);
    LoadUniCollege(16, unicollege, baseaddress + "/data/" + iptafilename);
    //-----------------------------------------------------------------

    //4. Hook event to buttons
    document.getElementById("Samples").addEventListener("click", generateSamples);
    document.getElementById("Simulate").addEventListener("click", startSimulation);
    document.getElementById("Download").addEventListener("click", saveFile);

    //set the initial status
    document.getElementById("Samples").disabled = false;   //only enable once samples are created
    document.getElementById("Simulate").disabled = true;   //only enable once samples are created
    document.getElementById("Download").disabled = true;   //only enable once simulation is finished.

    //End. Ready to run
}

//-------------------------
//   Helper functions     |
//-------------------------

/**
 * Search function to search the hex grid for the nearest 1km radius match.
 * Returns a positive index or -1 (not found)
 * 
 * @param {any} lat
 * @param {any} lon
 */
function searchPlace(lat, lon) {
    var smallest = Infinity; minlat = 0; minlon = 0; index = 0;
    for (var i = 0; i < placesAll.length; i++) {
        var dist = distance(parseFloat(placesAll[i][0]), parseFloat(placesAll[i][1]), parseFloat(lat), parseFloat(lon));
        if (dist <= 1000) {
            return i;
        }
        if (dist < smallest) {
            smallest = dist; minlat = placesAll[i][0]; minlon = placesAll[i][1]; index = i;
        }
    }
    //Error! If you reach here, it is definitely wrong - "Not Found." 
    //console.log("Error. " + lat + "," + lon + " not found in grid. Min distance= " + smallest.toFixed(2) + "m");

    //remedial actions
    testWater(lat, lon); //in water?
    testState(lat, lon); //which state it is located?

    //Function to check the problematic points whether they are still considered inside the state.
    isBounded(baseaddress + areaRequestURL, mapID, lat, lon, smallest.toFixed(2), minlat, minlon, index);
    //Note: Some borderline points may fail as it is not represented by any grid.

    return -1; //-1 to denote failed search
}

/**
 * Function to delay execution speed of a loop (for, while etc) so that the web services will not reject the requests
 *
 * @param {any} milliseconds
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

//----------------------
//Random No Generators |
//----------------------

/**
 * Random number generator to generate an integer in the range of (min, max)
 *
 * @param {any} min
 * @param {any} max
 */
function random(min, max) {
    return Math.floor(min + Math.random() * (max - min));   //Math.floor(Math.random() * 100)
}

/**
 * Weighted random number generator to generate an integer according to certain weightage.
 * prerequisite: a list object must be supplied e.g. { 4: 0.45, 5: 0.2, 6: 0.15, 7: 0.15, 8: 0.025, 9: 0.025 }
 *
 * @param {any} list
 */
function weightedRandom(list) {
    let i, sum = 0, r = Math.random();
    for (i in list) {
        sum += list[i];
        if (r <= sum) return i;
    }
}

//---------------------------------------
// Simulation Param Functions (OnClick) |
//---------------------------------------
//Function to generate sample space, i.e. no of personnel for the simulation (called by OnClick event)
//
function generateSamples() {
    //For every ageGroup, determine the required subsamples that is proportionate to the population
    document.getElementById('Update').innerHTML += "<br>-------------------------------------------------------";

    for (var index = 0; index < ageGroup.length; index++) {
        var subsamplesize = multiplier * ageGroup[index]['percentage'];
        var previous = personnel.length;

        //generate the sub samples
        for (var j = 0; j <= subsamplesize; j++) {
            var myAge = random(ageGroup[index]['min'], ageGroup[index]['max']);  //make sure the generated age is in range

            //determine the lifestyle wrt age - work/study/retiree etc
            var lcode = Generatelifestyle(index); //lifestyle code
            //console.log("lcode=" + lcode);
            var days = random(lifestyleParam[lcode]['min_days'], lifestyleParam[lcode]['max_days']);
            var points = random(lifestyleParam[lcode]['min_pts'], lifestyleParam[lcode]['max_pts']);
            var distance = random(lifestyleParam[lcode]['min_distance'], lifestyleParam[lcode]['max_distance']);
            var start = random(parseInt(dateBegin), parseInt(dateEnd) - days);  //start=  (datebegin .. dateEnd-days)
            var end = random(start, start + days);                              //end=    start + days 

            //if points = 0 or 1, there is no distance to calculate!
            distance = (points > 1) ? distance : 0;

            //push the data to personnel. 
            //age, date, points, travel_distance -->  will be used to simulate the (lat, lon) points in the second stage
            personnel.push([myAge, lcode, start, end, points, distance]);
        }
        document.getElementById('Update').innerHTML += "<br>Unique " + ageGroup[index]['role'] + " personnels = " + (personnel.length - previous);
    }
    document.getElementById('Update').innerHTML += "<br>-------------------------------------------------------";
    document.getElementById('Update').innerHTML += "<br>Total personnels generated = " + (personnel.length) + "<br>";
    document.getElementById("Samples").disabled = true;   //samples created
    document.getElementById("Simulate").disabled = false;   //only enable once samples are created
    document.getElementById("Download").disabled = true;   //only enable once simulation is finished.

}

/**
 * Helper function to generate lifestyle code according to age group and weighted percentages (if any)
 * Lifestyle attribute is determined by ageGroupIndex
 *
 * @param {any} ageGroupIndex
 */
function Generatelifestyle(ageGroupIndex) {
    var lcode = 0;
    switch (ageGroupIndex) {
        case 0: lcode = 0; break; //children - no fraction
        case 1: lcode = 1; break; //primary - no fraction
        case 2: lcode = 2; break; //secondary - no fraction
        case 3: lcode = 3; break; //uni/college - no fraction
        case 4:
            //working people - with weighted subcategories, so we construct the weighted list
            var list = {};   //object
            for (var x = 4; x <= 9; x++) {
                list[x] = lifestyleParam[x]['fraction'];
            }
            lcode = weightedRandom(list);
            //console.log("wieghted random=" + lcode); //check value is within 4 - 9
            //Steve: for Python, there is a method called random.choices() but for javascript, you have to write your own function.
            break;
        case 5: lcode = 10; break; //retiree  - no fraction
        default: lcode = 0; //none of the above. children or babies?
    }
    return lcode; //lifestyle index
}


//--------------------------------------
// Interactive Functions (OnClick) *** |
//--------------------------------------

// Main Simulation function (called by onClick event)
//
async function startSimulation() {
    document.getElementById('Update').innerHTML += "-------------------------------------------------------<br/>";
    document.getElementById('Update').innerHTML += "Simulation Starts....</br>";
    //myAge, start, end, points, distance
    for (var y = 0; y < personnel.length; y++) {
        state = mapID;   //default

        document.getElementById('Update').innerHTML += "<br><br>(No " + (y + 1) + ". " + lifestyleParam[personnel[y][1]]['category'] + " age=" + personnel[y][0] + " ," +
            personnel[y][2] + "," + personnel[y][3] + ", waypt=" + personnel[y][4] + ", dist=" + personnel[y][5] + " m " + ((personnel[y][5] <= 1) ? "(static))" : " )");
        //var age = personnel[y][0];
        var lcode = personnel[y][1];
        //var category = lifestyleParam[lcode]['category'];
        var startdate = parseInt(personnel[y][2]);
        var enddate = parseInt(personnel[y][3]);
        var waypoints = personnel[y][4];
        var traveldistance = personnel[y][5];

        //note: 
        // For lcode 1=primary, 2=secondary, 3 = uni/college, destination is the respective school. origin = school + traveldistance ( i.e. work backwards)
        // For other lcode, origin = random, destination = origin + traveldistance
        switch (lcode) {
            case 1:
                var starting_point = {};
                //generate school address   //primary -> code, school, state, district, postcode, lat1, lon1
                var selection = random(0, primary.length);      //choose a school (index) as destination
                var school = { lat: parseFloat(primary[selection][5]), lng: parseFloat(primary[selection][6]) };
                var gridId1 = searchPlace(parseFloat(primary[selection][5]), parseFloat(primary[selection][6]));   //grid id for school

                //keep repeating until we get a school within the Grid
                while (gridId1 < 0) {
                    selection = random(0, primary.length);      //choose a school (index) as destination
                    school = { lat: parseFloat(primary[selection][5]), lng: parseFloat(primary[selection][6]) };
                    gridId1 = searchPlace(parseFloat(primary[selection][5]), parseFloat(primary[selection][6]));   //grid id for school
                    await sleep(600);
                }
                //generate home address
                var results = generateMapPoints(school, traveldistance, 1);  //generates distance from home to school (~ traveldistance)
                var lats = parseFloat(results[0].latitude);
                var lons = parseFloat(results[0].longitude2);
                var hdist = parseFloat(results[0].distance2);
                var home = { lat: lats, lng: lons };
                var gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

                //keep repeating until we get a home address within the Grid
                while (gridId2 < 0) {
                    results = generateMapPoints(school, traveldistance, 1);  //generates distance from home to school (~ traveldistance)
                    lats = parseFloat(results[0].latitude);
                    lons = parseFloat(results[0].longitude2);
                    hdist = parseFloat(results[0].distance2);
                    home = { lat: lats, lng: lons };
                    gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home
                    await sleep(600);
                }

                // daily loop --> fix home and school, vary the rest.
                for (var a = startdate; a <= enddate; a++) {
                    state = mapID;   //default
                    var distance = traveldistance - hdist;                      //remaining distance
                    // show home address
                    document.getElementById('Update').innerHTML += "<br>[" + a + "] home address (" + home.lat + "," + home.lng + ") at grid (" +
                        placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][a - startdate + 4] + " active cases ";

                    //push home
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    var cases = placesAll[gridId2][a - startdate + 4];
                    var t_cases = placesAll[gridId2][35];
                    var r0s = stateR0(subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:"), a);
                    simulation.push([who, state, a, home.lat, home.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    //--------------------------------------------------------------------------------------------------------

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        break;
                    }

                    //push school address
                    document.getElementById('Update').innerHTML += "<br> _________ school address (" + school.lat + "," + school.lng + ") @ " + primary[selection][1];
                    //push school
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    var cases = placesAll[gridId1][a - startdate + 4];
                    var t_cases = placesAll[gridId1][35];
                    var r0s = stateR0(subtringBetween(placesAll[gridId1][2], "Daerah: ", "<br>No:"), a);
                    simulation.push([who, state, a, school.lat, school.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    //--------------------------------------------------------------------------------------------------------

                    document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId1][0] + "," + placesAll[gridId1][1] + ") risk=" + placesAll[gridId1][a - startdate + 4] + " active cases ";
                    //distance between origin and destination
                    document.getElementById('Update').innerHTML += "<br> _________ home to school  =" + hdist + " m ";

                    // 2 waypoints and above 
                    starting_point = school;     //start from school

                    //loop
                    for (var b = 0; b < waypoints - 2; b++) {
                        state = mapID;   //default
                        var results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        var lats = parseFloat(results[0].latitude);
                        var lons = parseFloat(results[0].longitude2);
                        var cdist = parseFloat(results[0].distance2);
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        var gridId = searchPlace(lats, lons);
                        await sleep(600);

                        document.getElementById('Update').innerHTML += "<br>[" + a + "] school (" + school.lat + ", " + school.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";

                        if (gridId != -1) {
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                            // + " remaining distance=" + distance + " m";
                            //push coordinate
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            var cases = placesAll[gridId][a - startdate + 4];
                            var t_cases = placesAll[gridId][35];
                            var r0s = stateR0(subtringBetween(placesAll[gridId][2], "Daerah: ", "<br>No:"), a);
                            simulation.push([who, state, a, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            //--------------------------------------------------------------------------------------------------------
                        }
                        else {
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            var cases = "please cross-check";
                            var t_cases = "please cross-check";
                            var r0s = "r0";
                            simulation.push([who, state, a, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            //--------------------------------------------------------------------------------------------------------
                        }
                    }
                }
                break;
            case 2:
                var starting_point = {};
                //generate secondary school address   //secondary -> code, school, state, district, postcode, lat1, lon1
                var selection = random(0, secondary.length);      //choose a secondary school (index) as destination
                var school2 = { lat: parseFloat(secondary[selection][5]), lng: parseFloat(secondary[selection][6]) };
                var gridId1 = searchPlace(parseFloat(secondary[selection][5]), parseFloat(secondary[selection][6]));   //grid id for secondary school

                //keep repeating until we get a school within the Grid
                while (gridId1 < 0) {
                    selection = random(0, secondary.length);      //choose a secondary school (index) as destination
                    school2 = { lat: parseFloat(secondary[selection][5]), lng: parseFloat(secondary[selection][6]) };
                    gridId1 = searchPlace(parseFloat(secondary[selection][5]), parseFloat(secondary[selection][6]));   //grid id for secondary school
                    await sleep(600);
                }

                //generate home address
                var results = generateMapPoints(school2, traveldistance, 1);  //generates distance from home to secondary school (~ traveldistance)
                var lats = parseFloat(results[0].latitude);
                var lons = parseFloat(results[0].longitude2);
                var hdist = parseFloat(results[0].distance2);
                var home = { lat: lats, lng: lons };
                var gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

                //keep repeating until we get a home address within the Grid
                while (gridId2 < 0) {
                    results = generateMapPoints(school2, traveldistance, 1);  //generates distance from home to secondary school (~ traveldistance)
                    lats = parseFloat(results[0].latitude);
                    lons = parseFloat(results[0].longitude2);
                    hdist = parseFloat(results[0].distance2);
                    home = { lat: lats, lng: lons };
                    gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home
                    await sleep(600);
                }

                // daily loop --> fix home and secondary school, vary the rest.
                for (var a = startdate; a <= enddate; a++) {
                    state = mapID;   //default
                    var distance = traveldistance - hdist;                      //remaining distance

                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a + "] home address (" + home.lat + "," + home.lng + ") at grid (" +
                        placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][a - startdate + 4] + " active cases ";

                    //push home
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    var cases = placesAll[gridId2][a - startdate + 4];
                    var t_cases = placesAll[gridId2][35];
                    var r0s = stateR0(subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:"), a);
                    simulation.push([who, state, a, home.lat, home.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    //--------------------------------------------------------------------------------------------------------

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        break;
                    }

                    //push secondary school address
                    document.getElementById('Update').innerHTML += "<br> _________ secondary school address (" + school2.lat + "," + school2.lng + ") @ " + secondary[selection][1];
                    //push school
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    var cases = placesAll[gridId1][a - startdate + 4];
                    var t_cases = placesAll[gridId1][35];
                    var r0s = stateR0(subtringBetween(placesAll[gridId1][2], "Daerah: ", "<br>No:"), a);
                    simulation.push([who, state, a, school2.lat, school2.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    //--------------------------------------------------------------------------------------------------------

                    document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId1][0] + "," + placesAll[gridId1][1] + ") risk=" + placesAll[gridId1][a - startdate + 4] + " active cases ";
                    //distance between origin and destination
                    document.getElementById('Update').innerHTML += "<br> _________ home to secondary school  =" + hdist + " m ";

                    // 2 waypoints and above 
                    starting_point = school2;     //start from school
                    for (var b = 0; b < waypoints - 2; b++) {
                        state = mapID;   //default
                        var results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        var lats = parseFloat(results[0].latitude);
                        var lons = parseFloat(results[0].longitude2);
                        var cdist = parseFloat(results[0].distance2);
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        var gridId = searchPlace(lats, lons);
                        await sleep(600);

                        document.getElementById('Update').innerHTML += "<br>[" + a + "] secondary school (" + school2.lat + ", " + school2.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";

                        if (gridId != -1) {
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                            // + " remaining distance=" + distance + " m";
                            //push coordinate
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            var cases = placesAll[gridId][a - startdate + 4];
                            var t_cases = placesAll[gridId][35];
                            var r0s = stateR0(subtringBetween(placesAll[gridId][2], "Daerah: ", "<br>No:"), a);
                            simulation.push([who, state, a, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            //--------------------------------------------------------------------------------------------------------
                        }
                        else {
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            var cases = "please cross-check";
                            var t_cases = "please cross-check";
                            var r0s = "r0";
                            simulation.push([who, state, a, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            //--------------------------------------------------------------------------------------------------------
                        }
                    }
                }
                break;
            case 3:
                var starting_point = {};
                //Uni/College -> No,Name,State,Code,Lat,Lon
                var selection = random(0, unicollege.length);      //choose a uni/college (index) as destination
                var uni = { lat: parseFloat(unicollege[selection][4]), lng: parseFloat(unicollege[selection][5]) };
                var gridId1 = searchPlace(parseFloat(unicollege[selection][4]), parseFloat(unicollege[selection][5]));   //grid id for uni

                //keep repeating until we get a school within the Grid
                while (gridId1 < 0) {
                    selection = random(0, unicollege.length);      //choose a uni/college (index) as destination
                    uni = { lat: parseFloat(unicollege[selection][4]), lng: parseFloat(unicollege[selection][5]) };
                    gridId1 = searchPlace(parseFloat(unicollege[selection][4]), parseFloat(unicollege[selection][5]));   //grid id for uni
                    await sleep(600);
                }

                //generate home address
                var results = generateMapPoints(uni, traveldistance, 1);  //generates distance from home to uni (~ traveldistance)
                var lats = parseFloat(results[0].latitude);
                var lons = parseFloat(results[0].longitude2);
                var hdist = parseFloat(results[0].distance2);
                var home = { lat: lats, lng: lons };
                var gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

                //keep repeating until we get a home address within the Grid
                while (gridId2 < 0) {
                    results = generateMapPoints(uni, traveldistance, 1);  //generates distance from home to uni (~ traveldistance)
                    lats = parseFloat(results[0].latitude);
                    lons = parseFloat(results[0].longitude2);
                    hdist = parseFloat(results[0].distance2);
                    home = { lat: lats, lng: lons };
                    gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home
                    await sleep(600);
                }

                // daily loop --> fix home and uni, vary the rest.
                for (var a = startdate; a <= enddate; a++) {
                    state = mapID;   //default
                    var distance = traveldistance - hdist;                      //remaining distance

                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a + "] home address (" + home.lat + "," + home.lng + ") at grid (" +
                        placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][a - startdate + 4] + " active cases ";

                    //push home
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    var cases = placesAll[gridId2][a - startdate + 4];
                    var t_cases = placesAll[gridId2][35];
                    var r0s = stateR0(subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:"), a);
                    simulation.push([who, state, a, home.lat, home.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    //--------------------------------------------------------------------------------------------------------

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        break;
                    }
                    //push uni address
                    document.getElementById('Update').innerHTML += "<br> _________ uni/college address (" + uni.lat + "," + uni.lng + ") @ " + unicollege[selection][1];
                    //push uni 
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    var cases = placesAll[gridId1][a - startdate + 4];
                    var t_cases = placesAll[gridId1][35];
                    var r0s = stateR0(subtringBetween(placesAll[gridId1][2], "Daerah: ", "<br>No:"), a);
                    simulation.push([who, state, a, school2.lat, school2.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    //--------------------------------------------------------------------------------------------------------


                    document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][a - startdate + 4] + " active cases ";
                    //distance between origin and destination
                    document.getElementById('Update').innerHTML += "<br> _________ home to uni/college  =" + hdist + " m ";

                    // 2 waypoints and above 
                    starting_point = uni;     //start from uni/college
                    for (var b = 0; b < waypoints - 2; b++) {
                        state = mapID;   //default
                        var results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        var lats = parseFloat(results[0].latitude);
                        var lons = parseFloat(results[0].longitude2);
                        var cdist = parseFloat(results[0].distance2);
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        var gridId = searchPlace(lats, lons);
                        await sleep(600);

                        document.getElementById('Update').innerHTML += "<br>[" + a + "] uni/college (" + uni.lat + ", " + uni.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";

                        if (gridId != -1) {
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                            // + " remaining distance=" + distance + " m";
                            //push coordinate
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            var cases = placesAll[gridId][a - startdate + 4];
                            var t_cases = placesAll[gridId][35];
                            var r0s = stateR0(subtringBetween(placesAll[gridId][2], "Daerah: ", "<br>No:"), a);
                            simulation.push([who, state, a, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            //--------------------------------------------------------------------------------------------------------
                        }
                        else {
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            var cases = "please cross-check";
                            var t_cases = "please cross-check";
                            var r0s = "r0";
                            simulation.push([who, state, a, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            //--------------------------------------------------------------------------------------------------------
                        }
                    }
                }
                break;
            default:
                //generate home address = centerpoint
                //places -> lat,lon,label,placename,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,total
                var Id = random(0, places.length);      //choose a grid (index) as home
                var lats = places[Id][0];
                var lons = places[Id][1];
                var offset_lat = lats + random(0, delta_lat * 1000000) / 1000000;
                var offset_lon = lons + random(0, delta_lon * 1000000) / 1000000;
                var home = { lat: offset_lat, lng: offset_lon };
                var starting_point = home;                //start from home
                var gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

                //keep repeating until we get a home address within the Grid
                while (gridId2 < 0) {
                    Id = random(0, places.length);      //choose a grid (index) as home
                    lats = places[Id][0];
                    lons = places[Id][1];
                    offset_lat = lats + random(0, delta_lat * 1000000) / 1000000;
                    offset_lon = lons + random(0, delta_lon * 1000000) / 1000000;
                    home = { lat: offset_lat, lng: offset_lon };
                    starting_point = home;                //start from home
                    gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home
                    await sleep(600);
                }

                // daily loop --> fix home, vary the rest.
                for (var a = startdate; a <= enddate; a++) {
                    state = mapID;   //default
                    var distance = traveldistance;            //init with total distance

                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a + "] home address (" + home.lat + "," + home.lng + ") ";
                    document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][a - startdate + 4] + " active cases ";

                    //push home
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    var cases = placesAll[gridId2][a - startdate + 4];
                    var t_cases = placesAll[gridId2][35];
                    var r0s = stateR0(subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:"), a);
                    simulation.push([who, state, a, home.lat, home.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    //--------------------------------------------------------------------------------------------------------

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        break;
                    }

                    //
                    var gridId = 0;

                    // 2 waypoints and above 
                    for (var b = 0; b < waypoints - 1; b++) {
                        state = mapID;   //default
                        var results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        var lats = parseFloat(results[0].latitude);
                        var lons = parseFloat(results[0].longitude2);
                        var cdist = parseFloat(results[0].distance2);
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        gridId = searchPlace(lats, lons)
                        await sleep(600);

                        document.getElementById('Update').innerHTML += "<br>[" + a + "] home (" + home.lat + ", " + home.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";

                        if (gridId != -1) {
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                            // + " remaining distance=" + distance + " m";
                            //push coordinate
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            var cases = placesAll[gridId][a - startdate + 4];
                            var t_cases = placesAll[gridId][35];
                            var r0s = stateR0(subtringBetween(placesAll[gridId][2], "Daerah: ", "<br>No:"), a);
                            simulation.push([who, state, a, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            //--------------------------------------------------------------------------------------------------------
                        }
                        else {
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            var who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            var cases = "please cross-check";
                            var t_cases = "please cross-check";
                            var r0s = "r0";
                            simulation.push([who, state, a, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            //--------------------------------------------------------------------------------------------------------
                        }
                    }
                }

        }
    }
    document.getElementById('Update').innerHTML += "<br/><br/> Simulation Ends";
    document.getElementById("Samples").disabled = true;   //samples created
    document.getElementById("Simulate").disabled = true;   //Simulation done
    document.getElementById("Download").disabled = false;   //only enable once simulation is finished.
}


//------------------------
//Data loader functions  |
//------------------------

/**
 * Loads the summarized (filtered) list of the state's cases to 'places' array
 * 
 * @param {any} sourceFile
 */
async function LoadStateCasesSummary(sourceFile) {
    let myPromise = new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", sourceFile);   //.csv file
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var thisGrid = this.responseText;  //return object
                const data = csvToArray(thisGrid, ',');
                data.forEach(function (item, index) {
                    var lt1 = parseFloat(data[index]['lat']);
                    var ln1 = parseFloat(data[index]['lon']);
                    var label1 = data[index]['label'];
                    var locationname = data[index]['placename'];
                    var d01 = parseInt(data[index][dateBegin]); var d02 = parseInt(data[index][(parseInt(dateBegin) + 1).toString()]);
                    var d03 = parseInt(data[index][(parseInt(dateBegin) + 2).toString()]); var d04 = parseInt(data[index][(parseInt(dateBegin) + 3).toString()]);
                    var d05 = parseInt(data[index][(parseInt(dateBegin) + 4).toString()]); var d06 = parseInt(data[index][(parseInt(dateBegin) + 5).toString()]);
                    var d07 = parseInt(data[index][(parseInt(dateBegin) + 6).toString()]); var d08 = parseInt(data[index][(parseInt(dateBegin) + 7).toString()]);
                    var d09 = parseInt(data[index][(parseInt(dateBegin) + 8).toString()]); var d10 = parseInt(data[index][(parseInt(dateBegin) + 9).toString()]);
                    var d11 = parseInt(data[index][(parseInt(dateBegin) + 10).toString()]); var d12 = parseInt(data[index][(parseInt(dateBegin) + 11).toString()]);
                    var d13 = parseInt(data[index][(parseInt(dateBegin) + 12).toString()]); var d14 = parseInt(data[index][(parseInt(dateBegin) + 13).toString()]);
                    var d15 = parseInt(data[index][(parseInt(dateBegin) + 14).toString()]); var d16 = parseInt(data[index][(parseInt(dateBegin) + 15).toString()]);
                    var d17 = parseInt(data[index][(parseInt(dateBegin) + 16).toString()]); var d18 = parseInt(data[index][(parseInt(dateBegin) + 17).toString()]);
                    var d19 = parseInt(data[index][(parseInt(dateBegin) + 18).toString()]); var d20 = parseInt(data[index][(parseInt(dateBegin) + 19).toString()]);
                    var d21 = parseInt(data[index][(parseInt(dateBegin) + 20).toString()]); var d22 = parseInt(data[index][(parseInt(dateBegin) + 21).toString()]);
                    var d23 = parseInt(data[index][(parseInt(dateBegin) + 22).toString()]); var d24 = parseInt(data[index][(parseInt(dateBegin) + 23).toString()]);
                    var d25 = parseInt(data[index][(parseInt(dateBegin) + 24).toString()]); var d26 = parseInt(data[index][(parseInt(dateBegin) + 25).toString()]);
                    var d27 = parseInt(data[index][(parseInt(dateBegin) + 26).toString()]); var d28 = parseInt(data[index][(parseInt(dateBegin) + 27).toString()]);
                    var d29 = parseInt(data[index][(parseInt(dateBegin) + 28).toString()]); var d30 = parseInt(data[index][(parseInt(dateBegin) + 29).toString()]);
                    var d31 = parseInt(data[index][(parseInt(dateBegin) + 30).toString()]);
                    var ttl = parseInt(data[index]['total']);

                    //drop the last row if it contains NaN. We only take the grids that are at some time active (inhabited)
                    if (!isNaN(lt1) && (ttl > 0)) {
                        //lat,lon,label,placename,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,total
                        places.push([lt1, ln1, label1, locationname, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16,
                            d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31, ttl]);
                        //console.log(lt1, ln1, label1, locationname, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16,
                        //    d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31, ttl);
                    }
                });
                //console.log("response resolved.");
                resolve(this.responseText);
            }
        };
        xhr.send();
    });
    await myPromise.then(() => {
        document.getElementById('Update').innerHTML += "(Async) Daily Summary loaded = " + places.length + " records.<br/>";
        //report the upload status to the html page
    });
}

/**
 * Function to load all state's cases without filtering to 'placesAll' array.
 * 
 * @param {any} sourceFile
 */
async function LoadStateCasesFull(sourceFile) {
    let myPromise = new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", sourceFile);   //.csv file
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var thisGrid = this.responseText;  //return object
                const data = csvToArray(thisGrid, ',');
                data.forEach(function (item, index) {
                    var lt1 = parseFloat(data[index]['lat']);
                    var ln1 = parseFloat(data[index]['lon']);
                    var label1 = data[index]['label'];
                    var locationname = data[index]['placename'];
                    var d01 = parseInt(data[index][dateBegin]); var d02 = parseInt(data[index][(parseInt(dateBegin) + 1).toString()]);
                    var d03 = parseInt(data[index][(parseInt(dateBegin) + 2).toString()]); var d04 = parseInt(data[index][(parseInt(dateBegin) + 3).toString()]);
                    var d05 = parseInt(data[index][(parseInt(dateBegin) + 4).toString()]); var d06 = parseInt(data[index][(parseInt(dateBegin) + 5).toString()]);
                    var d07 = parseInt(data[index][(parseInt(dateBegin) + 6).toString()]); var d08 = parseInt(data[index][(parseInt(dateBegin) + 7).toString()]);
                    var d09 = parseInt(data[index][(parseInt(dateBegin) + 8).toString()]); var d10 = parseInt(data[index][(parseInt(dateBegin) + 9).toString()]);
                    var d11 = parseInt(data[index][(parseInt(dateBegin) + 10).toString()]); var d12 = parseInt(data[index][(parseInt(dateBegin) + 11).toString()]);
                    var d13 = parseInt(data[index][(parseInt(dateBegin) + 12).toString()]); var d14 = parseInt(data[index][(parseInt(dateBegin) + 13).toString()]);
                    var d15 = parseInt(data[index][(parseInt(dateBegin) + 14).toString()]); var d16 = parseInt(data[index][(parseInt(dateBegin) + 15).toString()]);
                    var d17 = parseInt(data[index][(parseInt(dateBegin) + 16).toString()]); var d18 = parseInt(data[index][(parseInt(dateBegin) + 17).toString()]);
                    var d19 = parseInt(data[index][(parseInt(dateBegin) + 18).toString()]); var d20 = parseInt(data[index][(parseInt(dateBegin) + 19).toString()]);
                    var d21 = parseInt(data[index][(parseInt(dateBegin) + 20).toString()]); var d22 = parseInt(data[index][(parseInt(dateBegin) + 21).toString()]);
                    var d23 = parseInt(data[index][(parseInt(dateBegin) + 22).toString()]); var d24 = parseInt(data[index][(parseInt(dateBegin) + 23).toString()]);
                    var d25 = parseInt(data[index][(parseInt(dateBegin) + 24).toString()]); var d26 = parseInt(data[index][(parseInt(dateBegin) + 25).toString()]);
                    var d27 = parseInt(data[index][(parseInt(dateBegin) + 26).toString()]); var d28 = parseInt(data[index][(parseInt(dateBegin) + 27).toString()]);
                    var d29 = parseInt(data[index][(parseInt(dateBegin) + 28).toString()]); var d30 = parseInt(data[index][(parseInt(dateBegin) + 29).toString()]);
                    var d31 = parseInt(data[index][(parseInt(dateBegin) + 30).toString()]);
                    var ttl = parseInt(data[index]['total']);

                    //drop the last row if it contains NaN. 
                    if (!isNaN(lt1)) {
                        //lat,lon,label,placename,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,total
                        //console.log(lt1, ln1, label1, locationname, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16,
                        //    d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31, ttl);
                        placesAll.push([lt1, ln1, label1, locationname, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16,
                            d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31, ttl]);
                    }
                });
                //console.log("response resolved.");
                resolve(this.responseText);
            }
        };
        xhr.send();
    });
    await myPromise.then(() => {
        document.getElementById('Update').innerHTML += "(Async) Daily Records loaded = " + placesAll.length + " records.<br/>";
        //report the upload status to the html page
    });
}

/**
 * Function to load a school's location data to the respective 'container' array
 * 
 * @param {any} statecode 
 * @param {any} level
 * @param {any} container  the array to store the data
 * @param {any} sourceFile
 */
async function LoadSchool(statecode, level, container, sourceFile) {
    let myPromise = new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", sourceFile);   //.csv file
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var thisGrid = this.responseText;  //return object
                const data = csvToArray(thisGrid, ',');

                //code,	school,	state, district, postcode, lat, lon, ....
                data.forEach(function (item, index) {
                    var code = data[index]['code'];
                    var levelcode = code.substring(1, 2);     //2nd character in this field denotes the level
                    var school = data[index]['school'];
                    var state = parseInt(data[index]['state']);
                    var district = parseInt(data[index]['district']);
                    var postcode = data[index]['postcode'];
                    var lat1 = parseFloat(data[index]['lat']);
                    var lon1 = parseFloat(data[index]['lon']);
                    var lvl = 0;

                    switch (levelcode) {
                        case 'B': lvl = 1; break;
                        case 'C': lvl = 1; break;
                        case 'E': lvl = 2; break;
                        case 'F': lvl = 2; break;
                        case 'R': lvl = 2; break;
                        case 'H': lvl = 3; break;
                        case 'K': lvl = 3; break;
                        default: lvl = 0; break;
                    }
                    //drop the last row if it contains NaN (not required):   !isNaN(code) 

                    if ((state == statecode) && (level == lvl)) {
                        //console.log(code, school, state, district, postcode, lat1, lon1);
                        container.push([code, school, state, district, postcode, lat1, lon1]);
                    }
                });
                //console.log("response resolved.");
                resolve(this.responseText);
            }
        };
        xhr.send();
    });
    await myPromise.then(() => {
        document.getElementById('Update').innerHTML += "(Async) State ID: " + statecode + ((level >= 2) ? ", Secondary (level " : ", Primary (level ") + level + ") schools loaded. Total = " + container.length + " records now.<br/>";
        //report the upload status to the html page
    });
}

/**
* Function to load a uni/college's location data to the respective 'container' array
  *
 * @param {any} statecode
 * @param {any} container
 * @param {any} sourceFile
 */
async function LoadUniCollege(statecode, container, sourceFile) {
    let myPromise = new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", sourceFile);   //.csv file
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var thisGrid = this.responseText;  //return object
                const data = csvToArray(thisGrid, ',');

                //Uni/College -> No,Name,State,Code,Lat,Lon
                data.forEach(function (item, index) {
                    var no = parseInt(data[index]['No']);
                    var schoolname = data[index]['Name'];
                    var statename = data[index]['State'];
                    var state = parseInt(data[index]['Code']);
                    var lat1 = parseFloat(data[index]['Lat']);
                    var lon1 = parseFloat(data[index]['Lon']);

                    //drop the last row if it contains NaN (not required):   !isNaN(code) 

                    if ((state == statecode)) {
                        //console.log(no, schoolname, statename, state, lat1, lon1);
                        container.push([no, schoolname, statename, state, lat1, lon1]);
                    }
                });
                //console.log("response resolved.");
                resolve(this.responseText);
            }
        };
        xhr.send();
    });
    await myPromise.then(() => {
        document.getElementById('Update').innerHTML += "(Async) State ID: " + statecode + ", Uni/College loaded. Total " + container.length + " records now.<br/>";
    });
}

//--------------------------------
//Location Computation Functions |
//--------------------------------

/**
 * Generate a number of mappoints
 * Refer: https://stackoverflow.com/questions/31192451/generate-random-geo-coordinates-within-specific-radius-from-seed-point
 *
 * @param {any} centerpoint
 * @param {any} distance
 * @param {any} amount
 */
function generateMapPoints(centerpoint, distance, amount) {
    var mappoints = [];
    for (var i = 0; i < amount; i++) {
        mappoints.push(randomGeo(centerpoint, distance));
    }
    return mappoints;
}

/**
 * Create random lat/long coordinates in a specified radius around a center point
 * Refer: https://stackoverflow.com/questions/31192451/generate-random-geo-coordinates-within-specific-radius-from-seed-point
 *
 * @param {any} center
 * @param {any} radius
 */
function randomGeo(center, radius) {
    //console.log("center=", center, "radius=", radius);
    var y0 = center.lat;
    var x0 = center.lng;
    var rd = radius / 111300; //about 111300 meters in one degree

    var u = Math.random();
    var v = Math.random();

    var w = rd * Math.sqrt(u);
    var t = 2 * Math.PI * v;
    var x = w * Math.cos(t);
    var y = w * Math.sin(t);

    //Adjust the x-coordinate for the shrinking of the east-west distances
    var xp = x / Math.cos(y0);

    var newlat = y + y0;
    var newlon = x + x0;
    var newlon2 = xp + x0;

    return {
        'latitude': newlat.toFixed(5),
        'longitude': newlon.toFixed(5),
        'longitude2': newlon2.toFixed(5),
        'distance': distance(center.lat, center.lng, newlat, newlon).toFixed(2),
        'distance2': distance(center.lat, center.lng, newlat, newlon2).toFixed(2),
        'haversine_distance': haversine_distance(center.lat, center.lng, newlat, newlon).toFixed(2),      //haversine distance (experimental) 
        'haversine_distance2': haversine_distance(center.lat, center.lng, newlat, newlon2).toFixed(2),    //haversine distance (experimental) 
    };
}

/**
 * Calc the distance between 2 coordinates as the crow flies
 * Refer: https://stackoverflow.com/questions/31192451/generate-random-geo-coordinates-within-specific-radius-from-seed-point
 *
 * @param {any} lat1
 * @param {any} lon1
 * @param {any} lat2
 * @param {any} lon2
 */
function distance(lat1, lon1, lat2, lon2) {
    var R = 6371000; //radius of earth in km
    var a = 0.5 - Math.cos((lat2 - lat1) * Math.PI / 180) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos((lon2 - lon1) * Math.PI / 180)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

/**
 * Haversine formula - to calculate the distance of two points (lat1,lon1) and (lat2, lon2) in radian. 
 * Steve says: This is a straight point to point distance, and not the route distance on the map!
 * 
 * @param {any} lat1
 * @param {any} lon1
 * @param {any} lat2
 * @param {any} lon2
 */
function haversine_distance(lat1, lon1, lat2, lon2) {
    const r = 6371000;                //radius of earth in km 
    const pi = 3.14159265359;         //pi
    var delta_lat = lat1 - lat2;
    var delta_lon = lon1 - lon2;
    var a = Math.sin(delta_lat * pi / 180) * Math.sin(delta_lat * pi / 180) + Math.cos(lat1 * pi / 180) * Math.cos(lat2 * pi / 180) *
        Math.sin(delta_lon * pi / 180) * Math.sin(delta_lon * pi / 180);
    var c = 2 * Math.atan(Math.sqrt(a), Math.sqrt(1 - a)) * Math.atan(Math.sqrt(a), Math.sqrt(1 - a));

    return r * c;  //Steve says: the output is in meters.
}

//----------------------------------------
//File and string manipulation Functions |
//----------------------------------------

// Function to save the simulation data on "simulation" array to an external file via download (called via OnClick function)
//
function saveFile() {
    //export CSV file
    //Who,Date,State,Lon,Lat,i_No_cases,t_R0,t_cases,t_vac_type,t_Vac,t_SOPcomp,DR,TDR
    var header = "who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp,DR,TDR";
    exportToCsvFile(header, simulation, filename + "_" + dateBegin + "_" + dateEnd + "_simulation");
    window.alert("After downloading the results, you can stay in this page to cross check the results. To start a new simulation, press F5 to refresh the browser.");
}

/**
 *  Export data to CSV using download dialog 
 * 
 * @param {any} header
 * @param {any} sourcedata
 * @param {any} filename
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
    download(url, filename + '.csv');
    // Release the object URL
    URL.revokeObjectURL(url);
}

/**
 * Helper Function for downloading CSV
 *
 * @param {any} path
 * @param {any} filename
 */
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
 * Quick and Dirty csv to array function, not ecma compliant. You may want to use better ones available
 *
 * @param {any} str
 * @param {any} delimiter
 */
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

/**
 * Finds the 'string' in between two input strings from a word
 * 
 * @param {any} word
 * @param {any} beginning
 * @param {any} ending
 */
function subtringBetween(word, beginning, ending) {
    var mySubString = word.substring(
        word.indexOf(beginning) + 1,
        word.lastIndexOf(ending));
    return mySubString;

}


//-------------------------------------------------------------------------------------------------------------
//  PUBLIC
//------------------------------
//let statename = "selangor";
//let myStates = [];   //for loading the state lists
//let myStateGrid;     //for loading sampled places of the state
//------------------------------
//
//--------------------------------
//   Unused Functions            |
//--------------------------------

/**
 * Function to get the state index 
 * 
 * @param {any} stateName
 */
function getStateIndex(stateName) {
    for (let i = 1; i < myStates.length; i++) {
        //console.log(stateName + ": compared to -->" + myStates[i][0]);
        if (myStates[i][0].toUpperCase() == stateName.toUpperCase())
            return myStates[i][1];
    };
    return -1;
}

/**
 * Function to get the state folder name 
 * Use by: loadStates
 * @param {any} stateName
 */
function getStateGridFoldername(stateName) {
    for (let i = 1; i < myStates.length; i++) {
        //console.log(stateName + ": compared to -->" + myStates[i][0]);
        if (myStates[i][0].toUpperCase() == stateName.toUpperCase())
            return myStates[i][3];
    };
    return -1;
}

/**
 * Function to get the state filename 
 * Use by: loadStates
 * @param {any} stateName
 */
function getStateGridFilename(stateName) {
    //unused
    for (let i = 1; i < myStates.length; i++) {
        //console.log(stateName + ": compared to -->" + myStates[i][0]);
        if (myStates[i][0].toUpperCase() == stateName.toUpperCase())
            return myStates[i][2];
    };
    return -1;
}

/**
 * Loads the list of states asynchronously into myStates array
 * 
 * @param {string} sourceFile
 * e.g. loadStates(baseaddress + "/json/states.json");   //can be on localhost or actual site
 */

async function loadStates(sourceFile) {
    //unused
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            myStates = JSON.parse(this.responseText);
            //console.log("states:" + myStates);        //debug
            //console.log("State:" + state + " index:" + getStateIndex(state));
            var filename = getStateGridFilename(statename);
            var foldername = getStateGridFoldername(statename);
        }
    };
    xhr.open("GET", sourceFile);   //.json file
    xhr.send();
}

//---------------------------------------------------
//summary.js
//
async function fillPlaces(sourceFile) {
    let myPromise = new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", sourceFile);   //.csv file
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                myStateGrid = this.responseText;  //return object
                //console.log("StateGrids :" + myStateGrid);        //debug
                const data = csvToArray(myStateGrid, ',');
                //console.log(data);                                //debug
                data.forEach(function (item, index) {
                    lt1 = parseFloat(data[index]['lat']);
                    ln1 = parseFloat(data[index]['lon']);
                    pos = { lat: lt1, lng: ln1 };
                    var locationname = data[index]['placename'];
                    var label1 = data[index]['label'];

                    //console.log(lt1, ln1, label1, locationname, weeklyactive, totalactive, weeklyrecovered, totalrecovered, weeklydeaths, totaldeaths, weightage, timestamp);
                    places.push([lt1, ln1, label1, locationname, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
                });
                //console.log("response resolved.");
                resolve(this.responseText);
            }
        };
        xhr.send();
    });
    await myPromise.then(() => {
        //console.log("promise done ");
        for (var i = dateBegin; i <= dateEnd; i++) {
            console.log("getting " + baseaddress + "/data/" + foldername + "/" + i + "_" + filename + ".csv")
            ReadData(i, baseaddress + "/data/" + foldername + "/" + i + "_" + filename + ".csv");
        }
        document.getElementById("Download").addEventListener("click", saveFile);
    });
}

//---------------------------------------------------
//unused
async function ReadData(date, sourceFile) {
    let myPromise = new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", sourceFile);   //.csv file
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var thisGrid = this.responseText;  //return object
                //console.log("thisGrid :" + thisGrid);        //debug
                const data = csvToArray(thisGrid, ',');
                //console.log(data);                           //debug
                data.forEach(function (item, index) {
                    lt1 = parseFloat(data[index]['lat']);
                    ln1 = parseFloat(data[index]['lon']);
                    pos = { lat: lt1, lng: ln1 };
                    //var locationname = data[index]['placename'];  
                    //var label1 = data[index]['label'];
                    var weeklyactive = parseInt(data[index]['weeklyactive']);
                    var column = date - dateBegin + 4;  // points to the column for daily cases
                    console.log(index + "," + column + "=" + weeklyactive);
                    //var timestamp = data[index]['timestamp'];
                    for (let index = 0; index < places.length; index++) {
                        if ((lt1 == places[index][0]) && (ln1 == places[index][1])) {
                            places[index][column] = weeklyactive;
                            break;
                        }
                    }
                    //console.log(lt1, ln1, label1, locationname, weeklyactive, totalactive, weeklyrecovered, totalrecovered, weeklydeaths, totaldeaths, weightage, timestamp);
                });
                //console.log("response resolved.");
                resolve(this.responseText);
            }
        };
        xhr.send();
    });
    await myPromise.then(() => {
        //for (var x = 0; x < places.length; x++)
        //document.getElementById('Update').innerText += places [x] + "<br />";
        document.getElementById('Update').innerText += places;
        //console.log("promise done ");
    });
}