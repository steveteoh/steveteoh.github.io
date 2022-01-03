/*
* By Steve Teoh v 1.3.1`.0 @ 2021/12/11 User Travel Location Generator
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
var iptsfilename = "ipts.csv";                                                                                                         //To do. not enough time to work as data entry clerk

var rnaughtfilename = "rNaught.csv";
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
//malaysia  rNaughtMY = [0.96, 0.95, 0.94, 0.94, 0.92, 0.91, 0.92, 0.94, 0.96, 0.99, 1.00, 1.04, 1.05, 1.05, 1.05, 1.04, 1.03, 1.02, 1.01, 1.01, 1.00, 1.00, 1.00, 0.99, 0.99, 0.97, 0.96, 0.96, 0.95, 0.95]; //Malaysia
//selangor  rNaughtSL = [0.98, 0.98, 1.00, 1.01, 0.99, 0.99, 0.99, 1.00, 1.01, 1.03, 1.03, 1.04, 1.04, 1.04, 1.04, 1.05, 1.06, 1.05, 1.07, 1.08, 1.07, 1.06, 1.05, 1.04, 1.04, 1.02, 1.01, 1.00, 0.99, 0.99]; //selangor
//KL        rNaughtKL = [1.01, 1.01, 1.01, 0.99, 0.96, 0.98, 1.00, 1.00, 1.02, 1.03, 1.04, 1.06, 1.05, 1.05, 1.04, 1.05, 1.09, 1.09, 1.09, 1.08, 1.06, 1.05, 1.05, 1.05, 1.06, 1.04, 1.02, 1.00, 1.00, 1.02]; //Kuala Lumpur
//Putrajaya rNaughtPJ = [1.06, 1.05, 1.07, 1.11, 1.06, 1.09, 1.03, 1.06, 1.07, 1.06, 1.16, 1.17, 1.20, 1.20, 1.17, 1.15, 1.12, 1.06, 1.12, 1.17, 1.13, 1.15, 1.13, 1.12, 1.04, 1.03, 1, 1.00, 0.99, 0.98]; //Putrajaya

//New RNaught Data file format
//location,code,year,month,d01,d02,d03,d04,d05,d06,d07,d08,d09,d10,d11,d12,d13,d14,d15,d16,d17,d18,d19,d20,d21,d22,d23,d24,d25,d26,d27,d28,d29,d30,d31
var rNaughtMY = []; //malaysia
var rNaughtSL = []; //selangor
var rNaughtKL = []; //KL      
var rNaughtPJ = []; //Putrajaya
var rNaughtSA = []; //sabah
var rNaughtPG = []; //penang
var rNaughtJH = []; //johor
var rNaughtKN = []; //kelantan
var rNaughtML = []; //melaka
var rNaughtLA = []; //Labuan
var rNaughtNS = []; //negerisembilan
var rNaughtKH = []; //kedah
var rNaughtPH = []; //pahang
var rNaughtPK = []; //perak
var rNaughtTE = []; //terengganu
var rNaughtSK = []; //sarawak
var rNaughtPL = []; //perlis

//Simulation parameter  - Sample Qty
var multiplier = 1;   //1=100samples, 10=1000samples, 100=10,000samples, 1000=100,000samples etc.

//Simulated personnel according to the age groups
var personnel = [];

//Final simulation results container
var simulation = [];

//containers for various types of students
var primary = [];
var secondary = [];
var unicollege = [];

//state maps with corresponding cases
//Note: Records loaded are filtered by (totalcases > 0) so that we remove non inhabited areas like forests etc.
var places = [];
var placesOutside = [];  //NEW
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
    { category: "PRIMARY SCHOOL", min_days: 5, max_days: 6, fraction: 1, min_distance: 5000, max_distance: 10000, min_pts: 2, max_pts: 4 },                     //dest: ~primary
    { category: "SECONDARY SCHOOL", min_days: 5, max_days: 6, fraction: 1, min_distance: 10000, max_distance: 20000, min_pts: 2, max_pts: 6 },                  //dest: ~secondary
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
 * Helper function for stateR0() to find the relevant row with corresponding year and month and returns the index
 * 
 * @param {Array} myarray
 * @param {any} inyear
 * @param {any} inmonth
 * 
 * @returns {int} : array index, -1 for not found
 */
function findInArray(myarray, inyear, inmonth) {
    for (var x = 0; x < myarray.length; x++) {
        if ((myarray[x][2] == inyear) && (myarray[x][3] == inmonth)) {
            //console.log(myarray[x][2], myarray[x][3], "index", x);
            return x;
        }
    }
    return -1;
}

/**
 * RNaught mapping functions (only state level r0 is available)
 * To do: convert to auto loading from file in future
 *
 * @param {string} statename
 * @param {Date} date
 */
function stateR0(statename, date) {
    //location,code,year,month,d01,d02,d03,d04,d05,d06,d07,d08,d09,d10,d11,d12,d13,d14,d15,d16,d17,d18,d19,d20,d21,d22,d23,d24,d25,d26,d27,d28,d29,d30,d31
    const offset = 4;     //offset ==> d01
    var r0 = 0;
    let mth = date.toISOString().split('T')[0].substring(5, 7);
    let yr = date.toISOString().split('T')[0].substring(0, 4);
    let vdate = parseInt(date.toYYYYMMDD());
    let dpos = -1;
    //console.log(statename, date.toISOString().split('T')[0]);
    switch (statename) {
        case 'Selangor':
            dpos = findInArray(rNaughtSL, yr, mth);
            r0 = rNaughtSL[dpos][vdate - dateBegin + offset];
            //console.log("SL r0 = " + r0);
            break; //selangor
        case 'KL':
            dpos = findInArray(rNaughtKL, yr, mth);
            r0 = rNaughtKL[dpos][vdate - dateBegin + offset];
            //console.log("KL r0 = " + r0);
            break; //Kuala Lumpur
        case 'Putrajaya':
            dpos = findInArray(rNaughtPJ, yr, mth);
            r0 = rNaughtPJ[dpos][vdate - dateBegin + offset];
            //console.log("PJ r0 = " + r0);
            break; //Putrajaya
        case 'Sabah':
            dpos = findInArray(rNaughtSA, yr, mth);
            r0 = rNaughtSA[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("SA r0 = " + r0);
            break; //sabah
        case 'Penang':
            dpos = findInArray(rNaughtPG, yr, mth);
            r0 = rNaughtPG[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("PG r0 = " + r0);
            break; //penang
        case 'Johor':
            dpos = findInArray(rNaughtJH, yr, mth);
            r0 = rNaughtJH[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("JH r0 = " + r0);
            break; //johor
        case 'Kelantan':
            dpos = findInArray(rNaughtKN, yr, mth);
            r0 = rNaughtKN[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("KN r0 = " + r0);
            break; //kelantan
        case 'Melaka':
            dpos = findInArray(rNaughtML, yr, mth);
            r0 = rNaughtML[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("ML r0 = " + r0);
            break; //melaka
        case 'Labuan':
            dpos = findInArray(rNaughtLA, yr, mth);
            r0 = rNaughtLA[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("LA r0 = " + r0);
            break; //Labuan
        case 'Negeri Sembilan':
            dpos = findInArray(rNaughtNS, yr, mth);
            r0 = rNaughtNS[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("NS r0 = " + r0);
            break; //negerisembilan
        case 'Kedah':
            dpos = findInArray(rNaughtKH, yr, mth);
            r0 = rNaughtKH[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("KH r0 = " + r0);
            break; //kedah
        case 'Pahang':
            dpos = findInArray(rNaughtPH, yr, mth);
            r0 = rNaughtPH[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("PH r0 = " + r0);
            break; //pahang
        case 'Perak':
            dpos = findInArray(rNaughtPK, yr, mth);
            r0 = rNaughtPK[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log(yr, mth, dpos, "PK r0 = " + r0);
            break; //perak
        case 'Terengganu':
            dpos = findInArray(rNaughtTE, yr, mth);
            r0 = rNaughtTE[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("TE r0 = " + r0);
            break; //terengganu
        case 'Sarawak':
            dpos = findInArray(rNaughtSK, yr, mth);
            r0 = rNaughtSK[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("SK r0 = " + r0);
            break; //sarawak
        case 'Perlis':
            dpos = findInArray(rNaughtPL, yr, mth);
            r0 = rNaughtPL[dpos][date.toYYYYMMDD() - dateBegin + offset];
            //console.log("PL r0 = " + r0);
            break; //perlis
        default:
            dpos = findInArray(rNaughtMY, yr, mth);
            r0 = rNaughtMY[dpos][vdate - dateBegin + offset];
            //console.log("MY r0 = " + r0);
            break; //Malaysia
    }
    return r0;
}

//----------------------------------
//   Exception handling functions  |
//----------------------------------

/**
 * Function to check whether a coordinate falls on water 
 * 
 * @param {string} APIKey
 * @param {float} lat
 * @param {float} lon
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
 *
 * @param {any} lats
 * @param {any} lons
 */
async function testStateName(lats, lons) {
    return await getStateName(lats, lons).then(() => {
        console.log("gmap revgeo --- point " + lats + "," + lons + " is in " + state);
    });
}

/**
 * Function to quickly determine the address of a given point via Google Map reverse geolocation services (may not be 100% accurate)
 * Returns the 'state name' where the point is located
 * Calls: getStateName function
 * Get the state name for a given lat,lon via geocoder  services
 * 
 * @param {any} lats
 * @param {any} lons
 */
async function getStateName(lats, lons) {
    //Change to Google reverse geocoding
    var latlng = new google.maps.LatLng({ lat: lats, lng: lons });
    var geocoder = new google.maps.Geocoder();
    let myPromise = new Promise(function (resolve) {

        geocoder.geocode({ location: latlng })
            .then((response) => {
                if (response.results[0] !== null) {
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
                    //we just use statename here
                    nation = { country: country, state: state, district: district, region: region, city: city };
                }
                else {
                    nation = { country: "not found", state: "not found", district: "not found", region: "not found", city: "not found" };
                }
                resolve(nation);
            })
            .catch((e) => {
                console.log("Error processing " + latlng.lat + "," + latlng.lon + "Geocoder failed due to: " + e);
            });
    });
    await myPromise.then((resolve) => {
        console.log("resolved=" + resolve.state);
        return resolve;
    });
}


//----------------------
//   Main function     |
//----------------------

//Initialization Function (called during loading of script)
//
function initData() {
    //var land = { lat: 3.040718, lng: 101.789423 };                          //Sg Long Sec 1
    //var origin = { lat: 3.016425, lng: 101.141194};
    //Start
    //1. Load the state daily active cases summary 
    LoadStateCasesSummary(places, baseaddress + "/data/" + foldername + "/" + summaryfilename);
    LoadStateCasesFull(placesAll, baseaddress + "/data/" + foldername + "/" + summaryfilename);

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
    LoadUniCollege(10, unicollege, baseaddress + "/data/" + iptsfilename);  //10=Selangor, 14=KL, 16=Putrajaya
    LoadUniCollege(14, unicollege, baseaddress + "/data/" + iptsfilename);
    LoadUniCollege(16, unicollege, baseaddress + "/data/" + iptsfilename);
    //-----------------------------------------------------------------

    // (New Update 2021-12-11)
    //load R Naught Tables
    LoadRNaughts(baseaddress + "/data/" + rnaughtfilename);
    //-----------------------------------------------------------------

    //4. Hook event to buttons
    document.getElementById("Samples").addEventListener("click", generateSamples);
    document.getElementById("Simulate").addEventListener("click", startSimulation);
    document.getElementById("Resolve").addEventListener("click", resolveSimulation);
    document.getElementById("Download").addEventListener("click", saveFile);

    //set the initial status
    document.getElementById("Samples").disabled = false;   //default enabled for the first step
    document.getElementById("Simulate").disabled = true;   //only enable once samples are created
    document.getElementById("Resolve").disabled = true;   //only enable once samples are created
    document.getElementById("Download").disabled = true;   //only enable once simulation is finished.

    //-----------------------------------------------------------------
    //init default values
    document.getElementById("samples").value = 100;  //default value

    var today = new Date();
    today.setHours(-24);         //set to yesterday
    var mindate = "2021-11-01";  //min in the database
    var maxdate = "2021-11-30";  // today.toDateInputValue();   // oct & dec data temporarily not ready yet

    document.getElementById("yest").innerHTML = maxdate; // today.toDateInputValue();

    var date_input1 = document.getElementById("startdate");
    date_input1.value = mindate;
    date_input1.min = mindate;
    date_input1.max = maxdate;
    var date_input2 = document.getElementById("enddate");
    date_input2.value = maxdate;
    date_input2.min = mindate;
    date_input2.max = maxdate;

    date_input1.onchange = function () {
        if (this.value > date_input2.value) {
            alert(this.value + " is more than the end date " + date_input2.value);
            date_input2.value = this.value;
        }
    }

    date_input2.onchange = function () {
        if (this.value < date_input1.value) {
            alert(this.value + " is less than the begin date " + date_input1.value);
            date_input1.value = this.value;
        }
    }
    //--------------------------------------------------------------------
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
    //Error! If you ever reach here, it is definitely wrong - "Not Found." 
    //console.log("Error. " + lat + "," + lon + " not found in grid. Min distance= " + smallest.toFixed(2) + "m");

    //Function to check the problematic points whether they are still considered inside the state.
    isBounded(baseaddress + areaRequestURL, mapID, lat, lon, smallest.toFixed(2), minlat, minlon, index);
    //Note: Some borderline points may fail as it is not represented by any grid.

    //remedial actions 
    //delegated to resolveSimulation() async function that can be run standalone; 
    return -1; //-1 to denote failed search
}

/**
 * NEW searchOutsidePlace
 * 
 * @param {any} lat
 * @param {any} lon
 */
function searchOutsidePlace(lat, lon) {
    let smallest = Infinity; minlat = 0; minlon = 0; index = 0;
    for (var i = 0; i < placesOutside.length; i++) {
        let dist = distance(parseFloat(placesOutside[i][0]), parseFloat(placesOutside[i][1]), parseFloat(lat), parseFloat(lon));
        if (dist <= 1000) {
            return i;
        }
        if (dist < smallest) {
            smallest = dist; minlat = placesOutside[i][0]; minlon = placesOutside[i][1]; index = i;
        }
    }
    //Error! If you reach here, it is definitely wrong - "Not Found." 
    return -1; //-1 to denote failed search
}

/**
 * NEW LoadDailyStateCases (UNUSED)
 * 
 * @param {Array} container
 * @param {string} sourceFile
 */
async function LoadDailyStateCases(container, sourceFile) {
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
                    var locationname = data[index]['placename'];
                    var label1 = data[index]['label'];
                    var weeklyactive = parseInt(data[index]['weeklyactive']);
                    var totalactive = parseInt(data[index]['totalactive']);
                    var weeklyrecovered = parseInt(data[index]['weeklyrecovered']);
                    var totalrecovered = parseInt(data[index]['totalrecovered']);
                    var weeklydeaths = parseInt(data[index]['weeklydeaths']);
                    var totaldeaths = parseInt(data[index]['totaldeaths']);
                    var weightage = parseInt(data[index]['weight']);
                    var timestamp = data[index]['timestamp'];

                    //drop the last row if it contains NaN. We only take the grids that are at some time active (inhabited)
                    if (!isNaN(lt1)) {
                        //header = "lat,lon,label,placename,weeklyactive,totalactive,weeklyrecovered,totalrecovered,weeklydeaths,totaldeaths,weight,timestamp";
                        container.push([lt1, ln1, label1, locationname, weeklyactive, totalactive, weeklyrecovered, totalrecovered, weeklydeaths, totaldeaths, weightage, timestamp]);
                    }
                });
                //console.log("response resolved.");
                resolve(this.responseText);
            }
        };
        xhr.send();
    });
    await myPromise.then(() => {
        document.getElementById('Update').innerHTML += "<br/>(Async) Daily cases sourcefile " + sourceFile.split("/")[5] + " loaded = " + places.length + " records.";
        //report the upload status to the html page
        return myPromise;
    });
}

/**
 * NEW searchStateCases
 * 
 * @param {any} state
 * @param {any} lat
 * @param {any} lon
 * @param {any} dateFrom
 * @param {any} dateTo
 */
async function searchStateCases(state, lat, lon, dateFrom, dateTo) {
    //names are lower case with no spaces in between
    let foldername = state.toLowerCase().split(" ").join("");
    let filename = state.toLowerCase().split(" ").join("");

    //selangor state survey is now merged with klangvalley
    if (filename == "" || filename == "federalterritoryofkualalumpur" || filename == "putrajaya" || filename == "selangor") {
        filename = "klangvalley"; foldername = "selangor";
    }
    //english to malay name
    if (filename == 'malacca') { filename = 'melaka'; foldername = filename; };

    //others to be added

    for (var i = dateFrom; i <= dateTo; i++) {
        placesOutside.splice(0, placesOutside.length);       //clear the entire array list before loading new ones
        //placesOutside.length = 0;                            //clear placesOutside

        let monthstring = dateFrom.getMonth() + 1;
        let yearstring = dateFrom.getFullYear();
        let sourceFile = baseaddress + "/data/" + foldername + "/" + filename + "_monthly_summary-" + yearstring + "-" + monthstring + ".csv";
        //let sourceFile = baseaddress + "/data/" + foldername + "/" + i + "_" + filename + ".csv";

        const stateLoaded = await LoadStateCasesFull(placesOutside, sourceFile);
        // await loading to complete
        var gridId = searchOutsidePlace(lat, lon);
        if ((gridId != -1) && (gridId != undefined)) {
            document.getElementById('Update').innerHTML += "[" + dateFrom.toISOString().split('T')[0] + "] (" +
                lat + ", " + lon + ") is found inside grid #" + gridId + "(" + placesOutside[gridId][0] + ", " + placesOutside[gridId][1] + ") " +
                " risk = " + placesOutside[gridId][daysDifference(dateFrom, dateTo) + 4] + " active cases ";
            //return object
            return new Promise(resolve => {
                resolve({
                    gridX: placesOutside[gridId][0],
                    gridY: placesOutside[gridId][1],
                    cases: placesOutside[gridId][daysDifference(dateFrom, dateTo) + 4],
                    total: placesOutside[gridId][35]
                });
            });
        }
        else {
            // Still not found
            document.getElementById('Update').innerHTML += "[" + dateFrom.toISOString().split('T')[0] + "] (" +
                lat + "," + lon + ") is not found on " + state + " land. Possibly in water. ";
            //return object
            return new Promise(resolve => {
                resolve({
                    gridX: "x", gridY: "y",  //use impossible values to denote false
                    cases: -1, total: -1
                })
            });
        }
    }
}


/**
 * Function to delay execution speed of a loop (for, while etc) so that the web services will not reject the requests
 *
 * @param {bigint} milliseconds
 */
const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

//Ok, we extend the Date() class to support date input of type YYYY-MM-dd
Date.prototype.toDateInputValue = (function () {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
});

Date.prototype.addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

Date.prototype.toYYYYMMDD = function () {
    let temp = this.toISOString().split('T')[0].split('-').join('');
    return temp;
    //return this.getFullYear() + "-" + (this.getMonth() + 1) + "-" + this.getDate();
};


//----------------------
//Random Generators    |
//----------------------

/**
 * Random number generator to generate an integer in the range of (min, max)
 *
 * @param {bigint} min
 * @param {bigint} max
 */
function random(min, max) {
    return Math.floor(min + Math.random() * (max - min));   //Math.floor(Math.random() * 100)
}

/**
 * Weighted random number generator to generate an integer according to certain weightage.
 * prerequisite: a list object must be supplied e.g. { 4: 0.45, 5: 0.2, 6: 0.15, 7: 0.15, 8: 0.025, 9: 0.025 }
 *
 * @param {Object} list
 */
function weightedRandom(list) {
    let i, sum = 0, r = Math.random();
    for (i in list) {
        sum += list[i];
        if (r <= sum) return i;
    }
}

/**
 * Random date generator
 * 
 * @param {Date} start
 * @param {Date} end
 */
function randomDate(start, end) {
    start = Date.parse(start);
    end = Date.parse(end);
    return new Date(Math.floor(Math.random() * (end - start + 1) + start));
}

/**
 * Random Date and Time generator
 * Call example: randomDate(new Date(2020, 0, 1), new Date(), 0, 24)
 * 
 * @param {any} start
 * @param {any} end
 * @param {any} startHour
 * @param {any} endHour
 */
function randomDateTime(start, end, startHour, endHour) {
    start = Date.parse(start);
    end = Date.parse(end);
    var date = new Date(+start + Math.random() * (end - start));
    var hour = startHour + Math.random() * (endHour - startHour) | 0;
    date.setHours(hour);
    return date;
}

/**
 * Function to return the difference in number of days between two dates
 * 
 * @param {any} start
 * @param {any} end
 */
function daysDifference(start, end) {
    var diff = new Date(end).getTime() - new Date(start).getTime();
    //console.log(start + "and " + end + " diff is = " + diff / 8.64e7 + " ms");
    return Math.round(diff / 8.64e7);    //8.64e7 = 1000 * 60 secs * 60 mins * 24 hrs
}

//---------------------------------------
// Simulation Param Functions (OnClick) |
//---------------------------------------
//Function to generate sample space, i.e. no of personnel for the simulation (called by OnClick event)
//
function generateSamples() {
    //-------------------
    //set input values
    if (!isNaN(document.getElementById("samples").value) && (document.getElementById("samples").value > 0)) {
        multiplier = document.getElementById("samples").value / 100;     //1=100samples, 10 = 1000samples, 100 = 10, 000samples, 1000 = 100, 000samples etc.
    }
    else {
        multiplier = 1;
    }
    //------------------
    var dBegin = new Date(document.getElementById("startdate").value); //parseInt(document.getElementById("startdate").value.split('-').join(''));;
    var dEnd = new Date(document.getElementById("enddate").value);     //parseInt(document.getElementById("enddate").value.split('-').join(''));;

    //-------------------
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
            //--
            var endlimit = dEnd;
            endlimit = endlimit.addDays(-parseInt(days));
            var start = randomDate(dBegin, endlimit);                 //start=  (dBegin ... dateEnd-days)
            var end = new Date(start);
            end = end.addDays(parseInt(days));                        //end = start + days
            //var start = random(parseInt(dateBegin), parseInt(dateEnd) - days);  
            //var end = random(start, start + days);
            //--

            //if points = 0 or 1, there is no distance to calculate!
            distance = (points > 1) ? distance : 0;

            //push the data to personnel. 
            //age, date, points, travel_distance -->  will be used to simulate the (lat, lon) points in the second stage

            personnel.push([myAge, lcode, new Date(start), new Date(end), points, distance]);
            //console.log(myAge, lcode, new Date(start), new Date(end), points, distance);
        }
        document.getElementById('Update').innerHTML += "<br>Unique " + ageGroup[index]['role'] + " personnel = " + (personnel.length - previous);
    }
    document.getElementById('Update').innerHTML += "<br>-------------------------------------------------------";
    document.getElementById('Update').innerHTML += "<br>Total personnels generated = " + (personnel.length) + "<br>";
    document.getElementById("Samples").disabled = true;     //samples created
    document.getElementById("Simulate").disabled = false;   //only enable once samples are created
    document.getElementById("Resolve").disabled = true;   //only enable once samples are created
    document.getElementById("Download").disabled = true;    //only enable once simulation is finished.

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

// Main Resolve function  (called by onClick event)
async function resolveSimulation() {
    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR 
    //[who, a.toISOString().split('T')[0], state, lat, lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]

    document.getElementById('Update').innerHTML += "<br/>-------------------------------------------------------<br/>";
    document.getElementById('Update').innerHTML += "Resolving unidentified points ....</br>";
    document.getElementById('Update').innerHTML += "Total = " + simulation.length + " coordinates to cross check </br>";
    let count = 0;

    for (var z = 0; z < simulation.length; z++) {
        let lats = simulation[z][3];
        let lons = simulation[z][4];
        let fromDate = new Date(simulation[z][1]);
        let toDate = fromDate;

        //console.log("iteration: " + z);

        //determine which state a given point  (lat,lon) is located
        if (simulation[z][2] == "unknown") {
            count += 1;
            document.getElementById('Update').innerHTML += "<br />" + count + ". ";
            console.log(simulation[z][0], simulation[z][1], simulation[z][2], simulation[z][3], simulation[z][4], simulation[z][5], simulation[z][6], simulation[z][7], simulation[z][8]);

            const e = await getStateName(lats, lons);
            //this section will run after the getStateName returns
            {
                //state identified
                document.getElementById('Update').innerHTML += "(" + lats + "," + lons + ") is located in " + state;
                simulation[z][2] = state;
                //find r0
                let r0s = stateR0(state, fromDate);
                simulation[z][6] = r0s;  // assign the rnaught result
                simulation[z][7] = r0s;  // assign the rnaught total
                document.getElementById('Update').innerHTML += " R0/RT for " + fromDate.toISOString().split('T')[0] + " is " + r0s + ".....";
            }
            //find gridID in the state (async)
            const f = await searchStateCases(state, lats, lons, fromDate, toDate);
            //this section will run after the searchStateCases returns
            {
                document.getElementById('Update').innerHTML += " =====> (" + f.gridX + "," + f.gridY + ")";
                document.getElementById('Update').innerHTML += ", active cases = " + f.cases;
                document.getElementById('Update').innerHTML += ", total cases = " + f.total + "<br />";
                simulation[z][5] = (f.cases < 0) ? "water" : f.cases;  // assign the cases result to the simulation array
                simulation[z][8] = (f.total < 0) ? "water" : f.total;  // assign the cases result to the simulation array

                //check for water (Can be ignored. Assume case=0 and total=0)
                //let ans = testWater(lat, lon); //in water?
                //document.getElementById('Update').innerHTML += "<br/>(" + lat + ","+ lon + ") is in water? " + ans;
            }
            await sleep(600);
        }
        else {
            //don't delay tooo much!
            await sleep(200);
        }


    }
    document.getElementById('Update').innerHTML += "<br/><br/> Resolve completed";
    document.getElementById("Samples").disabled = true;    //samples created
    document.getElementById("Simulate").disabled = true;   //Simulation done
    document.getElementById("Resolve").disabled = true;    //Resolve done
    document.getElementById("Download").disabled = false;  //only enable once resolve is completed.
}

function failureCallback(error) {
    console.error("Error during operation: " + error);
}

// Main Simulation function (called by onClick event)
//
async function startSimulation() {
    //stop people from clicking multiple times
    document.getElementById("Simulate").disabled = true;   //Simulation

    document.getElementById('Update').innerHTML += "-------------------------------------------------------<br/>";
    document.getElementById('Update').innerHTML += "Simulation Starts....</br>";

    //myAge, start, end, points, distance
    for (var y = 0; y < personnel.length; y++) {
        state = mapID;   //default
        var age = personnel[y][0];
        var lcode = personnel[y][1];
        var category = lifestyleParam[lcode]['category'];
        var startdate = new Date(personnel[y][2]);            //modified startdate
        var enddate = new Date(personnel[y][3]);              //modified enddate
        var waypoints = personnel[y][4];
        var traveldistance = personnel[y][5];

        document.getElementById('Update').innerHTML += "<br><br>(No " + (y + 1) + ". " + category + " age=" + age + " , from " +
            startdate.toISOString().split('T')[0] + " to " + enddate.toISOString().split('T')[0] + ", waypt=" + waypoints +
            ", dist=" + traveldistance + " m " + ((traveldistance <= 1) ? "(static))" : " )");

        //console.log("b4 switch", y + 1, startdate.toISOString().split('T')[0], enddate.toISOString().split('T')[0]);

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
                    await sleep(1)
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
                    await sleep(1)
                }

                // daily loop --> fix home and school, vary the rest.
                for (var a = startdate; a <= enddate; a.setDate(a.getDate() + 1)) {
                    state = mapID;   //default
                    var distance = traveldistance - hdist;                      //remaining distance
                    // show home address
                    document.getElementById('Update').innerHTML += "<br>[" + a.toISOString().split('T')[0] + "] home address (" + home.lat + "," + home.lng + ") at grid (" +
                        placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][daysDifference(startdate, a) + 4] + " active cases ";

                    //push home
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    let cases = placesAll[gridId2][daysDifference(startdate, a) + 4];
                    let t_cases = placesAll[gridId2][35];
                    let r0s = stateR0(subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:"), a);
                    state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                    simulation.push([who, a.toISOString().split('T')[0], state, home.lat, home.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                    //--------------------------------------------------------------------------------------------------------

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        continue;
                    }

                    //push school address
                    document.getElementById('Update').innerHTML += "<br> _________ school address (" + school.lat + "," + school.lng + ") @ " + primary[selection][1];
                    //push school
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    cases = placesAll[gridId1][daysDifference(startdate, a) + 4];
                    t_cases = placesAll[gridId1][35];
                    r0s = stateR0(subtringBetween(placesAll[gridId1][2], "Daerah: ", "<br>No:"), a);
                    state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                    simulation.push([who, a.toISOString().split('T')[0], state, school.lat, school.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                    //--------------------------------------------------------------------------------------------------------

                    document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId1][0] + "," + placesAll[gridId1][1] + ") risk=" + placesAll[gridId1][daysDifference(startdate, a) + 4] + " active cases ";
                    //distance between origin and destination
                    document.getElementById('Update').innerHTML += "<br> _________ home to school  =" + hdist + " m ";

                    // 2 waypoints and above 
                    starting_point = school;     //start from school

                    //loop
                    for (var b = 0; b < waypoints - 2; b++) {
                        state = mapID;   //default
                        let results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        let lats = parseFloat(results[0].latitude);
                        let lons = parseFloat(results[0].longitude2);
                        let cdist = parseFloat(results[0].distance2);
                        let gridId = searchPlace(lats, lons);
                        point = { lat: lats, lng: lons };                //next point
                        distance = distance - cdist;                     //remaining distance
                        await sleep(1)

                        document.getElementById('Update').innerHTML += "<br>[" + a.toISOString().split('T')[0] + "] school (" + school.lat + ", " + school.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";

                        if (gridId != -1) {
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][daysDifference(startdate, a) + 4] + " active cases ";
                            // + " remaining distance=" + distance + " m";
                            //push coordinate
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            let cases = placesAll[gridId][daysDifference(startdate, a) + 4];
                            let t_cases = placesAll[gridId][35];
                            let r0s = stateR0(subtringBetween(placesAll[gridId][2], "Daerah: ", "<br>No:"), a);
                            state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                            simulation.push([who, a.toISOString().split('T')[0], state, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                            //--------------------------------------------------------------------------------------------------------
                        }
                        else {
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            let cases = "please cross-check";
                            let t_cases = "please cross-check";
                            let r0s = "r0";
                            state = "unknown"; //instead of mapID
                            //---------------------------------------------------------------------------------------------------------
                            simulation.push([who, a.toISOString().split('T')[0], state, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                            //--------------------------------------------------------------------------------------------------------
                        }
                    }
                }
                break;
            case 2:
                starting_point = {};
                //generate secondary school address   //secondary -> code, school, state, district, postcode, lat1, lon1
                selection = random(0, secondary.length);      //choose a secondary school (index) as destination
                var school2 = { lat: parseFloat(secondary[selection][5]), lng: parseFloat(secondary[selection][6]) };
                gridId1 = searchPlace(parseFloat(secondary[selection][5]), parseFloat(secondary[selection][6]));   //grid id for secondary school

                //keep repeating until we get a school within the Grid
                while (gridId1 < 0) {
                    selection = random(0, secondary.length);      //choose a secondary school (index) as destination
                    school2 = { lat: parseFloat(secondary[selection][5]), lng: parseFloat(secondary[selection][6]) };
                    gridId1 = searchPlace(parseFloat(secondary[selection][5]), parseFloat(secondary[selection][6]));   //grid id for secondary school
                    await sleep(1)
                }

                //generate home address
                results = generateMapPoints(school2, traveldistance, 1);  //generates distance from home to secondary school (~ traveldistance)
                lats = parseFloat(results[0].latitude);
                lons = parseFloat(results[0].longitude2);
                hdist = parseFloat(results[0].distance2);
                home = { lat: lats, lng: lons };
                gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

                //keep repeating until we get a home address within the Grid
                while (gridId2 < 0) {
                    results = generateMapPoints(school2, traveldistance, 1);  //generates distance from home to secondary school (~ traveldistance)
                    lats = parseFloat(results[0].latitude);
                    lons = parseFloat(results[0].longitude2);
                    hdist = parseFloat(results[0].distance2);
                    home = { lat: lats, lng: lons };
                    gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home
                    await sleep(1)
                }

                //console.log("b4 loop", y + 1, startdate.toISOString().split('T')[0], enddate.toISOString().split('T')[0], home.lat, home.lng);

                // daily loop --> fix home and secondary school, vary the rest.
                for (var a = startdate; a <= enddate; a.setDate(a.getDate() + 1)) {
                    state = mapID;   //default
                    var distance = traveldistance - hdist;                      //remaining distance

                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a.toISOString().split('T')[0] + "] home address (" + home.lat + "," + home.lng + ") at grid (" +
                        placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][daysDifference(startdate, a) + 4] + " active cases ";

                    //console.log("-", y + 1, startdate.toISOString().split('T')[0], enddate.toISOString().split('T')[0], a.toISOString().split('T')[0], home.lat, home.lng);

                    //push home
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    let cases = placesAll[gridId2][daysDifference(startdate, a) + 4];
                    let t_cases = placesAll[gridId2][35];
                    let r0s = stateR0(subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:"), a);
                    state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                    simulation.push([who, a.toISOString().split('T')[0], state, home.lat, home.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                    //--------------------------------------------------------------------------------------------------------

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        continue;
                    }

                    //push secondary school address
                    document.getElementById('Update').innerHTML += "<br> _________ secondary school address (" + school2.lat + "," + school2.lng + ") @ " + secondary[selection][1];
                    //push school
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    cases = placesAll[gridId1][daysDifference(startdate, a) + 4];
                    t_cases = placesAll[gridId1][35];
                    r0s = stateR0(subtringBetween(placesAll[gridId1][2], "Daerah: ", "<br>No:"), a);
                    state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                    simulation.push([who, a.toISOString().split('T')[0], state, school2.lat, school2.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                    //--------------------------------------------------------------------------------------------------------

                    document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId1][0] + "," + placesAll[gridId1][1] + ") risk=" + placesAll[gridId1][daysDifference(startdate, a) + 4] + " active cases ";
                    //distance between origin and destination
                    document.getElementById('Update').innerHTML += "<br> _________ home to secondary school  =" + hdist + " m ";

                    // 2 waypoints and above 
                    starting_point = school2;     //start from school
                    for (var b = 0; b < waypoints - 2; b++) {
                        state = mapID;   //default
                        let results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        let lats = parseFloat(results[0].latitude);
                        let lons = parseFloat(results[0].longitude2);
                        let cdist = parseFloat(results[0].distance2);
                        let gridId = searchPlace(lats, lons);
                        point = { lat: lats, lng: lons };                //next point
                        distance = distance - cdist;                     //remaining distance
                        await sleep(1)

                        document.getElementById('Update').innerHTML += "<br>[" + a.toISOString().split('T')[0] + "] secondary school (" + school2.lat + ", " + school2.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";

                        if (gridId != -1) {
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][daysDifference(startdate, a) + 4] + " active cases ";
                            // + " remaining distance=" + distance + " m";
                            //push coordinate
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            let cases = placesAll[gridId][daysDifference(startdate, a) + 4];
                            let t_cases = placesAll[gridId][35];
                            let r0s = stateR0(subtringBetween(placesAll[gridId][2], "Daerah: ", "<br>No:"), a);
                            state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                            simulation.push([who, a.toISOString().split('T')[0], state, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                            //--------------------------------------------------------------------------------------------------------
                        }
                        else {
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            let cases = "please cross-check";
                            let t_cases = "please cross-check";
                            let r0s = "r0";
                            state = "unknown";
                            simulation.push([who, a.toISOString().split('T')[0], state, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                            //--------------------------------------------------------------------------------------------------------
                        }
                    }
                }
                break;
            case 3:
                starting_point = {};
                //Uni/College -> No,Name,State,Code,Lat,Lon
                selection = random(0, unicollege.length);      //choose a uni/college (index) as destination
                var uni = { lat: parseFloat(unicollege[selection][4]), lng: parseFloat(unicollege[selection][5]) };
                gridId1 = searchPlace(parseFloat(unicollege[selection][4]), parseFloat(unicollege[selection][5]));   //grid id for uni

                //keep repeating until we get a school within the Grid
                while (gridId1 < 0) {
                    selection = random(0, unicollege.length);      //choose a uni/college (index) as destination
                    uni = { lat: parseFloat(unicollege[selection][4]), lng: parseFloat(unicollege[selection][5]) };
                    gridId1 = searchPlace(parseFloat(unicollege[selection][4]), parseFloat(unicollege[selection][5]));   //grid id for uni
                    await sleep(1)
                }

                //generate home address
                results = generateMapPoints(uni, traveldistance, 1);  //generates distance from home to uni (~ traveldistance)
                lats = parseFloat(results[0].latitude);
                lons = parseFloat(results[0].longitude2);
                hdist = parseFloat(results[0].distance2);
                home = { lat: lats, lng: lons };
                gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

                //keep repeating until we get a home address within the Grid
                while (gridId2 < 0) {
                    results = generateMapPoints(uni, traveldistance, 1);  //generates distance from home to uni (~ traveldistance)
                    lats = parseFloat(results[0].latitude);
                    lons = parseFloat(results[0].longitude2);
                    hdist = parseFloat(results[0].distance2);
                    home = { lat: lats, lng: lons };
                    gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home
                    await sleep(1)
                }

                //console.log("b4 loop", y + 1, startdate.toISOString().split('T')[0], enddate.toISOString().split('T')[0], home.lat, home.lng);

                // daily loop --> fix home and uni, vary the rest.
                for (var a = startdate; a <= enddate; a.setDate(a.getDate() + 1)) {
                    state = mapID;   //default
                    var distance = traveldistance - hdist;                      //remaining distance

                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a.toISOString().split('T')[0] + "] home address (" + home.lat + "," + home.lng + ") at grid (" +
                        placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][daysDifference(startdate, a) + 4] + " active cases ";

                    //console.log("-", y + 1, startdate.toISOString().split('T')[0], enddate.toISOString().split('T')[0], a.toISOString().split('T')[0], home.lat, home.lng);

                    //push home
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    let cases = placesAll[gridId2][daysDifference(startdate, a) + 4];
                    let t_cases = placesAll[gridId2][35];
                    let r0s = stateR0(subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:"), a);
                    state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                    simulation.push([who, a.toISOString().split('T')[0], state, home.lat, home.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                    //--------------------------------------------------------------------------------------------------------

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        continue;
                    }
                    //push uni address
                    document.getElementById('Update').innerHTML += "<br> _________ uni/college address (" + uni.lat + "," + uni.lng + ") @ " + unicollege[selection][1];
                    //push uni 
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    cases = placesAll[gridId1][daysDifference(startdate, a) + 4];
                    t_cases = placesAll[gridId1][35];
                    r0s = stateR0(subtringBetween(placesAll[gridId1][2], "Daerah: ", "<br>No:"), a);
                    state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                    simulation.push([who, a.toISOString().split('T')[0], state, school2.lat, school2.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                    //--------------------------------------------------------------------------------------------------------

                    document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][daysDifference(startdate, a) + 4] + " active cases ";
                    //distance between origin and destination
                    document.getElementById('Update').innerHTML += "<br> _________ home to uni/college  =" + hdist + " m ";

                    // 2 waypoints and above 
                    starting_point = uni;     //start from uni/college
                    for (var b = 0; b < waypoints - 2; b++) {
                        state = mapID;   //default
                        let results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        let lats = parseFloat(results[0].latitude);
                        let lons = parseFloat(results[0].longitude2);
                        let cdist = parseFloat(results[0].distance2);
                        let gridId = searchPlace(lats, lons);
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        await sleep(1)

                        document.getElementById('Update').innerHTML += "<br>[" + a.toISOString().split('T')[0] + "] uni/college (" + uni.lat + ", " + uni.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";

                        if (gridId != -1) {
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][daysDifference(startdate, a) + 4] + " active cases ";
                            // + " remaining distance=" + distance + " m";
                            //push coordinate
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            let cases = placesAll[gridId][daysDifference(startdate, a) + 4];
                            let t_cases = placesAll[gridId][35];
                            let r0s = stateR0(subtringBetween(placesAll[gridId][2], "Daerah: ", "<br>No:"), a);
                            state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                            simulation.push([who, a.toISOString().split('T')[0], state, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                            //--------------------------------------------------------------------------------------------------------
                        }
                        else {
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            let cases = "please cross-check";
                            let t_cases = "please cross-check";
                            let r0s = "r0";
                            state = "unknown";
                            simulation.push([who, a.toISOString().split('T')[0], state, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                            //--------------------------------------------------------------------------------------------------------
                        }
                    }
                }
                break;
            default:
                //generate home address = centerpoint
                //places -> lat,lon,label,placename,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,total
                let Id = random(0, places.length);      //choose a grid (index) as home
                lats = places[Id][0];
                lons = places[Id][1];
                let offset_lat = lats + random(0, delta_lat * 1000000) / 1000000;
                let offset_lon = lons + random(0, delta_lon * 1000000) / 1000000;
                home = { lat: offset_lat, lng: offset_lon };
                starting_point = home;                //start from home
                gridId2 = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

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
                    await sleep(1)
                }

                //console.log("b4 loop", y + 1, startdate.toISOString().split('T')[0], enddate.toISOString().split('T')[0], home.lat, home.lng);

                // daily loop --> fix home, vary the rest.
                for (var a = startdate; a <= enddate; a.setDate(a.getDate() + 1)) {
                    state = mapID;   //default
                    var distance = traveldistance;            //init with total distance

                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a.toISOString().split('T')[0] + "] home address (" + home.lat + "," + home.lng + ") ";
                    document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId2][0] + "," + placesAll[gridId2][1] + ") risk=" + placesAll[gridId2][daysDifference(startdate, a) + 4] + " active cases ";

                    //console.log("-", y + 1, startdate.toISOString().split('T')[0], enddate.toISOString().split('T')[0], a.toISOString().split('T')[0], home.lat, home.lng);

                    //push home
                    //---------------------------------------------------------------------------------------------------------
                    //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                    let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                    let cases = placesAll[gridId2][daysDifference(startdate, a) + 4];
                    let t_cases = placesAll[gridId2][35];
                    let r0s = stateR0(subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:"), a);
                    state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                    simulation.push([who, a.toISOString().split('T')[0], state, home.lat, home.lng, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                    document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                    //--------------------------------------------------------------------------------------------------------

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        continue;
                    }

                    // 2 waypoints and above 
                    for (var b = 0; b < waypoints - 1; b++) {
                        state = mapID;   //default
                        let results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        let lats = parseFloat(results[0].latitude);
                        let lons = parseFloat(results[0].longitude2);
                        let cdist = parseFloat(results[0].distance2);
                        let gridId = searchPlace(lats, lons)
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        await sleep(1)

                        document.getElementById('Update').innerHTML += "<br>[" + a.toISOString().split('T')[0] + "] home (" + home.lat + ", " + home.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";

                        if (gridId != -1) {
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][daysDifference(startdate, a) + 4] + " active cases ";
                            // + " remaining distance=" + distance + " m";
                            //push coordinate
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            let cases = placesAll[gridId][daysDifference(startdate, a) + 4];
                            let t_cases = placesAll[gridId][35];
                            let r0s = stateR0(subtringBetween(placesAll[gridId][2], "Daerah: ", "<br>No:"), a);
                            state = subtringBetween(placesAll[gridId2][2], "Daerah: ", "<br>No:");
                            simulation.push([who, a.toISOString().split('T')[0], state, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                            //--------------------------------------------------------------------------------------------------------
                        }
                        else {
                            //---------------------------------------------------------------------------------------------------------
                            //who,date,state,lat,lon,cases,r0,t_R0,t_cases,t_vac_type,t_vac,t_SOPcomp, DR, TDR
                            let who = "No " + (y + 1) + " " + lifestyleParam[personnel[y][1]]['category'] + " age " + personnel[y][0];
                            let cases = "please cross-check";
                            let t_cases = "please cross-check";
                            let r0s = "r0";
                            state = "unknown";
                            simulation.push([who, a.toISOString().split('T')[0], state, lats, lons, cases, r0s, r0s, t_cases, 0, 0, 0, 0, 0]);
                            document.getElementById('Update').innerHTML += " (R0/RT @" + a.toISOString().split('T')[0] + " = " + r0s + ")";
                            //--------------------------------------------------------------------------------------------------------
                        }
                    }
                }

        }
    }
    document.getElementById('Update').innerHTML += "<br/><br/> Simulation Ends";
    document.getElementById("Samples").disabled = true;   //samples created
    document.getElementById("Simulate").disabled = true;   //Simulation done
    document.getElementById("Resolve").disabled = false;   //only enable once simulation is finished
    document.getElementById("Download").disabled = true;   //only enable once resolve is completed.
}


//------------------------
//Data loader functions  |
//------------------------

/**
 * Loads the RNaught values to the respective 'rNaughtxxx' arrays
 * 
 * @param {any} sourceFile
 * 
 */
async function LoadRNaughts(sourceFile) {
    let myPromise = new Promise(function (resolve) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", sourceFile);   //.csv file
        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var thisGrid = this.responseText;  //return object
                const data = csvToArray(thisGrid, ',');
                data.forEach(function (item, index) {
                    //maintain text format for simulation output. The compute engine will take over post simulation.
                    let loc = data[index]['location'];
                    let code = data[index]['code'];
                    let year = data[index]['year'];
                    let month = data[index]['month'];
                    let d01 = data[index]['d01']; var d02 = data[index]['d02'];
                    let d03 = data[index]['d03']; var d04 = data[index]['d04'];
                    let d05 = data[index]['d05']; var d06 = data[index]['d06'];
                    let d07 = data[index]['d07']; var d08 = data[index]['d08'];
                    let d09 = data[index]['d09']; var d10 = data[index]['d10'];
                    let d11 = data[index]['d11']; var d12 = data[index]['d12'];
                    let d13 = data[index]['d13']; var d14 = data[index]['d14'];
                    let d15 = data[index]['d15']; var d16 = data[index]['d16'];
                    let d17 = data[index]['d17']; var d18 = data[index]['d18'];
                    let d19 = data[index]['d19']; var d20 = data[index]['d20'];
                    let d21 = data[index]['d21']; var d22 = data[index]['d22'];
                    let d23 = data[index]['d23']; var d24 = data[index]['d24'];
                    let d25 = data[index]['d25']; var d26 = data[index]['d26'];
                    let d27 = data[index]['d27']; var d28 = data[index]['d28'];
                    let d29 = data[index]['d29']; var d30 = data[index]['d30'];
                    let d31 = data[index]['d31'];

                    //drop the last row if it contains NaN.
                    if (!(isNaN(code))) {
                        //console.log(loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31);
                        //location,code,year,month,d01,d02,d03,d04,d05,d06,d07,d08,d09,d10,d11,d12,d13,d14,d15,d16,d17,d18,d19,d20,d21,d22,d23,d24,d25,d26,d27,d28,d29,d30,d31
                        switch (loc) {
                            case "selangor":
                                rNaughtSL.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "sabah":
                                rNaughtSA.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "penang":
                                rNaughtPG.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "johor":
                                rNaughtJH.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "kelantan":
                                rNaughtKN.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "melaka":
                                rNaughtML.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "KL":
                                rNaughtKL.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "Labuan":
                                rNaughtLA.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "Putrajaya":
                                rNaughtPJ.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "negerisembilan":
                                rNaughtNS.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "kedah":
                                rNaughtKH.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "pahang":
                                rNaughtPH.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "perak":
                                rNaughtPK.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "terengganu":
                                rNaughtTE.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "sarawak":
                                rNaughtSK.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "perlis":
                                rNaughtPL.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            case "malaysia":
                                rNaughtMY.push([loc, code, year, month, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16, d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31]);
                                break;
                            default:
                                break;
                        }
                    }
                });
                //console.log("response resolved.");
                resolve(this.responseText);
            }
        };
        xhr.send();
    });
    await myPromise.then(() => {
        document.getElementById('Update').innerHTML += "(Async) R Naught MY data loaded => " + rNaughtMY.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught SL data loaded => " + rNaughtSL.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught KL data loaded => " + rNaughtKL.length + " records.<br/>";
        document.getElementById('Update').innerHTML += "(Async) R Naught PJ data loaded => " + rNaughtPJ.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught SA data loaded => " + rNaughtSA.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught PG data loaded => " + rNaughtPG.length + " records.<br/>";
        document.getElementById('Update').innerHTML += "(Async) R Naught JH data loaded => " + rNaughtJH.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught KN data loaded => " + rNaughtKN.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught ML data loaded => " + rNaughtML.length + " records.<br/>";
        document.getElementById('Update').innerHTML += "(Async) R Naught LA data loaded => " + rNaughtLA.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught NS data loaded => " + rNaughtNS.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught KH data loaded => " + rNaughtKH.length + " records.<br/>";
        document.getElementById('Update').innerHTML += "(Async) R Naught PH data loaded => " + rNaughtPH.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught PK data loaded => " + rNaughtPK.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught TE data loaded => " + rNaughtTE.length + " records.<br/>";
        document.getElementById('Update').innerHTML += "(Async) R Naught SK data loaded => " + rNaughtSK.length + " records. ";
        document.getElementById('Update').innerHTML += "(Async) R Naught PL data loaded => " + rNaughtPL.length + " records.<br/>";
        //report the upload status to the html page
    });
}


/**
 * Loads the summarized (filtered) list of the state's cases to 'places' array
 * 
 * @param {any} container
 * @param {any} sourceFile
 */
async function LoadStateCasesSummary(container, sourceFile) {
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
                        container.push([lt1, ln1, label1, locationname, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16,
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
    await myPromise.then((resolve) => {
        document.getElementById('Update').innerHTML += "(Async) Daily Summary loaded = " + places.length + " records.<br/>";
        //report the upload status to the html page
        return resolve;
    });
}

/**
 * Function to load all state's cases without filtering the container array (e.g. 'placesAll').
 * 
 * @param {any} container
 * @param {any} sourceFile
 */
async function LoadStateCasesFull(container, sourceFile) {
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
                        container.push([lt1, ln1, label1, locationname, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16,
                            d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31, ttl]);
                    }
                });
                //console.log("response resolved.");
                resolve(this.responseText);
            }
        };
        xhr.send();
    });
    await myPromise.then((resolve) => {
        document.getElementById('Update').innerHTML += "(Async) State Daily Records loaded = " + container.length + " records.<br/>";
        //report the upload status to the html page
        return resolve;
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

    var w = rd * Math.sqrt(u);   // w = rd * sqrt(u)
    var t = 2 * Math.PI * v;     // t = 2Πv
    var x = w * Math.cos(t);     // x = rd * sqrt(u) * cos (2Πv)
    var y = w * Math.sin(t);     // y = rd * sqrt(u) * sin (2Πv)

    //Adjust the x-coordinate for the shrinking of the east-west distances
    var xp = x / Math.cos(y0);

    var newlat = Math.abs(y + y0) >= 90 ? (y + y0) / 2 : (y + y0);
    var newlon = Math.abs(x + x0) >= 180 ? (x + x0) / 2 : (x + x0);
    var newlon2 = Math.abs(xp + x0) >= 180 ? (xp + x0) / 2 : (xp + x0);

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
        word.indexOf(beginning) + beginning.length,
        word.lastIndexOf(ending));
    return mySubString;

}


