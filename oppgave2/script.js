
//Fyll aktivtietsnivå-listen fra ekstern jsonfil når siden lastes..
$(document).ready(function(){
	$.getJSON("aktivitet.json", function(data){
		$(data.aktivitetsnivaa).each(function(i, niva){
			$("#selAktivitet").append("<option value='"+ niva.verdi +"'>" + niva.trening +  "</option>");
		});
	});
	
	//Sletter cookies når brukeren laster inn siden..
	if(document.cookie){
		document.cookie = "info=;expires" + expireDato(-7);
	}
});
$("#btnFinn").on('click', function(){
	var alder = parseInt($("#txtAlder").val());
	var hoyde = parseInt($("#txtHoyde").val());
	var vekt = parseInt($("#txtVekt").val());
	var aktivitet = parseFloat($("#selAktivitet").val());
	var resultat;
	
	if(isNaN(alder) || isNaN(hoyde) || isNaN(vekt))
		alert("Vennligst sett inn tall, ikke bokstaver!");
	else{	
		if($("#selKjonn").val() == 0)
			resultat = (88.362+(13.397 * vekt)+(4.799* hoyde)-(5.677* alder))* aktivitet; //Formel for å regne ut kaloribehov for menn
		else
			resultat = (447.593+(9.247 * vekt)+(3.098* hoyde)-(4.330* alder))* aktivitet; //Formel for å regne ut kaloribehov for kvinner

		var info = {
			"kjonn": $("#selKjonn").val(),
			"resultat": resultat
		};
		
		document.cookie = "info=" + JSON.stringify(info) + ";expires=" + expireDato(7); //Create a cookie with values from the form
		$(location).attr('href',"resultat.html"); //Redirect to result page
		
	}
});

function expireDato(dag){
	var date = new Date();
	date.setDate(date.getDate()+dag);		
	return date.toGMTString();
}