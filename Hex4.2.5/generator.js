const PLACE_BOUNDS = {
    name: "Subang Jaya",
    north: 3.085027,
    south: 2.976325,
    west: 101.549597,
    east: 101.730601,
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
    //name: "Kuala Langat",
    //north: 2.978663,
    //south: 2.643984,
    //west: 101.286413,
    //east: 101.681967,
    //name: "Hulu Selangor",
    //north: 3.804692,	
    //south: 3.321608,
    //west: 101.319496,
    //east: 101.814739,
    //name: "Ampang Jaya",
    //north: 3.292435,
    //south: 3.081443,
    //west: 101.733063,
    //east: 101.853560,
    //name: "Sepang",
    //north: 3.012039,   //Sepang
    //south: 2.594652,   //Sepang
    //west: 101.589953,  //Sepang
    //east: 101.78966,   //Sepang
    //name: "Klang",
    //north: 3.19289,   //Klang
    //south: 2.88442,   //Klang
    //west: 101.199003, //Klang
    //east: 101.524080, //Klang
    //name: "Kuala Selangor",
    //north: 3.600198,  
    //south: 3.165252,  
    //west: 101.101054, 
    //east: 101.492745, 
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

var places = [];
var lt1 = 0, ln1 = 0;
var lt2 = 0, ln2 = 0;
var pos = {};

const delta_lat = 0.00389;
const delta_lon = 0.006745;
const cols = (PLACE_BOUNDS.north - PLACE_BOUNDS.south) / delta_lat; // 105.05 -> 106
const rows = (PLACE_BOUNDS.east - PLACE_BOUNDS.west) / delta_lon;    // 36.89  -> 37

function generatePoints() {
    let counter = 0;
    for (let k = 0; -(2 * k) * delta_lat + PLACE_BOUNDS.north >= PLACE_BOUNDS.south; ++k) {
        lt1 = -(2 * k) * delta_lat + PLACE_BOUNDS.north;
        lt2 = -(2 * k + 1) * delta_lat + PLACE_BOUNDS.north;
        for (let l = 0; (2 * l) * delta_lon + PLACE_BOUNDS.west <= PLACE_BOUNDS.east; ++l) {
            ln1 = (2 * l) * delta_lon + PLACE_BOUNDS.west;
            ln2 = (2 * l + 1) * delta_lon + PLACE_BOUNDS.west;

            pos = { lat: lt1, lng: ln1 };
            counter++;
            var label1 = "Daerah: " + mapID + "<br>No:" + counter + "<br>Hex coord:(" + (2 * l).toString() + "," + (k).toString() + ")";
            var weeklyactive = 0;
            var totalactive = 0;
            var weeklyrecovered = 0;
            var totalrecovered = 0;
            var weeklydeaths = 0;
            var totaldeaths = 0;
            places.push([lt1, ln1, label1, 'place name', weeklyactive, totalactive, weeklyrecovered, totalrecovered, weeklydeaths, totaldeaths, totalactive / totalrecovered, '2021-08-15T12:11:01.587Z']);

            pos = { lat: lt2, lng: ln2 };

            counter++;
            var label2 = "Daerah: " + mapID + "<br>No:" + counter + "<br>Hex coord:(" + (2 * l + 1).toString() + "," + (k).toString() + ")";
            var weeklyactive = Math.floor(Math.random() * 101); // generates a random integer from 0 to 100:
            var totalactive = Math.floor(Math.random() * 1001); // generates a random integer from 0 to 1000:
            var weeklyrecovered = Math.floor(Math.random() * 101); // generates a random integer from 0 to 100:
            var totalrecovered = Math.floor(Math.random() * 1001); // generates a random integer from 0 to 1000:
            var weeklydeaths = Math.floor(Math.random() * 11); // generates a random integer from 0 to 10:
            var totaldeaths = Math.floor(Math.random() * 101); // generates a random integer from 0 to 100:
            places.push([lt2, ln2, label2, 'place name', weeklyactive, totalactive, weeklyrecovered, totalrecovered, weeklydeaths, totaldeaths, totalactive / totalrecovered, '2021-08-15T12:11:01.587Z']);

        }
    }
}