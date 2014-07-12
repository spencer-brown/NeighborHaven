  
var map,
	markers = [],
	fb = new Firebase("https://newhavenhack.firebaseio.com/markers"),
	scope, compile, firebase, geocoder, http;


function MainController($scope, $compile, $firebase, $http) {
	scope = $scope;
	compile = $compile;
	firebase = $firebase;
	http = $http;
	geocoder = new google.maps.Geocoder();
	
	new FirebaseSimpleLogin(fb, function(error, user) {
		scope.$apply(function() {
			if(user) scope.user = user;	
		});
	});
	
	$firebase(fb).$bind(scope, "markers");

	scope.searchLocation = function () {

	    // var address = document.getElementById("address").value;
	    geocoder.geocode( { 'address': scope.search}, function(results, status) {
	      if (status == google.maps.GeocoderStatus.OK) {
			var resultBounds = new google.maps.LatLngBounds(

			    results[0].geometry.viewport.getSouthWest(), 
			    results[0].geometry.viewport.getNorthEast()
			);

			map.fitBounds(resultBounds);
	      } else {
	        alert("Geocode was not successful for the following reason: " + status);
	      }
	    });
	}
	
	scope.facebookLogin = function() {
		var auth = new FirebaseSimpleLogin(fb, function(error, user) {
			scope.$apply(function() {
				if(user)
					scope.user = user;	
				
			});
		});

		auth.login('facebook', {
			rememberMe: true,
			scope: 'user_events'
		});
		
	}
	
	scope.removeEvent = function(id) {
		console.log("asd");
		delete scope.markers[id];
		console.log(markers, id);
		
	}
}


function initialize() {
	
	var myLatLng = new google.maps.LatLng(41.3127341,-72.92376569999999);


	fb.on("child_added", function(snapshot) {
		placeMarker(snapshot.name(), snapshot.val());
	});

	fb.on("child_changed", function(snapshot) {
		placeMarker(snapshot.name(), snapshot.val());
	});

	fb.on("child_removed", function(snapshot) {
		var id = snapshot.name();
		if(markers[id]) markers[id].setMap(null);
	});

	var mapOptions = {
		center: myLatLng,
		zoom: 15
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

	google.maps.event.addListener(map, 'click', function(event) {
		new FirebaseSimpleLogin(fb, function(error, user) {
			
			if(scope.user) {
				fb.push({lat: event.latLng.lat(), lng: event.latLng.lng(), user: user});
			} else {
				alert("Please click Login with Facebook before creating an event");
			}
			
		});
		
	});

	function getRandomNeighbors(latlng) {
        // console.log(latlng);
        codeLatLng(latlng);
        for (var i=0;i<4;i++){
        	latlng.B += .0001;
	        latlng.k += .0001;
	        codeLatLng(latlng);
        }
	}

	function codeLatLng(latlng) {
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				console.log(results[0].formatted_address);
				$http.post('/api/postcard', { name: 'Temporary title!', address: results[0].formatted_address })
				.success(function(data, status, something, headers){
					console.log('success!');
					console.log(data);
				}).error(function(data, status, something, headers){
					console.log('error!');
					console.log(data);
				});
				// if (results[1]) {
				//   map.setZoom(11);
				//   marker = new google.maps.Marker({
				//       position: latlng,
				//       map: map
				//   });
				//   infowindow.setContent(results[1].formatted_address);
				//   infowindow.open(map, marker);
				// }
			} else {
				console.log("Geocoder failed due to: " + status);
			}
		});
	}


	function placeMarker(id, location) {
		var pos = new google.maps.LatLng(location.lat, location.lng);

		if(markers[id]) {
			markers[id].setMap(null);
			delete markers[id];
		}
		
		var image;
		try {
			if(location.user.thirdPartyUserData.name)
				image = location.user.thirdPartyUserData.picture.data.url;
			else
				image = 'http://nwex.co.uk/images/smilies/turd.gif';
		} catch(e) {
			image = 'http://nwex.co.uk/images/smilies/turd.gif';
		}


		var marker = new google.maps.Marker({
			position: pos, 
			map: map,
			icon: image
		});

		google.maps.event.addListener(marker, 'click', function() {
			

			getRandomNeighbors(pos);
			
			new FirebaseSimpleLogin(fb, function(error, user) {
				scope.$apply(function() {
					
					if(scope.markers[id] && user && user.id == scope.markers[id].user.id) {
					
						var element = compile(document.getElementById("markerEdit").innerHTML.replace(/%id%/gi, id))(scope)[0];
		
						var infowindow = new google.maps.InfoWindow({
							maxWidth: 300
						});
					
						infowindow.setContent(element);

						infowindow.open(map,marker);
				
						setTimeout(function() {
					
							$(element).find("input:first").focus();
					
						}, 100);
						
					} else {
						var element = compile(document.getElementById("markerShow").innerHTML.replace(/%id%/gi, id))(scope)[0];
		
						var infowindow = new google.maps.InfoWindow({
							maxWidth: 300
						});
					
						infowindow.setContent(element);

						infowindow.open(map,marker);
						
					}
				
				
				});
			});
			
			markers[id] = marker;
			
		});
	}

	//handleNoGeolocation();
	
	if(navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
			var pos = new google.maps.LatLng(position.coords.latitude,
			                         position.coords.longitude);

			// var infowindow = new google.maps.InfoWindow({
			// 	map: map,
			// 	position: pos,
			// 	content: 'Location found using HTML5.'
			// });

			map.setCenter(pos);
		});
	}
	
	angular.module("map", ['firebase'])
	
	angular.bootstrap(document, ['map']);

}

google.maps.event.addDomListener(window, 'load', initialize);