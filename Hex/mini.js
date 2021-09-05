var map = null
    , myfeature = {}
    , mygeometry = {}
    , pointCount = 0
    , locations = []
    , gridWidth = 500
    , bounds = null
    , markers = []
    , places = []
    , lt1 = 0
    , ln1 = 0
    , lt2 = 0
    , ln2 = 0
    , pos = {};
const MAP_BOUNDS = {
    north: 10.316892,
    south: -4.9452478,
    west: 95.2936829,
    east: 121.0019857
};
var stateRequestURL = "https://steveteoh.github.io/Hex/Selangor/selangor.json"
    , districtRequestURL = "https://steveteoh.github.io/Hex/Selangor/daerah/hulu_langat.json"
    , mapID = "Hulu Langat";
const PLACE_BOUNDS = {
    name: "Hulu Langat",
    north: 3.275179,
    south: 2.866524,
    west: 101.721198,
    east: 101.97006
}
    , delta_lat = .00389
    , delta_lon = .006745
    , cols = (PLACE_BOUNDS.north - PLACE_BOUNDS.south) / .00389
    , rows = (PLACE_BOUNDS.east - PLACE_BOUNDS.west) / .006745
    , grey = "rgb(77, 77, 77)"
    , green = "rgb(0, 255, 0)"
    , yellow = "rgb(255, 255, 0)"
    , orange = "rgb(255, 82, 0)"
    , red = "rgb(255, 0, 0)"
    , greenlevel = 10
    , yellowlevel = 50
    , orangelevel = 99;
var SQRT3 = 1.7320508075688772;
function handleLocationError(e, o, t) {
    o.setPosition(t),
        o.setContent(e ? "Error: The Geolocation service failed." : "Error: Your browser doesn't support geolocation."),
        o.open(map)
}
function isInside(e, o) {
    var t = e.getArray()
        , n = new google.maps.LatLng(o)
        , a = !1;
    return t.every(function (e, o) {
        var t = e.getAt(0).getArray()
            , r = new google.maps.Polygon({
                paths: t
            });
        return google.maps.geometry.poly.containsLocation(n, r) ? (a = !0,
            !1) : (a = !1,
                !0)
    }),
        a
}
function attachMessage(e, o) {
    const t = new google.maps.InfoWindow({
        content: o
    });
    e.addListener("click", () => {
        t.open(e.get("map_canvas"), e)
    }
    )
}
function setMapOnAll(e) {
    for (let o = 0; o < markers.length; o++)
        markers[o].setMap(e)
}
function hideMarkers() {
    setMapOnAll(null)
}
function showMarkers() {
    setMapOnAll(map)
}
function drawVerticalHexagon(e, o, t) {
    for (var n = o[1] > orangelevel ? red : o[1] > yellowlevel ? orange : o[1] > greenlevel ? yellow : green, a = [], r = 30; r < 360; r += 60)
        a.push(google.maps.geometry.spherical.computeOffset(o[0], t, r));
    new google.maps.Polygon({
        paths: a,
        position: o,
        strokeColor: n,
        strokeOpacity: .8,
        strokeWeight: 2,
        fillColor: n,
        fillOpacity: .3,
        geodesic: !0
    }).setMap(e)
}
function drawHorizontalHexagon(e, o, t) {
    for (var n = o[1] > orangelevel ? red : o[1] > yellowlevel ? orange : o[1] > greenlevel ? yellow : green, a = [], r = 0; r < 360; r += 60)
        a.push(google.maps.geometry.spherical.computeOffset(o[0], t, r));
    new google.maps.Polygon({
        paths: a,
        position: o,
        strokeColor: n,
        strokeOpacity: .8,
        strokeWeight: 2,
        fillColor: n,
        fillOpacity: .15,
        geodesic: !0
    }).setMap(e)
}
function getGeoJSONFile(e, o) {
    let t = new XMLHttpRequest;
    t.open("GET", e),
        t.responseType = "text",
        t.send(),
        t.onload = function () {
            const e = t.response;
            loadGeoJsonString(o, e)
        }
}
function loadGeoJsonString(e, o) {
    try {
        const t = JSON.parse(o);
        map.data.addGeoJson(t),
            map.data.setStyle({
                fillColor: e,
                fillOpacity: .1,
                strokeWeight: 1
            })
    } catch (e) {
        return void alert("Not a GeoJSON file!")
    }
    zoom(map)
}
function zoom(e) {
    const o = new google.maps.LatLngBounds;
    console.log("bounds:" + o.toString()),
        e.data.forEach(e => {
            const t = e.getGeometry();
            t && (console.log("geometry detected"),
                processPoints(t, o.extend, o))
        }
        ),
        e.fitBounds(o)
}
function processPoints(e, o, t) {
    e instanceof google.maps.LatLng ? o.call(t, e) : e instanceof google.maps.Data.Point ? o.call(t, e.get()) : e.getArray().forEach(e => {
        processPoints(e, o, t)
    }
    )
}
function distance(e, o, t, n) {
    result = Math.sqrt((e - t) * (e - t) + (o - n) * (o - n))
}
function nearestCenterPoint(e, o) {
    return div = e / (o / 2),
        mod = e % (o / 2),
        div % 2 == 1 ? increment = 1 : increment = 0,
        rounded = o / 2 * (div + increment),
        div % 2 == 0 ? increment = 1 : increment = 0,
        rounded_scaled = o / 2 * (div + increment),
        result = [rounded, rounded_scaled],
        result
}
function makeBins(e) {
    return bins = [],
        e.forEach(function (e, o) {
            x = e[0],
                y = e[1],
                cases = e[4],
                px_nearest = nearestCenterPoint(x, gridWidth),
                py_nearest = nearestCenterPoint(y, gridWidth * SQRT3),
                z1 = distance(x, y, px_nearest[0], py_nearest[0]),
                z2 = distance(x, y, px_nearest[1], py_nearest[1]),
                z1 > z2 ? bin = new google.maps.LatLng({
                    lat: px_nearest[0],
                    lng: py_nearest[0]
                }) : bin = new google.maps.LatLng({
                    lat: px_nearest[1],
                    lng: py_nearest[1]
                }),
                bins.push([bin, cases])
        }),
        bins
}
$(window).load(function () {
    bounds = new google.maps.LatLngBounds,
        map = new google.maps.Map(document.getElementById("map_canvas"), {
            center: {
                lat: 0,
                lng: 0
            },
            scaleControl: !0,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
    var e = new google.maps.InfoWindow({
        map: map
    });
    navigator.geolocation ? navigator.geolocation.getCurrentPosition(o => {
        pos = {
            lat: o.coords.latitude,
            lng: o.coords.longitude
        },
            e.setPosition(pos),
            e.setContent("Your Location"),
            e.open(map),
            map.setCenter(pos)
    }
        , () => {
            handleLocationError(!0, e, map.getCenter())
        }
    ) : handleLocationError(!1, e, map.getCenter());
    var o = new google.maps.Data;
    o.loadGeoJson(districtRequestURL, {
        idPropertyName: "name"
    }, function (e) {
        myfeature = o.getFeatureById(mapID),
            o.forEach(e => {
                mygeometry = e.getGeometry();
                let o = 0;
                for (let e = 0; -2 * e * .00389 + PLACE_BOUNDS.north >= PLACE_BOUNDS.south; ++e) {
                    lt1 = -2 * e * .00389 + PLACE_BOUNDS.north,
                        lt2 = .00389 * -(2 * e + 1) + PLACE_BOUNDS.north;
                    for (let c = 0; 2 * c * .006745 + PLACE_BOUNDS.west <= PLACE_BOUNDS.east; ++c) {
                        if (ln2 = .006745 * (2 * c + 1) + PLACE_BOUNDS.west,
                            1 == isInside(mygeometry, pos = {
                                lat: lt1,
                                lng: ln1 = 2 * c * .006745 + PLACE_BOUNDS.west
                            })) {
                            var t = "Daerah: " + mapID + "<br>No:" + ++o + "<br>Hex coord:(" + (2 * c).toString() + "," + e.toString() + ")"
                                , n = Math.floor(101 * Math.random())
                                , a = Math.floor(1001 * Math.random())
                                , r = Math.floor(101 * Math.random())
                                , s = Math.floor(1001 * Math.random())
                                , l = Math.floor(11 * Math.random())
                                , i = Math.floor(101 * Math.random());
                            places.push([lt1, ln1, t, "place name", n, a, r, s, l, i, a / s, "2021-08-15T12:11:01.587Z"])
                        }
                        if (1 == isInside(mygeometry, pos = {
                            lat: lt2,
                            lng: ln2
                        })) {
                            var g = "Daerah: " + mapID + "<br>No:" + ++o + "<br>Hex coord:(" + (2 * c + 1).toString() + "," + e.toString() + ")";
                            n = Math.floor(101 * Math.random()),
                                a = Math.floor(1001 * Math.random()),
                                r = Math.floor(101 * Math.random()),
                                s = Math.floor(1001 * Math.random()),
                                l = Math.floor(11 * Math.random()),
                                i = Math.floor(101 * Math.random());
                            places.push([lt2, ln2, g, "place name", n, a, r, s, l, i, a / s, "2021-08-15T12:11:01.587Z"])
                        }
                    }
                }
            }
            ),
            places.forEach(function (e, o) {
                latlng = new google.maps.LatLng({
                    lat: e[0],
                    lng: e[1]
                });
                const t = new google.maps.Marker({
                    position: latlng,
                    map: map,
                    label: `${o + 1}`,
                    title: e[3]
                });
                t.setIcon("http://maps.google.com/mapfiles/ms/icons/blue.png"),
                    attachMessage(t, e[2] + " : " + e[3] + "<br>Coordinates: (" + e[0] + "," + e[1] + ")<br>Weekly Active cases: " + e[4] + "       | Total Active cases: " + e[5] + "<br>Weekly Deaths: " + e[6] + "       | Total Deaths: " + e[7] + "<br>Weekly Recovered:" + e[8] + "       | Total Recovered:" + e[9] + "<br>Weight:" + e[10] + "<br>Timestamp: " + e[11]),
                    markers.push(t),
                    bounds.extend(latlng)
            }),
            map.fitBounds(bounds),
            document.getElementById("show-markers").addEventListener("click", showMarkers),
            document.getElementById("hide-markers").addEventListener("click", hideMarkers),
            (locations = makeBins(places)).forEach(function (e, o) {
                drawVerticalHexagon(map, e, gridWidth)
            })
    }),
        o.setStyle({
            fillColor: red,
            fillOpacity: .1,
            strokeWeight: 1
        }),
        hideMarkers(),
        map.data.loadGeoJson(stateRequestURL),
        map.data.setStyle({
            fillColor: grey,
            fillOpacity: .1,
            strokeWeight: 1
        })
});