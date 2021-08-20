/*
Modified by Steve Teoh for local use @ 2021/08/19
*/

var map;
var pointCount = 0;
var locations = [];
var gridWidth = 500; // hex tile width
var bounds;

// Places should be automatically generated in future version
// using just north, south, east and west boundary cordinates.
const PLACE_BOUNDS = {
      north: 10.316892,
      south: -4.9452478,
      west: 95.2936829,
      east: 121.0019857,
  };

var places = [
  //vertical hex  
  [3.05503, 101.79400, 1,"north_2"],
  [3.04728, 101.78049, 2,"northwest_2"],
  [3.04728, 101.80753, 3,"northeast_2"],
  [3.0395, 101.780490, 4,"west_2"],
  [3.0395, 101.807530, 5,"east_2"],
  [3.04339, 101.78725, 6,"northwest"],
  [3.04726, 101.79400, 7,"north"],
  [3.04339, 101.80075, 8,"northeast"],
  [3.03950, 101.79400, 9,"centre - UTAR"],
  [3.03562, 101.78725, 10,"southwest"],
  [3.03173, 101.79400, 11,"south"],
  [3.03562, 101.80075, 12,"southeast"],
  [3.03173, 101.78049, 13,"southwest_2"],
  [3.03173, 101.80753, 14,"southeast_2"],
  [3.02398, 101.79400, 15,"south_2"],

  /* Horizontal hex - not used
  [3.0395, 101.7784],
  [3.0395, 101.7940],
  [3.0395, 101.8096],
  [4.3, 109.5],            //this is in the middle of south china sea
  [3.0395, 101.7940],      //UTAR lah
  [3.037685, 101.7939424], //my sensed area
   */
]

var SQRT3 = 1.73205080756887729352744634150587236;   // sqrt(3)

//This is the limit for map panning. Not implemented for the time being.
const MAP_BOUNDS = {
        north: 10.316892,
        south: -4.9452478,
        west: 95.2936829,
        east: 121.0019857,
  };

$(document).ready(function(){

  bounds = new google.maps.LatLngBounds();
 
  map = new google.maps.Map(document.getElementById("map_canvas"), {
        center: {lat: 0, lng: 0}, 
        scaleControl: true,
        zoom: 6,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        //latLngBounds: MAP_BOUNDS,
   });
  
  // Adding a marker just so we can visualize where the actual data points are.
  places.forEach(function(place, p){
    //infowindow = new google.maps.InfoWindow({content: place[2]+': ('+place[0]+','+place[1]+')' });
    latlng = new google.maps.LatLng({lat: place[0], lng: place[1]});  
    marker = new google.maps.Marker({
             position: latlng, 
             map: map, 
             label: `${p + 1}`,
             title: place[3],
    });
    attachMessage(marker, place[2]+': ('+place[0]+','+place[1]+')');

    //marker.addListener("click", () => {
    //infowindow.open(marker.get("map_canvas"), marker);
    //infowindow.open({anchor: marker, map,shouldFocus: true,});
    //});

    // Fitting to bounds so the map is zoomed to the right place
    bounds.extend(latlng);
  });
  
  map.fitBounds(bounds);
  
  // Now, we draw our hexagons! (or try to)
  locations = makeBins(places);
  
  locations.forEach(function(place, p){
    // horizontal hex are not so useful
    // drawHorizontalHexagon(map, place, gridWidth);
    drawVerticalHexagon(map, place, gridWidth);
  })
    
    
});

 // Attaches an info window to a marker with the provided message. When the
 // marker is clicked, the info window will open with the message.
 function attachMessage(marker, Message) {
   const infowindow = new google.maps.InfoWindow({
     content: Message,
   });
   marker.addListener("click", () => {
     infowindow.open(marker.get("map"), marker);
   });
 }

 function drawVerticalHexagon(map, position, radius){
   var coordinates = [];
   for(var angle= 30;angle < 360; angle+=60) {
      coordinates.push(google.maps.geometry.spherical.computeOffset(position, radius, angle));    
   }

   //var color = 'rgb(255, 94, 0)';  //orange
   var color = 'rgb(255, 0, 0)';  //red

   // Construct the polygon.
   var polygon = new google.maps.Polygon({
       paths: coordinates,
       position: position,
       strokeColor: color,
       strokeOpacity: 0.8,
       strokeWeight: 2,
       fillColor: color,
       fillOpacity: 0.35,
       geodesic: true
    });
    polygon.setMap(map);
  }

  function drawHorizontalHexagon(map, position, radius){
    var coordinates = [];
    for(var angle= 0;angle < 360; angle+=60) {
       coordinates.push(google.maps.geometry.spherical.computeOffset(position, radius, angle));    
    }

    // Construct the polygon.
    var polygon = new google.maps.Polygon({
        paths: coordinates,
        position: position,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        geodesic: true
    });
    polygon.setMap(map);
}

// Below is my attempt at porting binner.py to Javascript.
// Source: https://github.com/coryfoo/hexbins/blob/master/hexbin/binner.py

function distance(x1, y1, x2, y2){
  console.log(x1, y1, x2, y2);
  result =  Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
  console.log("Distance: ", result);
  return
}

function nearestCenterPoint(value, scale){
    div = value / (scale/2);
    console.log("div", div);
    mod = value % (scale/2);
    console.log("mod", mod);
    
    if(div % 2 == 1){
      increment = 1;
    } else{
      increment = 0;
    }
    
    rounded = scale / 2 * (div + increment);
    
    if(div % 2 === 0){
      increment = 1;
    } else{
      increment = 0;
    }
    
    rounded_scaled = scale / 2 * (div + increment);
    
    result = [rounded, rounded_scaled]
    console.log("nearest centerpoint to", value, result);
    return result;
}

function makeBins(data){
  bins = [];
  
  data.forEach(function(place, p){
    x = place[0];
    y = place[1];
    
    console.log("Original location:", x, y);
    
    px_nearest = nearestCenterPoint(x, gridWidth);
    
    py_nearest = nearestCenterPoint(y, gridWidth * SQRT3);
    
    z1 = distance(x, y, px_nearest[0], py_nearest[0]);
    z2 = distance(x, y, px_nearest[1], py_nearest[1]);
    
    if(z1 > z2){
      bin = new google.maps.LatLng({lat: px_nearest[0], lng: py_nearest[0]});
       console.log("Final location:", px_nearest[0], py_nearest[0]);
    } else {
      bin = new google.maps.LatLng({lat: px_nearest[1], lng: py_nearest[1]});
       console.log("Final location:", px_nearest[1], py_nearest[1]);
    }
  
    bins.push(bin);
    
  })
  return bins;
}