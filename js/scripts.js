console.log('script loaded');
console.log('mapsKey=>', mapsKey);

//loading and adding the google maps js to DOM
var mapJSRef = document.createElement('script');
mapJSRef.setAttribute("type", "text/javascript");
mapJSRef.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key='+ mapsKey.key +'&libraries=places');
mapJSRef.onload = function () {
	console.log('mapJSRef loaded');
	initMap();
};
document.getElementsByTagName("head")[0].appendChild(mapJSRef);

var mapInstance, infowindow, marker, i, markers = [];
var btnSearchPlace, txtSearchPlace, autocomplete;

function initMap() {
	//Creating map and setting options
	mapInstance = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 18.5204, lng: 73.8567},
		zoom: 8
	});

	//capturing the elements
	btnSearchPlace = document.getElementById("btnSearchPlace");
	txtSearchPlace = document.getElementById("txtSearchPlace");

	//creating necessary things for features
	infowindow = new google.maps.InfoWindow();
	autocomplete = new google.maps.places.Autocomplete(txtSearchPlace);
} //initMap ends here

window.addEventListener('load', function() {

	btnSearchPlace.addEventListener("click", function(){
		searchLocation();
	}); //click ends here

	autocomplete.addListener('place_changed', function() {
		var place = autocomplete.getPlace();
		console.log('autocomplete place_changed=>', place.formatted_address);

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
	}); //place_changed event ends here

}); //window load event ends here

/**
 * [get method for XHR]
 * @param  {[string]} url [accepts the url to make call]
 * @return {[Promise]}     [returns Promise of call]
 */
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
} //get ends here

/**
 * [clearMarkers : method to clear the markers on map]
 */
function clearMarkers() {
	console.log('in clearMarkers=>', markers);
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(null);
	}
	markers = [];
} //clearMarkers ends here

/**
 * [searchLocation : method to search the location and get the detail about it]
 */
function searchLocation() {
	console.log('in searchLocation=>', txtSearchPlace.value);
	if(txtSearchPlace.value){
		var replaced = txtSearchPlace.value.split(' ').join('+');
		console.log('txtSearchPlace=>', replaced);
		var sampleURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key='+ mapsKey.key;
		var addressURL = 'https://maps.googleapis.com/maps/api/geocode/json?address='+replaced+'&key='+ mapsKey.key;

		get(addressURL).then(function(response) {
			var finalResults = JSON.parse(response);
			console.log('finalResults=>', finalResults);

			//setting some options to map
			mapInstance.setCenter(finalResults.results[0].geometry.location);
			mapInstance.setZoom(15);

			if(finalResults.status === 'OK'){
				clearMarkers();
				//adding markers
				for (i = 0; i < finalResults.results.length; i++) {  
					marker = new google.maps.Marker({
						animation: google.maps.Animation.DROP,
						position: new google.maps.LatLng(finalResults.results[i].geometry.location.lat, finalResults.results[i].geometry.location.lng),
						map: mapInstance
					});
					markers.push(marker);

					//adding event to the marker on click to display the complete address
					google.maps.event.addListener(marker, 'click', (function(marker, i) {
						return function() {
							infowindow.setContent(finalResults.results[i].formatted_address);
							infowindow.open(map, marker);
						}
					})(marker, i));
				}
			} //status check ends here
		}, function(error) {
			console.log("Promise failed=>", error);
		});
	}else{
		console.log("Location not entered!");
	}
} //searchLocation ends here