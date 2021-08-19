var map;
var pointCount = 0;
var locations = [];
var gridWidth = 1000; // hex tile size in meters
var bounds;

var places = [
  [3.0350, 101.7805],
  [3.0395, 101.7940],
  [3.0395, 101.8120],

  /* Horizontal
  [3.0395, 101.7784],
  [3.0395, 101.7940],
  [3.0395, 101.8096],
  */
   /* [4.3, 109.5],            //this is in the middle of south china sea
      [3.0395, 101.7940],      //UTAR lah
      [3.037685, 101.7939424], //my sensed area
   */
]

var SQRT3 = 1.73205080756887729352744634150587236;

$(document).ready(function(){
  
  bounds = new google.maps.LatLngBounds();
  
  map = new google.maps.Map(document.getElementById("map_canvas"), {center: {lat: 0, lng: 0}, zoom: 6});
  
  // Adding a marker just so we can visualize where the actual data points are.
  // In the end, we want to see the hex tile that contain them
  places.forEach(function(place, p){
    
    latlng = new google.maps.LatLng({lat: place[0], lng: place[1]});
    marker = new google.maps.Marker({position: latlng, map: map})
    
    // Fitting to bounds so the map is zoomed to the right place
    bounds.extend(latlng);
  });
  
  map.fitBounds(bounds);
  
  // Now, we draw our hexagons! (or try to)
  locations = makeBins(places);
  
  locations.forEach(function(place, p){
    //drawHorizontalHexagon(map, place, gridWidth);
    drawVerticalHexagon(map, place, gridWidth);
  })
    
    
});

function drawVerticalHexagon(map, position, radius){
  var coordinates = [];
  for(var angle= 30;angle < 360; angle+=60) {
     coordinates.push(google.maps.geometry.spherical.computeOffset(position, radius, angle));    
  }

  var color = 'rgb(255, 94, 0)';

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