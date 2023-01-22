let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// The tile layer.
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// We create the map object with options.
var myMap = L.map("map", {
  center: [
    37, -95
  ],
  zoom: 5.25,
});

// Street tile layer to the map (from earlier activity).
street.addTo(myMap);

// Here we make an AJAX call that retrieves our earthquake geoJSON data.
d3.json(queryUrl).then(function (data) {

  // Function for plotting the earthquakes by depth(color) and magnitude(circle size).
  // to calculate the color and radius.
  function quakeInfo(feature) {
    return {
      opacity: .75,
      fillOpacity: .85,
      fillColor: depthColor(feature.geometry.coordinates[2]),
      radius: magRadius(feature.properties.mag),
      weight: 0.75
    };
  }

  // Function shows color of earthquake marker based on depth value.
  // https://www.w3schools.com/colors/colors_picker.asp
  function depthColor(depth) {
    switch (true) {
      case depth > 90:
        return "#ff0000";
      case depth > 70:
        return "#ff8000";
      case depth > 50:
        return "#ffbf00";
      case depth > 30:
        return "#ffff00";
      case depth > 10:
        return "#bfff00";
      default:
        return "#00ff80";
    }
  }

  // This function determines the radius of the marker based on magnitude.
  function magRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 7.5;
  }

  L.geoJson(data, {
    // We turn each feature into a circleMarker.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Style as outlined above for each marker.
    style: quakeInfo,
    // Popups for each marker.
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<br>Time: " + new Date (feature.properties.time)
        + "<hr><br>Location: " + feature.properties.place
        + "<hr><br>Magnitude: " + feature.properties.mag
        + "<hr><br>Depth: " + feature.geometry.coordinates[2]
      );
    }
  }).addTo(myMap);


  // Following code found in documentation for the legend: https://leafletjs.com/examples/choropleth/

  var legend = L.control({position: "bottomleft"});

  legend.onAdd = function () {
    var div = L.DomUtil.create("div", "info legend"),

      grades = [-10, 10, 30, 50, 70, 90],
      colors = [
        "#ff0000",
        "#ff8000",
        "#ffbf00",
        "#ffff00",
        "#bfff00",
        "#00ff80"
      ];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += 
        "<i style='background: " + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    
    return div;
  };

  legend.addTo(myMap);
});