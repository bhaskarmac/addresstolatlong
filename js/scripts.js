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

function initMap() {
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 18.5204, lng: 73.8567},
		zoom: 8
	});
}

window.addEventListener('load', function() {
	var btnSearchPlace = document.getElementById("btnSearchPlace");
	var txtSearchPlace = document.getElementById("txtSearchPlace");
	console.log('btnSearchPlace=>', btnSearchPlace);

	btnSearchPlace.addEventListener("click", function(){
		console.log('txtSearchPlace=>', txtSearchPlace);
		console.log('txtSearchPlace=>', txtSearchPlace.value);
		var replaced = txtSearchPlace.value.split(' ').join('+');
		console.log('txtSearchPlace=>', replaced);
	});

});
