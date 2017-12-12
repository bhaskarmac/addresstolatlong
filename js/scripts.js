console.log('script loaded');
console.log('mapsKey=>', mapsKey);

var mapJSRef = document.createElement('script');
mapJSRef.setAttribute("type", "text/javascript");
mapJSRef.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key='+ mapsKey.key +'&callback=initMap');
mapJSRef.onload = function () {
	console.log('mapJSRef loaded');
	initMap();
};

document.getElementsByTagName("head")[0].appendChild(mapJSRef);

var mapInstance;
var infowindow, marker, i;
var markers = [];

function initMap() {
	mapInstance = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 18.5204, lng: 73.8567},
		zoom: 8
	});

	infowindow = new google.maps.InfoWindow();
}

window.addEventListener('load', function() {
	var btnSearchPlace = document.getElementById("btnSearchPlace");
	var txtSearchPlace = document.getElementById("txtSearchPlace");
	console.log('btnSearchPlace=>', btnSearchPlace);

	btnSearchPlace.addEventListener("click", function(){
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
				console.error("Failed!", error);
			});
		}else{
			console.error("Location not entered!");
		}
	});
});

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