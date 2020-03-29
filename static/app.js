var url = new URL(document.URL);
var username = url.searchParams.get('user') || 'unknown';
var titleUsername = username[0].toUpperCase() + username.substr(1);
var totalContinent = {};
var visitedContinent = {};

var enschede = [52.22068, 6.89589];
var curyear = new Date().getFullYear();
var map = L.map('map').setView(enschede, 4);
const HOME = 'hier woon ik';
const HOME_COLOR = 'green'

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
      let visitedContinentStr = '';
      for(var c in visitedContinent){
        if (visitedContinent[c].size > 0) visitedContinentStr += `<br />${c}: ${Math.round(visitedContinent[c].size*100/totalContinent[c])}%`;
      }
      this._div.innerHTML = `<h4>Countries visited (${titleUsername})</h4>` + 
       (props ?
          `<b>${props.country}</b><br />`+
          (props.year ? `Visited in ${props.year}` + 
           (props.note ? `<br/>${props.note}` : '')
     :'Not visited')
          : 'Hover/click a country' + visitedContinentStr);
};

info.addTo(map);

function sortVisits(visits) {
  if (!visits) return;
  var ar = Object.values(visits);
  ar.sort(function(a, b){return b.year - a.year});
  return ar
}

function getLatestVisit(visits) {
  if (!visits) return;
  return sortVisits(visits)[0];
}

function style(feature) {
      let latestVisit = getLatestVisit(feature.properties.visits) || {};
      return {
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.7,
          fillColor: latestVisit.note == HOME && HOME_COLOR || getColor(curyear - latestVisit.year)
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

    info.update(getLatestVisit(layer.feature.properties.visits) || {country: layer.feature.properties.name});
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

function showForm(id) {
  document.getElementById("feedback_form").style = '';
  var visit = document.visits && document.visits[id] || {};
  if (typeof visit.year !== "undefined") {
      document.getElementById("year").value = visit.year;
  } else{
      document.getElementById("year").value = curyear;
  }
  if (typeof visit.note !== "undefined") {
      document.getElementById("note").value = visit.note;
  } else{
      document.getElementById("note").value = '';
  }
  if (typeof visit.id !== "undefined") {
      document.getElementById("visit_id").value = visit.id;
  } else{
      document.getElementById("visit_id").value = '';
  }
  
  document.getElementById("year").scrollIntoView();
  document.getElementById("year").focus();
}

function clickFeature(e) {
    var v = e.target.feature.properties.visits;
    if(!v) {
      v = {0: {country: e.target.feature.properties.name}};
      showForm();
    }
    showList(v);
}

function showList(v) {
    document.getElementById("feedback_form").style = 'display: none';
    document.getElementById("action").disabled = false;
    var vl = document.getElementById("visitList")
    if(vl.childNodes.length) vl.removeChild(vl.childNodes[0])
    var ul = document.createElement('ul');
    ul.style = "margin: 1px; padding: 0";
    document.visits = v;
    if(v) vl.appendChild(ul);
    var countryel = document.getElementById("country");
    var countrye2 = document.getElementById("countryTekst");
    sortVisits(v).forEach(function(k) {
      var visit = k;
      countryel.value = visit.country;
      countrye2.innerHTML = 'Visits to ' + visit.country + ':';
      var a = document.createElement('a');
      a.setAttribute('href', '#');
      a.setAttribute('onClick', `event.preventDefault(); showForm(${visit.id})`);
      a.innerHTML = visit.year + (visit.note?': '+visit.note:'');
      var li = document.createElement('li');
      li.appendChild(a);
      if(visit.id) ul.appendChild(li);
    });
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
  
  for ( let coun of countries1.features){
    for ( let bzz of bz){
      if ( bzz.country == coun.properties.name ) {
        //special case:
        if(bzz.note == HOME) bzz.year = curyear;
        //special case: year == 0 -> remove
        if(bzz.year == 0) {
          let i = countries1.features.findIndex(f => f.properties.visits && f.properties.visits[bzz.id]);
          if (i>0) delete countries1.features[i].properties.visits[bzz.id];
          if (coun.properties.continent in visitedContinent) visitedContinent[coun.properties.continent].delete(bzz.country);
          info.update();
          break;
        };
        if (!coun.properties.visits) coun.properties.visits = {}
        coun.properties.visits[bzz.id] = {
          id: bzz.id,
          country: bzz.country,
          year: bzz.year,
          note: bzz.note
        }
        if (!(coun.properties.continent in visitedContinent)) visitedContinent[coun.properties.continent] = new Set()
        visitedContinent[coun.properties.continent].add(bzz.country);
      }
    }
  }
  info.update();
}

var maxBounds = new L.latLngBounds(new L.latLng([0,0]), new L.latLng([0,0]));

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: clickFeature
    });
    if (feature.properties.visits) maxBounds.extend(layer.getBounds());
}

map.attributionControl.addAttribution('Country boundaries data &copy; <a href="http://www.naturalearthdata.com/">Natural Earth Data</a>');

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6, 7],
            labels = [],
            from, to;
    labels.push(`<i style="background:${HOME_COLOR}"></i> home`);
    for (var i = 0; i < grades.length; i++) {
      from = grades[i];
      to = grades[i + 1];
      labels.push(
        `<i style="background:${getColor(from + 1)}"></i> ` +
        from + (to ? '&ndash;' + to : '+'));
    }
    labels.push(`<i style="background:${getColor(-1)}"></i> n/a`);
    div.innerHTML = `<h4>Years ago</h4>${labels.join('<br>')}`;
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

var escapeHtml = s => (s + '').replace(/[;<>"']/g, m => ({
    ';': '&semi;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#39;'
})[m]);

//This function will be called when the form is submited
function saveData(evt) {
  evt.preventDefault();
  //disable the button until we have received the result, as to prevent double submit
  document.getElementById("action").disabled = true;

  var sturen = {
      country: escapeHtml(document.getElementById("country").value),
      year: escapeHtml(document.getElementById("year").value),
      note: escapeHtml(document.getElementById("note").value),
      username: escapeHtml(username)
  };
  var visit_id = document.getElementById("visit_id").value;
  if (visit_id) sturen.id = visit_id;
  var http = new XMLHTTPObject();
  //special case: year = 0 -> remove
  if(sturen.year == 0 && sturen.id) http.open('DELETE', 'api/visit/'+sturen.id, true)
  else http.open(sturen.id?'PUT':'POST', sturen.id?'api/visit/'+sturen.id:'api/visit', true);
  http.setRequestHeader("Content-Type", 'application/json');
  http.onreadystatechange = function() {
    if(http.readyState == 4 && (http.status == 200 || http.status == 201 || http.status == 204)) {
        var res = http.responseText
        if(res){
          var resultobj = JSON.parse(res);
          sturen.id = resultobj.id;
          document.getElementById("visit_id").value=resultobj.id;
        }
        applyVisits([sturen]);
        document.getElementById("action").disabled = false;//knop weer beschikbaar maken
        //layer weghalen
        map.removeLayer(geojson);
        //en opnieuw instellen.
          geojson = L.geoJson(countries1, {
              style: style,
              onEachFeature: onEachFeature
          }).addTo(map);

        //special case: year = 0 -> remove
        if(sturen.year == 0) delete document.visits[sturen.id]
        else document.visits[sturen.id] = sturen;
        showList(document.visits);
    }
  }
  http.send(JSON.stringify(sturen));
  return false;//Prevent the form from being submited
}

function init(username) {
    document.title += ' ('+titleUsername+')';
    countries1.features.map(f => f.properties.continent).forEach(ct => totalContinent[ct]?totalContinent[ct] += 1:totalContinent[ct] = 1)

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
                if(bezocht.num_results > 0) {
                  console.log('Countries: '+countries1.features.length);
                  console.log('Number of visits: '+bezocht.objects.length);
                  let c = new Set(bezocht.objects.map(c => c.country))
                  console.log('Countries visited: '+c.size);
                  console.log(Array.from(c).sort().join(', '));
                  applyVisits(bezocht.objects);
                };
                //json toevoegen aan de map, pas na het inlezen van de json
                geojson = L.geoJson(countries1, {
                    style: style,
                    onEachFeature: onEachFeature
                }).addTo(map);
                //Only fit if bounds are not at 0,0.
                if (maxBounds.getCenter().distanceTo([0,0]) > 0) map.fitBounds(maxBounds);
                info.update();
            }
        }
    }
    http.send(null);
}
window.onload = init(username);
