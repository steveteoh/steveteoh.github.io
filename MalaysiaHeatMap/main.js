const calcRotation = degree => ({
  xVector: {
    x: Math.cos(degree / 180 * Math.PI),
    y: Math.sin(degree / 180 * Math.PI)
  },
  yVector: {
    x: Math.cos((degree + 90) / 180 * Math.PI),
    y: Math.sin((degree + 90) / 180 * Math.PI)
  }
});
const squareFactory = function*(generator, width, height, step = 1, { x: xOffset, y: yOffset } = { x: 0, y: 0 }){
  yield* generator;
  for(let y = 0; y < height; ++y){
    for(let x = 0; x < width; ++x){
      yield [xOffset + x * step, yOffset + y * step];
    } 
  }
}
const rotationFactory = function*(generator, degree, { x: xAnchor, y: yAnchor } = { x: 0, y: 0 }){
  const { xVector, yVector } = calcRotation(degree);
  for(const [x, y] of generator){
    let xAfter = xAnchor;
    let yAfter = yAnchor;
    const xOrigin = x - xAnchor;
    const yOrigin = y - yAnchor;
    xAfter += xVector.x * xOrigin;
    yAfter += xVector.y * xOrigin;
    xAfter += yVector.x * yOrigin;
    yAfter += yVector.y * yOrigin;
    yield [xAfter, yAfter];
  }
}
const degreeToGradient = degree => Math.tan(degree / 180 * Math.PI);
const filterLineXFactory = function*(generator, degree, { x: xOffset, y: yOffset }, below){
  const gradient = degreeToGradient(degree);
  for(const [x, y] of generator){
    const xAnchor = x - xOffset;
    const yAnchor = y - yOffset;
    const expected = gradient * xAnchor;
    const include = below ? expected <= yAnchor : expected >= yAnchor;
    if(!include) continue;
    yield [x, y];
  }
}
const factories = {
  square: squareFactory,
  rotate: rotationFactory,
  filterLineX: filterLineXFactory
}
const buildArea = function*(operations){
  let lastGen = (function*(){})();
  for(const op of operations){
    const type = op.shift();
    if(!(type in factories)) continue;
    const factory = factories[type];
    lastGen = factory(lastGen, ...op);
  }
  yield* lastGen;
}
const generatePoints = ({ area, data }) => {
  const points = buildArea(area);
  const output = [];
  for(let index = 0; index < data.length; ++index){
    if(data[index] === 0){
      points.next();
      for(let amount = data[++index]; amount--; points.next());
      continue;
    }
    const cases = data[index];
    const [x, y] = points.next().value;
    output.push({
      location: new google.maps.LatLng(y, x),
      weight: Math.log(cases)
    });
  }
  return output;
}

var map = null, areas = null, largest = null, heatmaps = [];
const fetchAPI = api => {
  return fetch(`./data/${api}.json`)
    .then(res => res.json());
}
var updateHeatmap = async () => {
  areas = await Promise.all(
    'east,west'.split(',').map(area => fetchAPI(area))
  );
  if(heatmaps.length) heatmaps.forEach(hm => hm.setMap(null));
  heatmaps.splice(0);
  for(const area of areas){
    const heatmap = new google.maps.visualization.HeatmapLayer({
      data: generatePoints(area), dissipating: false, radius: 0.01, opacity = 0
    });
    //heatmap.set("radius", heatmap.get("radius") ? null : 20);
    heatmaps.push(heatmap);
  }
  document.getElementById('lastUpdateAt').innerText = `Last update at: ${new Date().toLocaleString()}`;
  document.getElementById('eastUpdatedAt').innerText = `East Malaysia last updated on: ${new Date(areas[0].updatedAt).toLocaleString()}`;
  document.getElementById('westUpdatedAt').innerText = `West Malaysia last updated on: ${new Date(areas[1].updatedAt).toLocaleString()}`;
  if(document.getElementById('heatmapButton').textContent === 'Hide C-19 Heatmap') heatmaps.forEach(hm => hm.setMap(map));
}
let userLocation = undefined;
var locationButton = async () => {
  const button = document.getElementById('locationButton');
  switch(button.textContent){
    case 'Show My Location': {
      if(userLocation !== undefined) return;
      userLocation = null;
      const location = await new Promise((rs, rj) => navigator.geolocation.getCurrentPosition(rs, rj))
        .catch(err => void(alert(`Error occurred: ${err.message}`)));
      if(location === undefined) {
        userLocation = undefined;
        return;
      }
      const center = {
        lat: location.coords.latitude,
        lng: location.coords.longitude
      };
      userLocation = {
        pointer: new google.maps.Marker({
          position: center,
          map: map
        }),
        circle: new google.maps.Circle({
          strokeColor: '#addfff',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#addfff',
          fillOpacity: 0.3,
          map,
          center: center,
          radius: location.coords.accuracy,
        })
      }
      button.textContent = 'Hide My Location';
    } break;
    case 'Hide My Location': {
      userLocation.pointer.setMap(null);
      userLocation.circle.setMap(null);
      userLocation = undefined;
      button.textContent = 'Show My Location';
    } break;
  }
}
var heatmapButton = () => {
  if(map === null || heatmaps.length === 0) return;
  const button = document.getElementById('heatmapButton');
  switch(button.textContent){
    case 'Show C-19 Heatmap': {
      heatmaps.forEach(hm => hm.setMap(map));
      button.textContent = 'Hide C-19 Heatmap';
    } break;
    case 'Hide C-19 Heatmap': {
      heatmaps.forEach(hm => hm.setMap(null));
      button.textContent = 'Show C-19 Heatmap';
    } break;
  }
}

var initMap = async () => {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 3.04, lng: 101.79 },
    zoom: 7, controlSize: 40,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: true
  });
  updateHeatmap();
  const deckOverlay = new deck.GoogleMapsOverlay({
    layers: [
      new deck.GeoJsonLayer({
        id: "earthquakes",
        data: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
        filled: true,
        pointRadiusMinPixels: 2,
        pointRadiusMaxPixels: 200,
        opacity: 0.4,
        pointRadiusScale: 0.3,
        getRadius: (f) => Math.pow(10, f.properties.mag),
        getFillColor: [255, 70, 30, 180],
        autoHighlight: true,
        transitions: {
          getRadius: {
            type: "spring",
            stiffness: 0.1,
            damping: 0.15,
            enter: (_) => [0],
            duration: 10000,
          },
        },
        onDataLoad: (_) => {
          progress.done(); // hides progress bar
        },
      }),
    ],
  });
  deckOverlay.setMap(map);
}