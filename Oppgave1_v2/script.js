/*
	Mappeinnlevering 3 - oppgave 1, Daniel Fuglestad / Steffen Martinsen
	
	Jquery funksjoner brukt.
	
	1. jQuery.getJSON(): Leser json-fil/json-variabel, og gjør det enklere å håndetere dataen på.
	2. jQuery.each():
	3. jQuery.append():
	4. jQuery.html():
	5. jQuery.text();
	6. jQuery.click():
	7  jQuery.inArray():
	8. jQuery.append():
	9. jQuery.removeClass():
*/

var myLocation = "";
var cor;

//Load googles autocomplete when the webpage is ready.
$(document).ready(function(){
	var input = document.getElementById('txtFra');
	var autocomplete = new google.maps.places.Autocomplete(input);
	
	
	
	google.maps.event.addListener(autocomplete, 'place_changed', function () {
		var place = autocomplete.getPlace();
		myLocation = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
	});
});

function success(position) {

	myLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	
	//Bruker google geo api for å finne ut hvor brukeren befinner seg.
	var sted = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + myLocation.lat() + "," + myLocation.lng() + "&sensor=true";
					
	//get the current name of position			
	$.getJSON(sted, function(data){
		$("#txtFra").val(data.results[0].address_components[1].long_name);
	});
}


$("#gpsKnapp").click(function(){
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success);
		
		document.getElementById("txtFra").disabled = true;
	}else{
		alert('Geolokasjon er ikke tilgjenglig i din nettleser..');
	}
});

//Function for finding the closest fitnessXpress gym from given cordinates (Latitude and Longitude)
function findFitnessXpress(x,y){
	
	//reset
	$("#hReiserute").text("");
	$("#hGym").html("");
	
	
	var distances = new Array(); //holds the distance between your position and the gyms position
	var currentGym;
	var gymNames = new Array(); //holds all the fitnessXpress gym names.
	
	var date = new Date(); //date object
	var klokke = Math.round(date.getTime() / 1000); //seconds since 1 jan 1970 (linux time)
	var url; //Api request variable
	
	myLocation = new google.maps.LatLng(x, y); //Set mylocation to parameters
	
	//Read the json file that holds information about the gyms
	$.getJSON("fitnessXpress.json", function(data){
	
		//loop trough the data and calculate the closest gym
		$.each(data, function(i, value){
			currentGym = new google.maps.LatLng(value.lat, value.lon);
			distances[i] = calcDistance(myLocation, currentGym);
			gymNames[i] = value.navn;
		});
		
		minValue = Math.min.apply(this, distances); //find the lowest number in array
		var findThisIndex = minValue + "";
		var placeNo = $.inArray(findThisIndex, distances);
		
		//Search trough the fitnessXpress.json file where the name equals name
		$.each(data, function(i, v) {
        	if (v.navn == gymNames[placeNo]) {
            	cor = new google.maps.LatLng(v.lat, v.lon);
            	return false;
            }
        });
        
        //Requesting public transit route from google API
        url = "http://maps.googleapis.com/maps/api/directions/json?origin=" + myLocation.lat() + "," + myLocation.lng() + "&destination=" + cor + "&sensor=false&departure_time=" + klokke +"&mode=transit";	
       
        //Show the name of the closest gym
		$("#hGym").text(gymNames[placeNo]);
		$("#steps").html("");
		var data;
		
		//Read the json variable 'url' requested from google api
        $.getJSON(url, function(data){
	        var length = data.routes[0].legs[0].steps.length; //Get all the steps
	        var bilde;

	        //Show the duration and distance (km)
	        $("#hReiserute").text("Reisetid ca " + data.routes[0].legs[0].duration.text + " - " + data.routes[0].legs[0].distance.text).removeClass("hide");			
			console.log(data);
			
			//Loop trough and print out the direction to the user
	        for	(var i = 0; i < length; i++ ){
	        
	        	var str = data.routes[0].legs[0].steps[i].html_instructions;
		    	var travelMode = str.split(/\b/)[0]; //Get the first word in the travel mode string.
		    	
		    	//Checking the steps provided from google.
		    	if(travelMode == "Buss"){
			    	$("#steps").append(
			        	"<div class='boks'><img src='bilder/buss.png' alt='Buss' />" + 
			        	"<p class='textTop'>" + "<strong>Rute " + data.routes[0].legs[0].steps[i].transit_details.line.short_name + ", avgang KL" +																				data.routes[0].legs[0].steps[i].transit_details.departure_time.text + "</p></strong>" +
			        	"<p class='textBottom'>" + data.routes[0].legs[0].steps[i].html_instructions + 
			        	", gå av på "+ data.routes[0].legs[0].steps[i].transit_details.arrival_stop.name +" </p></div>"
			        );	
		    	}else if(travelMode == "Tunnellbane"){
			    	$("#steps").append(
			        	"<div class='boks'><img src='bilder/bane2.png' alt='Tunnelbane' />" + 
			        	"<p class='textTop'>" + "<strong>Rute " + data.routes[0].legs[0].steps[i].transit_details.line.short_name + ", avgang KL" +																				data.routes[0].legs[0].steps[i].transit_details.departure_time.text + "</p></strong>" +
			        	"<p class='textBottom'>" + data.routes[0].legs[0].steps[i].html_instructions + 
			        	", gå av på "+ data.routes[0].legs[0].steps[i].transit_details.arrival_stop.name + "</p></div>"
			        	
			        );	
			    	
		    	}else if(travelMode == "Tog"){
			    	$("#steps").append(
			        	"<div class='boks'><img src='bilder/tog.png' alt='Tog' />" + 
			        	"<p class='textTop'>" + "<strong>Rute " + data.routes[0].legs[0].steps[i].transit_details.line.name + ", avgang KL" +																				data.routes[0].legs[0].steps[i].transit_details.departure_time.text + "</p></strong>" +
			        	"<p class='textBottom'>" + data.routes[0].legs[0].steps[i].html_instructions + 
			        	", gå av på "+ data.routes[0].legs[0].steps[i].transit_details.arrival_stop.name + "</p></div>"			  	
			        );	
		    	}else if(travelMode == "Trikk"){
			    	$("#steps").append(
			        	"<div class='boks'><img src='bilder/trikk.png' alt='Tog' />" + 
			        	"<p class='textTop'>" + "<strong>Rute " + data.routes[0].legs[0].steps[i].transit_details.line.short_name + ", avgang KL" +																				data.routes[0].legs[0].steps[i].transit_details.departure_time.text + "</p></strong>" +
			        	"<p class='textBottom'>" + data.routes[0].legs[0].steps[i].html_instructions +
			        	", gå av på " + data.routes[0].legs[0].steps[i].transit_details.arrival_stop.name + "</p></div>"
			        );				    	
		    	}else{
			    	$("#steps").append(
			        	"<div class='boks'><img src='bilder/walk.png' alt='Gå' />" + 
			        	"<p class='textTop'>" + "<strong>" + data.routes[0].legs[0].steps[i].distance.text + ", " + 																											data.routes[0].legs[0].steps[i].duration.text + "</p></strong>" +
			        	"<p class='textBottom'>" + data.routes[0].legs[0].steps[i].html_instructions + "</p></div>"
			        );
		    	}
		    }	
		});
	});;
}

$("#btnFinn").click(function(){
	if(myLocation == ""){
		alert("Vennligst oppgi hvor du befinner deg.");
	}else{
		$("#secData").slideDown();
		findFitnessXpress(myLocation.lat(),myLocation.lng());
	}
});

//calculating distance from point1 to point2
function calcDistance(p1, p2) {
	return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
}