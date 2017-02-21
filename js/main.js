//Step 3: Add circle markers for point features to the map

function createMap(){
    //create the map
    var map = L.map('map', {
        center: [37, -95],
        zoom: 4    });

    //add OSM base tilelayer
    L.tileLayer( 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGV0ZXJuaWVsc2VuIiwiYSI6ImNpeXZxaWtzYTAwMmkzM24zMDd2MGRjcGMifQ.1f7rKmGUkT94RKJJr825Rg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    }).addTo(map);

    //call getData function
   getData(map);
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/Airport-data.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};

function createPropSymbols(data, map){
    //create marker options
    var attribute = "CY 15 Enplanements";
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
             var attValue = Number(feature.properties[attribute]);
            console.log(feature.properties[attribute]);
            geojsonMarkerOptions.radius = calcPropRadius(attValue);
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};

function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = .00005;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};



$(document).ready(createMap);