/*
* By Steve Teoh v 1.1.0.0 @ 2021/12/02 User Travel Location Generator
* For Research Purposes only.
* Purpose: Simulation Tool
* Steve is an avid wargamer and crazy programmer that can code at amazing speed.
*/
let dateBegin = "20211101";
let dateEnd = "20211130";

//------------------------------
let baseaddress = "https://steveteoh.github.io";   //localhost = "http://localhost:1337";
let filename = "klangvalley"
var summaryfilename = "klangvalley_monthly_summary-2021-11.csv";
var primaryschfilename = "https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/vaccination/vax_school.csv";      //easier to read KKM hosted data
var secondaryschfilename = "https://raw.githubusercontent.com/MoH-Malaysia/covid19-public/main/vaccination/vax_school.csv";    //easier to read KKM hosted data
var iptafilename = "ipta.csv";                                                                                                 //self-hosted
var iptsfilename = "";                                                                                                         //self-hosted (to do)
let foldername = "selangor";

const delta_lat = 0.0077800;
const delta_lon = 0.0134817;

//------------------------------

//state maps with corresponding cases
//Note: Records loaded are filtered by (totalcases > 0) so that we remove non inhabitat areas like forests etc.
var places = [];
var placesAll = [];

var multiplier = 100;   //1=100samples, 10=1000samples, 100=10,000samples, 1000=100,000samples etc.

//Simulated personnel according to the age groups
var personnel = [];

//Simulation results container
var simulation = [];

//destinations for various types of students
var primary = [];
var secondary = [];
var unicollege = [];

//according to population.csv
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
//amendments: minimum must have one waypoint (i.e. present location)

var lifestyleParam = [
    { category: "children", min_days: 5, max_days: 7, fraction: 1, min_distance: 5000, max_distance: 10000, min_pts: 1, max_pts: 2 },                           //dest: random
    { category: "primary", min_days: 5, max_days: 6, fraction: 1, min_distance: 5000, max_distance: 10000, min_pts: 2, max_pts: 4 },                            //dest: primary
    { category: "secondary", min_days: 5, max_days: 6, fraction: 1, min_distance: 10000, max_distance: 20000, min_pts: 2, max_pts: 6 },                         //dest: secondary
    { category: "uni/college", min_days: 5, max_days: 6, fraction: 1, min_distance: 10000, max_distance: 20000, min_pts: 2, max_pts: 6 },                       //dest: ipta,ipts
    { category: "working people: general", min_days: 5, max_days: 6, fraction: 0.45, min_distance: 10000, max_distance: 40000, min_pts: 3, max_pts: 5 },        //dest: random
    { category: "working people: sales", min_days: 5, max_days: 6, fraction: 0.20, min_distance: 10000, max_distance: 100000, min_pts: 3, max_pts: 8 },         //dest: random
    { category: "working people: office", min_days: 5, max_days: 6, fraction: 0.15, min_distance: 10000, max_distance: 40000, min_pts: 3, max_pts: 5 },         //dest: random
    { category: "working people: not working", min_days: 0, max_days: 7, fraction: 0.15, min_distance: 0, max_distance: 50000, min_pts: 1, max_pts: 8 },        //dest: random
    { category: "working people: vacation", min_days: 1, max_days: 7, fraction: 0.025, min_distance: 100000, max_distance: 1000000, min_pts: 10, max_pts: 30 }, //dest: random
    { category: "working people: leave @ home", min_days: 1, max_days: 7, fraction: 0.025, min_distance: 0, max_distance: 80000, min_pts: 1, max_pts: 8 },      //dest: random
    { category: "retiree", min_days: 7, max_days: 7, fraction: 1, min_distance: 5000, max_distance: 10000, min_pts: 1, max_pts: 5 }                             //dest: random
]

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
    //to do download

    //End. Ready to run
}

//Random No Generators
//----------------------

//Random number generator to generate an integer in the range of (min, max)
function random(min, max) {
    return Math.floor(min + Math.random() * (max - min));   //Math.floor(Math.random() * 100)
}

//Weighted random number generator to generate an integer according to certain weightage.
//prerequisite: a list object must be supplied e.g. { 4: 0.45, 5: 0.2, 6: 0.15, 7: 0.15, 8: 0.025, 9: 0.025 }
function weightedRandom(list) {
    let i, sum = 0, r = Math.random();
    for (i in list) {
        sum += list[i];
        if (r <= sum) return i;
    }
}

//Search function
function searchPlace(lat, lon) {
    var smallest = Infinity;
    for (var i = 0; i < placesAll.length; i++) {
        var dist = distance(parseFloat(placesAll[i][0]), parseFloat(placesAll[i][1]), parseFloat(lat), parseFloat(lon));
        if (dist <= 1000) {
            return i;
        }
        else {
            //console.log(places[i][0] + "," + places[i][1] + "->" + i + " is " + dist + " apart");
        }
        if (dist < smallest)
            smallest = dist;
    }
    console.log("something is wrong - " + lat + "," + lon + " is not found. Smallest distance computed= " + smallest);
    return -1;
}

function startSimulation() {
    document.getElementById('Update').innerHTML += "-------------------------------------------------------<br/>";
    document.getElementById('Update').innerHTML += "Simulation Starts....</br>";
    //myAge, start, end, points, distance
    for (var y = 0; y < personnel.length; y++) {
        document.getElementById('Update').innerHTML += "<br><br>No " + (y + 1) + ". " + lifestyleParam[personnel[y][1]]['category'] + " age=" + personnel[y][0] + " ," +
            personnel[y][2] + "," + personnel[y][3] + ", waypt=" + personnel[y][4] + ", dist=" + personnel[y][5] + " m " + ((personnel[y][5] <= 1) ? "(static)" : " ");
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
                var gridId = searchPlace(parseFloat(primary[selection][5]), parseFloat(primary[selection][6]));   //grid id for school

                //generate home address
                var results = generateMapPoints(school, traveldistance, 1);  //generates distance from home to school (~ traveldistance)
                var lats = parseFloat(results[0].latitude);
                var lons = parseFloat(results[0].longitude2);
                var hdist = parseFloat(results[0].distance2);
                var home = { lat: lats, lng: lons };
                gridId = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

                // daily loop --> fix home and school, vary the rest.
                for (var a = startdate; a <= enddate; a++) {
                    var distance = traveldistance - hdist;                      //remaining distance
                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a + "] home address (" + home.lat + "," + home.lng + ") ";
                    //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                    if (gridId != -1)
                        document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        break;
                    }
                    //push school address
                    document.getElementById('Update').innerHTML += "<br> _________ school address (" + school.lat + "," + school.lng + ") @ " + primary[selection][1];
                    //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                    if (gridId != -1)
                        document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                    //distance between origin and destination
                    document.getElementById('Update').innerHTML += "<br> _________ home (" + home.lat + ", " + home.lng + ") to school (" + school.lat + "," + school.lng + ") =" + hdist + " m ";

                    // 2 waypoints and above 
                    starting_point = school;     //start from school
                    for (var b = 0; b < waypoints - 2; b++) {
                        var results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        var lats = parseFloat(results[0].latitude);
                        var lons = parseFloat(results[0].longitude2);
                        var cdist = parseFloat(results[0].distance2);
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        var gridId = searchPlace(lats, lons)
                        document.getElementById('Update').innerHTML += "<br>[" + a + "] school (" + school.lat + ", " + school.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";
                        //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                        if (gridId != -1)
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                        // + " remaining distance=" + distance + " m";
                    }
                }
                break;
            case 2:
                var starting_point = {};
                //generate secondary school address   //secondary -> code, school, state, district, postcode, lat1, lon1
                var selection = random(0, secondary.length);      //choose a secondary school (index) as destination
                var school2 = { lat: parseFloat(secondary[selection][5]), lng: parseFloat(secondary[selection][6]) };
                var gridId = searchPlace(parseFloat(secondary[selection][5]), parseFloat(secondary[selection][6]));   //grid id for secondary school

                //generate home address
                var results = generateMapPoints(school2, traveldistance, 1);  //generates distance from home to secondary school (~ traveldistance)
                var lats = parseFloat(results[0].latitude);
                var lons = parseFloat(results[0].longitude2);
                var hdist = parseFloat(results[0].distance2);
                var home = { lat: lats, lng: lons };
                gridId = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home


                // daily loop --> fix home and secondary school, vary the rest.
                for (var a = startdate; a <= enddate; a++) {
                    var distance = traveldistance - hdist;                      //remaining distance

                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a + "] home address (" + home.lat + "," + home.lng + ") ";
                    //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                    if (gridId != -1)
                        document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        break;
                    }
                    //push secondary school address
                    document.getElementById('Update').innerHTML += "<br> _________ secondary school address (" + school2.lat + "," + school2.lng + ") @ " + secondary[selection][1];
                    //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                    if (gridId != -1)
                        document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                    //distance between origin and destination
                    document.getElementById('Update').innerHTML += "<br> _________ home (" + home.lat + ", " + home.lng + ") to secondary school (" + school2.lat + "," + school2.lng + ") =" + hdist + " m ";

                    // 2 waypoints and above 
                    starting_point = school2;     //start from school
                    for (var b = 0; b < waypoints - 2; b++) {
                        var results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        var lats = parseFloat(results[0].latitude);
                        var lons = parseFloat(results[0].longitude2);
                        var cdist = parseFloat(results[0].distance2);
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        var gridId = searchPlace(lats, lons)
                        document.getElementById('Update').innerHTML += "<br>[" + a + "] secondary school (" + school2.lat + ", " + school2.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";
                        //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                        if (gridId != -1)
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                        // + " remaining distance=" + distance + " m";
                    }
                }
                break;
            case 3:
                var starting_point = {};
                //Uni/College -> No,Name,State,Code,Lat,Lon
                var selection = random(0, unicollege.length);      //choose a uni/college (index) as destination
                var uni = { lat: parseFloat(unicollege[selection][4]), lng: parseFloat(unicollege[selection][5]) };
                var gridId = searchPlace(parseFloat(unicollege[selection][4]), parseFloat(unicollege[selection][5]));   //grid id for uni

                //generate home address
                var results = generateMapPoints(uni, traveldistance, 1);  //generates distance from home to uni (~ traveldistance)
                var lats = parseFloat(results[0].latitude);
                var lons = parseFloat(results[0].longitude2);
                var hdist = parseFloat(results[0].distance2);
                var home = { lat: lats, lng: lons };
                gridId = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

                // daily loop --> fix home and uni, vary the rest.
                for (var a = startdate; a <= enddate; a++) {
                    var distance = traveldistance - hdist;                      //remaining distance

                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a + "] home address (" + home.lat + "," + home.lng + ") ";
                    //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                    if (gridId != -1)
                        document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        break;
                    }
                    //push uni address
                    document.getElementById('Update').innerHTML += "<br> _________ uni/college address (" + uni.lat + "," + uni.lng + ") @ " + unicollege[selection][1];
                    //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                    if (gridId != -1)
                        document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                    //distance between origin and destination
                    document.getElementById('Update').innerHTML += "<br> _________ home (" + home.lat + ", " + home.lng + ") to uni/college (" + uni.lat + "," + uni.lng + ") =" + hdist + " m ";

                    // 2 waypoints and above 
                    starting_point = uni;     //start from uni/college
                    for (var b = 0; b < waypoints - 2; b++) {
                        var results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        var lats = parseFloat(results[0].latitude);
                        var lons = parseFloat(results[0].longitude2);
                        var cdist = parseFloat(results[0].distance2);
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        var gridId = searchPlace(lats, lons)
                        document.getElementById('Update').innerHTML += "<br>[" + a + "] uni/college (" + uni.lat + ", " + uni.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";
                        //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                        if (gridId != -1)
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                        // + " remaining distance=" + distance + " m";
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
                var gridId = searchPlace(parseFloat(lats), parseFloat(lons));   //grid id for home

                // daily loop --> fix home, vary the rest.
                for (var a = startdate; a <= enddate; a++) {
                    var distance = traveldistance;            //init with total distance

                    // push home address
                    document.getElementById('Update').innerHTML += "<br>[" + a + "] home address (" + home.lat + "," + home.lng + ") ";
                    //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                    if (gridId != -1)
                        document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";

                    //if one waypoint, it is obviously home, no need to process further
                    if (waypoints == 1) {
                        starting_point = home;   //distance = 0;
                        break;
                    }

                    // 2 waypoints and above 
                    for (var b = 0; b < waypoints - 1; b++) {
                        var results = generateMapPoints(starting_point, distance, 1);  //generates one waypoint at a time
                        var lats = parseFloat(results[0].latitude);
                        var lons = parseFloat(results[0].longitude2);
                        var cdist = parseFloat(results[0].distance2);
                        distance = distance - cdist;                     //remaining distance
                        point = { lat: lats, lng: lons };                //next point
                        var gridId = searchPlace(lats, lons)
                        document.getElementById('Update').innerHTML += "<br>[" + a + "] home (" + home.lat + ", " + home.lng + ") to point " + b + " (" + point.lat + "," + point.lng + ") =" + cdist + " m ";
                        //To do: safety net for accidental generation of out of bounds coordinates e.g. dalam laut, luar negeri etc....
                        if (gridId != -1)
                            document.getElementById('Update').innerHTML += " at grid (" + placesAll[gridId][0] + "," + placesAll[gridId][1] + ") risk=" + placesAll[gridId][a - startdate + 4] + " active cases ";
                        // + " remaining distance=" + distance + " m";
                    }
                }

        }
    }
    document.getElementById('Update').innerHTML += "<br/><br/> Simulation Ends";
}

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
}

//lifestyle attribute is determined by ageGroup
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
            //Steve: for Python, there is a method called random.choices() but for javascript, you have to write your own
            break;
        case 5: lcode = 10; break; //retiree  - no fraction
        default: lcode = 0; //none of the above. children or babies?
    }
    return lcode; //lifestyle index
}

//---------------------------------------------------
//Data loading functions

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
    });
}

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
                        //console.log(lt1, ln1, label1, locationname, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16,
                        //    d17, d18, d19, d20, d21, d22, d23, d24, d25, d26, d27, d28, d29, d30, d31, ttl);
                        places.push([lt1, ln1, label1, locationname, d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11, d12, d13, d14, d15, d16,
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
        document.getElementById('Update').innerHTML += "(Async) Daily Summary loaded = " + places.length + " records.<br/>";
    });
}

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
                    var levelcode = code.substring(1, 2);
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
        document.getElementById('Update').innerHTML += "(Async) State: " + statecode + ((level >= 2) ? " Secondary (level " : " Primary (level ") + level + ") schools loaded. Total = " + container.length + " records now.<br/>";
    });
}

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
        document.getElementById('Update').innerHTML += "(Async) State: " + statecode + " Uni/College loaded. Total " + container.length + " records now.<br/>";
    });
}

//Location Computation Functions
//--------------------------------

//Generate a number of mappoints
//Refer: https://stackoverflow.com/questions/31192451/generate-random-geo-coordinates-within-specific-radius-from-seed-point
function generateMapPoints(centerpoint, distance, amount) {
    var mappoints = [];
    for (var i = 0; i < amount; i++) {
        mappoints.push(randomGeo(centerpoint, distance));
    }
    return mappoints;
}

//Create random lat/long coordinates in a specified radius around a center point
//Refer: https://stackoverflow.com/questions/31192451/generate-random-geo-coordinates-within-specific-radius-from-seed-point
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
        'haversine_distance': haversine_distance(center.lat, center.lng, newlat, newlon).toFixed(2),
        'haversine_distance2': haversine_distance(center.lat, center.lng, newlat, newlon2).toFixed(2),
    };
}

//Calc the distance between 2 coordinates as the crow flies
//Refer: https://stackoverflow.com/questions/31192451/generate-random-geo-coordinates-within-specific-radius-from-seed-point
function distance(lat1, lon1, lat2, lon2) {
    var R = 6371000;
    var a = 0.5 - Math.cos((lat2 - lat1) * Math.PI / 180) / 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * (1 - Math.cos((lon2 - lon1) * Math.PI / 180)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}


/**
 * By Steve
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


//To modify
function saveFile() {
    //export CSV file
    var header = "lat,lon,label,placename";
    for (var i = dateBegin; i <= dateEnd; i++) {
        header += "," + i;
    }
    header += ",total";
    exportToCsvFile(header, places, statename + "_summary");
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
    download(url, filename + '.csv');
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
