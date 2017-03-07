//creates the map object
function createMap(){
    //create the map
    var map = L.map('map', {
        center: [37, -95],
        zoom: 4    
    });

    //add OSM base tilelayer
    L.tileLayer( 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGV0ZXJuaWVsc2VuIiwiYSI6ImNpeXZxaWtzYTAwMmkzM24zMDd2MGRjcGMifQ.1f7rKmGUkT94RKJJr825Rg', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    }).addTo(map);

    //call getData function
   getData(map);
};

//imports jeojson data into the map
function getData(map){
    //load the data
    $.ajax("data/Airport-data.geojson", {
        dataType: "json",
        success: function(response){
            var attributes = processData(response);
           
            //call function to create proportional symbols
            createPropSymbols(response, map, attributes);
            //call function to create sidebar controls
            createSequenceControls(map, attributes);
            //call function to create onscreen legend
            createLegend(map, attributes);
        }
    });
};

function createPropSymbols(data, map, attributes){
  //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng ) {
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};
//calculates the radius of the circles
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
        fillColor: "#9933cc",
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
     var year = attribute.split(" ")[1];
    //adds the data for the selected object to the panel
    var panelContent = "<p><b>City: " + feature.properties.City + '</b>' + "<p>20" + year + ' enplanements' + ":</p> " + feature.properties[attribute] + "</p>";
    //calls function to popup data
    createPopup(feature.properties, attribute, layer, options.radius);
    //call functions for popups
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
    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//creates sidebar controls and adds thier functionality
function createSequenceControls(map, attributes){
    //create range input element (slider)
    $('#sequence_control').append('<p id= "dataLabel">Change Data Year</p>')
    $('#sequence_control').append('<button class="skip" id="reverse"></button>');
    $('#sequence_control').append('<button class="skip" id="forward"></button>');
    $('#sequence_control').append('<input class="range-slider" type="range">');
    //set slider attributes
    $('.range-slider').attr({
        max: 7,
        min: 0,
        value: 0,
        step: 1
    });
     
    $('#sequence_control').append('<p id= "sizeLabel">Change Symbol Size</p>')
     $('#sequence_control').append('<input class="size-slider" type="range">');
    $('#reverse').html('<img src="img/back.png">');
    $('#forward').html('<img src="img/forward.png">');
    $('#sequence_control').append('<p id= "colorLabel">Color</p>')
    $('#sequence_control').append('<button class="color" id="pink" value="#FF99CC"></button>');
    $('#sequence_control').append('<button class="color" id="red" value="#FF3333"></button>');
    $('#sequence_control').append('<button class="color" id="blue" value="#6699CC"></button>');
    $('#sequence_control').append('<button class="color" id="orange" value="#F47821"></button>');
    $('#sequence_control').append('<button class="color" id="green" value="#339933"></button>');
    $('#sequence_control').append('<button class="color" id="yellow" value="#ffff66"></button>');
    $('#sequence_control').append('<button class="color" id="purple" value="#9933cc"></button>');
    $('#sequence_control').append('<button class="color" id="grey" value="#999999"></button>');
    $('#pink').html('<img src="img/pinkButton-01.png">');
    $('#red').html('<img src="img/redButton-02.png">');
    $('#blue').html('<img src="img/blueButton-03.png">');
    $('#orange').html('<img src="img/orangeButton-04.png">');
    $('#green').html('<img src="img/greenButton-05.png">');
    $('#yellow').html('<img src="img/yellowButton-06.png">');
    $('#purple').html('<img src="img/purpleButton-07.png">');
    $('#grey').html('<img src="img/greyButton-08.png">');
    
    //set slider attributes
    $('.size-slider').attr({
        max: .0001,
        min: 0.00001,
        value: 0,
        step: .00001
    });
    
    var sizeIndex = .00005;
    var index = 0;
    var newColor = "purple";
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
         updatePropSymbols(map, attributes[index], sizeIndex, newColor);
    });
    
    $('.size-slider').on('input',function(){
        
         sizeIndex = $(this).val();
       updatePropSymbols(map, attributes[index], sizeIndex, newColor);
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
            updatePropSymbols(map, attributes[index], sizeIndex, newColor);
    });
    $('.color').click(function(){
        newColor = $(this).val();
        updatePropSymbols(map, attributes[index], sizeIndex, newColor);
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

//updates the symbols and panels when the data is sequenced
function updatePropSymbols(map, attribute, sizeIndex, newColor){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;
            
            //update each feature's radius based on new attribute values
            
            var radius = calcPropRadius(props[attribute], sizeIndex);
            layer.setRadius(radius);
           // console.log(layer.options);
            //add city to popup content string
          // console.log(layer.options.fillColor);
            layer.options.fillColor = newColor;
            layer.setStyle(layer.options);
            
          //  console.log(layer.options.fillColor);
          //  console.log(layer.options);
            //add formatted attribute to panel content str
          createPopup(props, attribute, layer, radius);
            $("#year").html(attribute.split(" ")[1]);
            layer.redraw;
            //replace the layer popup
            var year = attribute.split(" ")[1];
    var panelContent = "<p><b>City:" + layer.feature.properties.City + '</b>' + "<p>20" + year + ' enplanements' + ":</p> " + layer.feature.properties[attribute] + "</p>";
            layer.on({
                click: function(){
            $("#data").html(panelContent);
                }
            });  
        };
    });
    //calls to update the on-map legend
    updateLegend(map, attribute);
};

//creates popups
function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>City:</b> " + properties.City + "</p>";
    //add formatted attribute to panel content string
    var year = attribute.split(" ")[1];
    popupContent += "<p><b>Enplanements in " +  "20" + year + ":</b> " + properties[attribute];
    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
};

//creates the legend for the map
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');
            
            $(container).append('<div id="temporal-legend">');
            //creates space to hold the attribute legend
            var svg = '<svg id="attribute-legend" width="200px" height="100px">';
                 var circles = {
            max: 20,
            mean: 55,
            min: 90
        };
        //loop to add each circle and text to svg string
        for (var circle in circles){
            //circle string
            svg += '<circle class="legend-circle" id="' + circle + '" fill="#F47821" fill-opacity="0.8" stroke="#000000" cx="49"/>';

            //text string
            svg += '<text id="' + circle + '-text" x="100" y="' + circles[circle] + '">id</text>';
        };
        //close svg string
        svg += "</svg>";
            //add attribute legend svg to container
            $(container).append(svg);
            return container;
        }
    });
    map.addControl(new LegendControl());
    //calls to update the newly created legend
    updateLegend(map, attributes[0]);
};

//updates the temporal and attribute legends once they are selected
function updateLegend(map, attribute){
     var year = attribute.split(" ")[1];
    var content = "Enplanements in 20" + year;
    $('#temporal-legend').html(content);
     var circleValues = getCircleValues(map, attribute);
    console.log(circleValues);
    for (var key in circleValues){
        //get the radius
          var sizeIndex = .00015
        var radius = calcPropRadius(circleValues[key], sizeIndex);
        //Step 3: assign the cy and r attributes
        $('#'+key).attr({
            cy: 99 - radius,
            r: radius
        });
        $('#'+key+'-text').text(key + " " +circleValues[key]);
    }; 
}

function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;
    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);
            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };
            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });
    //set mean
    var mean = (max + min) / 2;
    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

//creates the document once all the code has been compiled
$(document).ready(createMap);