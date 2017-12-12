console.log('script loaded');
console.log('mapsKey=>', mapsKey);

var mapJSRef = document.createElement('script');
mapJSRef.setAttribute("type", "text/javascript");

// https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places&callback=initMap"

mapJSRef.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key='+ mapsKey.key +'&libraries=places');
mapJSRef.onload = function () {
	console.log('mapJSRef loaded');
	initMap();
};

document.getElementsByTagName("head")[0].appendChild(mapJSRef);

var mapInstance;
var infowindow, marker, i;
var markers = [];

var btnSearchPlace, txtSearchPlace, autocomplete;

function initMap() {
	mapInstance = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 18.5204, lng: 73.8567},
		zoom: 8
	});

	btnSearchPlace = document.getElementById("btnSearchPlace");
	txtSearchPlace = document.getElementById("txtSearchPlace");

	infowindow = new google.maps.InfoWindow();
	autocomplete = new google.maps.places.Autocomplete(txtSearchPlace);
}

window.addEventListener('load', function() {

	console.log('btnSearchPlace=>', btnSearchPlace);

	btnSearchPlace.addEventListener("click", function(){
		searchLocation();
	}); //click ends here

	autocomplete.addListener('place_changed', function() {
		// console.log('autocomplete place_changed=>');

		var place = autocomplete.getPlace();
		// console.log('place=>', place);
		console.log('place=>', place.formatted_address);

		if (!place.geometry) {
			window.alert("No details available for input: '" + place.name + "'");
			return;
		}

		var address = '';
		if (place.address_components) {
			address = [
			(place.address_components[0] && place.address_components[0].short_name || ''),
			(place.address_components[1] && place.address_components[1].short_name || ''),
			(place.address_components[2] && place.address_components[2].short_name || '')
			].join(' ');
		}

		searchLocation();
	});

}); //window load event ends here

function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
    	reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

function clearMarkers() {
	console.log('in clearMarkers=>', markers);
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
}

function searchLocation() {
	console.log('in searchLocation=>');
	if(txtSearchPlace.value){
		var replaced = txtSearchPlace.value.split(' ').join('+');
		console.log('txtSearchPlace=>', replaced);
		var sampleURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key='+ mapsKey.key;
		var addressURL = 'https://maps.googleapis.com/maps/api/geocode/json?address='+replaced+'&key='+ mapsKey.key;

		get(addressURL).then(function(response) {
			var finalResults = JSON.parse(response);
			console.log('finalResults=>', finalResults);

			mapInstance.setCenter(finalResults.results[0].geometry.location);
			mapInstance.setZoom(15);

			if(finalResults.status === 'OK'){
				clearMarkers();
				for (i = 0; i < finalResults.results.length; i++) {  
					marker = new google.maps.Marker({
						animation: google.maps.Animation.DROP,
						position: new google.maps.LatLng(finalResults.results[i].geometry.location.lat, finalResults.results[i].geometry.location.lng),
						map: mapInstance
					});
					markers.push(marker);

					google.maps.event.addListener(marker, 'click', (function(marker, i) {
						return function() {
							infowindow.setContent(finalResults.results[i].formatted_address);
							infowindow.open(map, marker);
						}
					})(marker, i));
				}

			}


		}, function(error) {
			console.log("Failed!", error);
		});
	}else{
		console.log("Location not entered!");
	}
}