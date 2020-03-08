var url = new URL(document.URL);
var username = url.searchParams.get('user');
var enschede = [52.22068, 6.89589];
var curyear = new Date().getFullYear();
var map = L.map('map').setView(enschede, 4);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
  maxZoom: 18,
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery &copy <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.light'
}).addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
};

info.update = function (props) {
      this._div.innerHTML = '<h4>Countries visited ('+username+')</h4>' + 
       (props ?
          '<b>' + props.name + '</b><br />'+ 
          (props.year ? 'Visited in ' + props.year + 
           (props.note ? '<br/>'+props.note : '')
     :'Not visited')
          : 'Hover/click a country');
};

info.addTo(map);

function style(feature) {
      return {
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7,
          fillColor: getColor(curyear - feature.properties.year)
      };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
  
HTMLSelectElement.prototype.contains = function( value ) {
    for ( var i = 0, l = this.options.length; i < l; i++ ) {
        if ( this.options[i].value == value ) return true;
    }
    return false;
}

function clickFeature(e) {
    document.getElementById("action").disabled = false;
    var name = e.target.feature.properties.name;
    var countryel = document.getElementById("country");
    countryel.value = name;
    var countrye2 = document.getElementById("countryTekst");
    countrye2.innerHTML = name + ' visited in:';

    if (typeof e.target.feature.properties.year !== "undefined") {
        document.getElementById("year").value = e.target.feature.properties.year;
    }
    else{
        document.getElementById("year").value = curyear;
    }
    if (typeof e.target.feature.properties.note !== "undefined") {
        document.getElementById("note").value = e.target.feature.properties.note;
    }
    else{
        document.getElementById("note").value = '';
    }
    if (typeof e.target.feature.properties.visit_id !== "undefined") {
        document.getElementById("visit_id").value = e.target.feature.properties.visit_id;
    }
    else{
        document.getElementById("visit_id").value = '';
    }
    document.getElementById("year").focus();
}
  
// get color depending on d
function getColor(d) {
  return d >= 7 ? '#FFEDA0' ://yellow
    d >= 6 ? '#FED976' ://dark yellow
    d >= 5 ? '#FEB24C' ://light orange
    d >= 4 ? '#FD8D3C' ://orange
    d >= 3 ? '#FC4E2A' ://dark orange
    d >= 2 ? '#E31A1C' ://light red
    d >= 1 ? '#BD0026' ://red
    d >= 0 ? '#800026' ://dark red
    '#e6e6e6'//grey
}
  
  
function applyVisits(bz){
  console.log('landen: '+countries1.features.length);
  console.log('bezocht: '+bz.length);
  
  for ( let coun of countries1.features){
    for ( let bzz of bz){
      if ( bzz.country == coun.properties.name ) {
        coun.properties.year = bzz.year;
        coun.properties.note = bzz.note;
        coun.properties.visit_id = bzz.id;
        //bzz.pop(); scheelt in snelheid maar wil niet?
      }
    }
  }
}

var maxBounds = new L.latLngBounds(new L.latLng([0,0]), new L.latLng([0,0]));

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickFeature
    });
    if (feature.properties.visit_id) maxBounds.extend(layer.getBounds());
}

map.attributionControl.addAttribution('Country boundaries data &copy; <a href="http://www.naturalearthdata.com/">Natural Earth Data</a>');

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6, 7],
            labels = [],
            from, to;
    for (var i = 0; i < grades.length; i++) {
      from = grades[i];
      to = grades[i + 1];
      labels.push(
        '<i style="background:' + getColor(from + 1) + '"></i> ' +
        from + (to ? '&ndash;' + to : '+'));
    }
    labels.push('<i style="background:' + getColor(-1) + '"></i> ' + 'n/a');
    div.innerHTML = 'Years ago<br>' + labels.join('<br>');
    return div;
};

legend.addTo(map);

function XMLHTTPObject() {
  var xmlhttp=false;
  //If XMLHTTPReques is available
  if (XMLHttpRequest) {
    try {xmlhttp = new XMLHttpRequest();}
    catch(e) {xmlhttp = false;}
  } else if(typeof ActiveXObject != 'undefined') {
    //Use IE's ActiveX items to load the file.
    try {xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");}
    catch(e) {
      try {xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
      catch(E) {xmlhttp = false;}
    }
  } else  { xmlhttp = false;}//Browser don't support Ajax
  return xmlhttp;
}	

//This function will be called when the form is submited
function saveData(evt) {
  evt.preventDefault();
  //disable the button until we have received the result, as to prevent double submit
  document.getElementById("action").disabled = true;

  var sturen = {
      country: document.getElementById("country").value,
      year: document.getElementById("year").value,
      note: document.getElementById("note").value,
      username: username
  };
  var visit_id = document.getElementById("visit_id").value;
  if (visit_id) sturen.id = visit_id;
  var http = new XMLHTTPObject();
  //special case: year = 0 -> remove
  if(sturen.year == 0 && sturen.id) http.open('DELETE', 'api/visit/'+sturen.id, true)
  else http.open(sturen.id?'PUT':'POST', sturen.id?'api/visit/'+sturen.id:'api/visit', true);
  http.setRequestHeader("Content-Type", 'application/json');
  http.onreadystatechange = function() {
    if(http.readyState == 4 && http.status == 201) {
        var res = http.responseText
        if(res != null){
          var resultobj = JSON.parse(res);
          sturen.id = resultobj.id;
          document.getElementById("visit_id").value=resultobj.id;
        }
    }
  }
  http.send(JSON.stringify(sturen));
  //nieuwe waarden van countries updaten.
  for (i=0;i<countries1.features.length;i++){
    //naam zoeken
    if ( countries1.features[i].properties.name == sturen.country ){
      countries1.features[i].properties.year = sturen.year;
      countries1.features[i].properties.note = sturen.note;
      countries1.features[i].properties.visit_id = sturen.id;
      //special case: year = 0 -> remove
      if(sturen.year == 0){
        delete countries1.features[i].properties.year;
        delete countries1.features[i].properties.note;
        delete countries1.features[i].properties.visit_id;
      }
      break;
    }
  }
  document.getElementById("action").disabled = false;//knop weer beschikbaar maken
  //layer weghalen
  map.removeLayer(geojson);
  //en opnieuw instellen.
    geojson = L.geoJson(countries1, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
  return false;//Prevent the form from being submited
}

function init(username) {
    document.title += ' ('+username+')';

    var bezocht = {countries:[]};
    var http = new XMLHTTPObject();
    var resultobj = {};
    http.open("GET",'api/visit?q={"filters":[{"name":"username","op":"eq","val":"'+username+'"}]}', true);
    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            var res = http.responseText
            if(res != null){
                var resultobj = JSON.parse(res);
                bezocht = resultobj;
                if(bezocht.num_results > 0) applyVisits(bezocht.objects);
                //json toevoegen aan de map, pas na het inlezen van de json
                geojson = L.geoJson(countries1, {
                    style: style,
                    onEachFeature: onEachFeature
                }).addTo(map);
                //Only fit if bounds are not at 0,0.
                if (maxBounds.getCenter().distanceTo([0,0]) > 0) map.fitBounds(maxBounds)
            }
        }
    }
    http.send(null);
}
window.onload = init(username);
