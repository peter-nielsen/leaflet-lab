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
            var attributes = processData(response);
            console.log(attributes);
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);
        }
    });
};

function createPropSymbols(data, map, attributes){
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
        pointToLayer: function (feature, latlng ) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

function calcPropRadius(attValue, scaleIndex) {
    //scale factor to adjust symbol size evenly
    
    //area based on attribute value and scale factor
    var area = attValue * scaleIndex;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Determine which attribute to visualize with proportional symbols
    var attribute = attributes[0];
   
    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    //For each feature, determine its value for the selected attribute
    var scaleIndex = .00005;
    var attValue = Number(feature.properties[attribute]);
    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue, scaleIndex);
    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    //build popup content string
    var panelContent = "<p><b>City:</b> " + feature.properties.City + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";
    
    var popupContent = feature.properties.City;
    //bind the popup to the circle marker
    
    
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        },
        click: function(){
            $("#data").html(panelContent);
        }
    });
     layer.bindPopup(popupContent, {
        offset: new L.Point(0,-options.radius),
        closeButton: false
    });
    
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};


//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
    //Example 3.3 line 1...create range input element (slider)
    $('#sequence_control').append('<input class="range-slider" type="range">');
console.log(attributes);
    //set slider attributes
    $('.range-slider').attr({
        max: 7,
        min: 0,
        value: 0,
        step: 1
    });
     $('#sequence_control').append('<button class="skip" id="reverse">Reverse</button>');
    $('#sequence_control').append('<button class="skip" id="forward">Skip</button>');
     $('#sequence_control').append('<input class="size-slider" type="range">');
    //set slider attributes
    $('.size-slider').attr({
        max: .0001,
        min: 0.00001,
        value: 0,
        step: .00001
    });
    
    var sizeIndex = .00005;
    var index = 0;
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
         updatePropSymbols(map, attributes[index], sizeIndex);
    });
    
    $('.size-slider').on('input',function(){
        
         sizeIndex = $(this).val();
       updatePropSymbols(map, attributes[index], sizeIndex);
    });
    
       $('.skip').click(function(){
        //get the old index value
         index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 6 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 6 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
            updatePropSymbols(map, attributes[index], sizeIndex);
    });
}
//Import GeoJSON data

function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with population values
        if (attribute.indexOf("CY") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    

    return attributes;
};


function updatePropSymbols(map, attributes,sizeIndex){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attributes]){
            //access feature properties
            var props = layer.feature.properties;
            
            //update each feature's radius based on new attribute values
            
            var radius = calcPropRadius(props[attributes], sizeIndex);
            layer.setRadius(radius);

            //add city to popup content string
            

            //add formatted attribute to panel content str
           
            //replace the layer popup
            
        };

    });
};

$(document).ready(createMap);