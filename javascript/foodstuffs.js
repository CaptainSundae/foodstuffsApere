var weather="Default";
var emotion="emoDefault";
var emoDictionary=[];
var diet="";

var video=document.getElementById('videoElement');
var firstPage=document.getElementById('firstPage');
var secondPage=document.getElementById('secondPage');
var thirdPage=document.getElementById('thirdPage');
var weatherText=document.getElementById('weatherText');

var prodSentence=document.getElementById('prodSentence');
var prodName=document.getElementById('prodName');
var prodPrice=document.getElementById('prodPrice');
var prodNotes=document.getElementById('prodNotes');
var prodImage=document.getElementById('product');

var emojiPage=document.getElementById("emojiPage");

var imgHappy=document.getElementById('happyEmo');
var imgAngry=document.getElementById('angryEmo');
var imgSad=document.getElementById('sadEmo');
var imgSurprise=document.getElementById('surpriseEmo');
var imgNeutral=document.getElementById('neutralEmo');

var dietPage=document.getElementById('dietPage');


var servingPage=document.getElementById('servingPage');
var servings=4;
var servingSize=document.getElementById('servingSize');
servingSize.innerHTML=servings;
var addSize=document.getElementById('add');
var minusSize=document.getElementById('minus');


var scanPage=document.getElementById("scanPage");
var printPage=document.getElementById("printPage");


var errorPage=document.getElementById('errorPage');

	if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
		navigator.mediaDevices.getUserMedia({video:true}).then(function(stream){
			videoElement.src=window.URL.createObjectURL(stream);
			video.play();
		});
	}

var canvasElement=document.getElementById("myCanvas");
var context=canvasElement.getContext("2d");
//set dURL, where the dataURL for the image taken will go
var dURL="";
//This takes the photo resizes it to the same size as the canvas(hence 0,0,w,h) then makes the video stream disapear so it looks like the canvas is overlaying the stream

	

//This function Draws the image and processes it into theAPI, this gets called once the timer reaches 1, so it is on runtime.
function displayImage(){
	    context.drawImage(video,0,0,320,240);
        //This is where we write the picture data and turn it into a dataURL so we can feed it to the API
		dURL = canvasElement.toDataURL("image/jpeg",1);

		//call the function to send the image to the emotion API
		faceProcess();
}

//FACE API START!!!!

/*
first create a blob
This allows the API to read the dataURL, which is what we turn the data into after the cphoto is taken.
We did this because the javascript version of the API only takes URL images as input
This function was taken from stackoverflow
*/
	//Make Blob start
        makeblob = function (dataURL) {
            var BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
                var parts = dataURL.split(',');
                var contentType = parts[0].split(':')[1];
                var raw = decodeURIComponent(parts[1]);
                return new Blob([raw], { type: contentType });
            }
            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
                uInt8Array[i] = raw.charCodeAt(i);
            }
            return new Blob([uInt8Array], { type: contentType });
        }
	//Make blob end

		faceProcess=function(){
			//create an empty variable to store all the parameters
			var params={ };
			$.ajax({
				url:  "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?" + $.param(params),
				//Ensure that you feen the subscription key to the header
				beforeSend: function(xhrObj){
					// Request headers
                    xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "03aba829afff4f6eb7e9f736f365cdf6");
				},
				//type is POST because we are sending info to the API
				type: "POST",
				/*
				data is the content we are sending over. This is tricky, 
				we first need to convert the image into a DataURL and feed that into the API as a blob(see function makeblob() above)
				this way, the API understands the data we are sending
				*/
				data: makeblob(dURL),
				processData: false,
			})
			.success(function(data,status){
				/*
				This is how we isolate the json
				jsonAttribute isolates the scores because there are several attributes before such as face rectangle. We don't care about those.
				We just want the emotions. From here, just call jsonAttribute.anger or something, to get the float values of the emotions.
				This is what will eventually become the input to our algorithm. Just need to :
					*IMPROVE* 1. Figure out how to get the highest emotion efficiently
				*/
				try{
				var jsonAttribute=data[0].scores;
				console.log("Anger: "+jsonAttribute.anger+"/n Happiness: "+jsonAttribute.happiness);
				console.log([jsonAttribute.anger,jsonAttribute.happiness].sort());
				console.log(JSON.stringify(data));
				var emoFace=[[jsonAttribute.anger,'Anger'],[jsonAttribute.happiness,'Happiness'],[jsonAttribute.neutral*0.0007,'Neutral expression'],[jsonAttribute.sadness,'Sadness'],[jsonAttribute.surprise,'Surprise']].sort(function(a,b) {    return a[0] > b[0] ? 1 : -1;}).reverse();
                console.log(emoFace);
                console.log(emoFace[0][1]);
                emotion=emoFace[0][1];
   


                var sentence = "Due to your " +emotion+" on this "+weather+" day. We think you'll enjoy this!";
			    console.log(sentence);
			    prodSentence.innerHTML=sentence;
			    console.log('after prodSentence');

			   /*
			    //NOW WE CHANGE THE RESULT BASED ON THE EMOTION
			    if(emotion=='Happiness'){
					prodImage.src="Images/banana.png";
					prodName.innerHTML='Dole Bobby Banana';
					prodPrice.innerHTML='$1.99 ea';
					prodNotes.innerHTML='expires 25/03/18';
				}if(emotion=='Anger'){
					prodImage.src="Images/timtam.png";
					prodName.innerHTML="Arnott's Original Tim Tam";
					prodPrice.innerHTML='2 for $5';
					prodNotes.innerHTML='expires 25/03/18';
				}if(emotion=='Sadness'){
					prodImage.src="Images/cokecan.png";
					prodName.innerHTML="Coca-cola 330ml 8 pack";
					prodPrice.innerHTML='3 for $20';
					prodNotes.innerHTML='expires 25/03/18';
				}if(emotion=='Surprise'){
					prodImage.src="Images/pineappleLumps.png";
					prodName.innerHTML="Pascall's Pineapple Lumps";
					prodPrice.innerHTML='$2.49 ea';
					prodNotes.innerHTML='expires 25/03/18';
				}if(emotion=='Neutral expression'){
					prodImage.src="Images/icecream.png";
					prodName.innerHTML="Tip Top Hokey Pokey Ice Cream";
					prodPrice.innerHTML='$4.89 ea';
					prodNotes.innerHTML='expires 25/03/18';
				}
			*/
//START HARD CODING RESULTS
	var fiftyFifty=Math.floor(Math.random()*2);
	prodNotes.innerHTML='For notes on how to make this recipe, please visit our website or follow the instructions on the printout below.';

	if(diet=="vegetarian"){
		console.log(diet=="vegetarian");
		if(fiftyFifty==1){
			prodImage.src="Images/recipe/ThaiMushroomSalad.jpg";
			prodName.innerHTML='Thai Mushroom Salad';
		}if(fiftyFifty==0){
			prodImage.src="Images/recipe/MediterraneanPumpkinAndBasiCouscous.jpg"
			prodName.innerHTML="Mediterranean Pumpkin & Basi Couscous"
		}
		console.log(fiftyFifty);
				}if(diet=="dairy"){

		if(fiftyFifty==1){
			prodImage.src="Images/recipe/Soy&GingerSalmonWithLemon&HerbCouscous.jpg";
			prodName.innerHTML='Soy & Ginger Salmon With Lemon & Herb Couscous';
		}if(fiftyFifty==0){
			prodImage.src="Images/recipe/Tofu&MushroomSanChoyBau.jpg"
			prodName.innerHTML="Tofu & Mushroom San Choy Bau"
		}
	}
	if(diet=="noRequirements"){
		if(emotion=="Happiness"){
			if(fiftyFifty==1){
				prodImage.src="Images/recipe/TeriyakiChicken&CapsicumBowl.jpg";
				prodName.innerHTML='Teriyaki Chicken & Capsicum Bowl';
			}if(fiftyFifty==0){
				prodImage.src="Images/recipe/BeefSirloinOnSpicedLentils&Swede.jpg"
				prodName.innerHTML="Beef Sirloin On Spiced Lentils & Swede"
			}
		}

		if(emotion=="Anger"){
			if(fiftyFifty==1){
				prodImage.src="Images/recipe/Beef&BeanQuesadillas.jpg";
				prodName.innerHTML='Beef & Bean Quesadillas';
			}if(fiftyFifty==0){
				prodImage.src="Images/recipe/Ginger&CaramelSalmonwithAsianGreens.jpg"
				prodName.innerHTML="Ginger & Caramel Salmon with Asian Greens"
			}
		}

		if(emotion=="Sadness"){
			if(fiftyFifty==1){
				prodImage.src="Images/recipe/HarissaLambSkewers&TangyPotatoSalad.jpg";
				prodName.innerHTML='Harissa Lamb Skewers & Tangy Potato Salad';
			}if(fiftyFifty==0){
				prodImage.src="Images/recipe/BBQChickenSkewers,KumaraWedges&Cos.jpg"
				prodName.innerHTML="BBQ Chicken Skewers, Kumara Wedges & Cos"
			}
		}
		if(emotion=="Surprise"){
			if(fiftyFifty==1){
				prodImage.src="Images/recipe/ChilliJamLamb&MintedBroccoli.jpg";
				prodName.innerHTML='Chilli Jam Lamb & Minted Broccoli';
			}if(fiftyFifty==0){
				prodImage.src="Images/recipe/GreekStylePorkFeta&TomatoBraise.jpg"
				prodName.innerHTML="Greek Style Pork Feta & Tomato Braise"
			}
		}

		if(emotion=="Neutral"){
			if(fiftyFifty==1){
				prodImage.src="Images/recipe/Thyme&ParmesanSpaghettiBolognese.jpg";
				prodName.innerHTML='Thyme & Parmesan Spaghetti Bolognese';
			}if(fiftyFifty==0){
				prodImage.src="Images/recipe/CreamyChicken&GreenMedley.jpg"
				prodName.innerHTML="Creamy Chicken & Green Medley"
			}
		}
	}
	














//END HARD CODING STUFF


					emoji();

				}catch(TypeError){
					thirdPage.style.display="none";
					errorPage.style.display="block";
				}
			})
			.error(function (xhr, status, err) {
				console.log("EMOTION WENT WRONG");
            });

			
		}

//FACE API STOP!!!


//WEATHER API: START using the OpenWeatherMap
/*
This is a simple function. Really simple ajax call. Url is already built, I just put my APPID for the api there and set the city to auckland.
So just put the success condition as a way to break the weather down. I feel I need to parse it seperately first though.

If I wanted to make this more scalable, I'll do the following
	*IMPROVE* Put the APPID and City name as seperate variables so we can update it, depending on where in the world we use the app from
*/

function weatherAPI(){
	$.ajax({
		url: "http://api.openweathermap.org/data/2.5/weather?q=Auckland&APPID=6f05d22387d36ccd9e3415ec80a8f911",
		type: "GET"
	})
	.success(function(json){
		/*
		Isolate the json, just like in the face api. The json is structured quite differently, with the main array being on the second variable
		to call parts, its the same concept, weatherJSON.description or weatherJSON.main
		*/
		var weatherJSON = json.weather[0];

            if(weatherJSON.main=="Clear"){
                weather="Sunny";
            }if(weatherJSON.main =="Clouds"){
                weather="Cloudy";
            }if(weatherJSON.main=="Rain"){
                weather="Rainy";
            }
        console.log(weather);

		console.log("THIS IS THE NEW FUNCTION");
		console.log(json.weather[0].description +" its "+weatherJSON.main);
		console.log("Finished parse");
//		console.log(JSON.stringify(json));
	})

}



//WEATHER API STOP!!!


//TIMER START: Playing around with timers

/*
This function is where the magic happens. 
We gotta game the system because javascript only runs one thread apparently. That means, that we can't run the process and render at the sametime.
It renders the changes at the end, so just calling setTimeout individually is useless since it'll run the function in the order we set, but we won't see
any of the changes render onto the html tag, untill after it runs all of the functions. 
We manipulate the system so that we run the functions we want, When we want, by tying the function displayImage() 
to a function run within the setTimeout() function call, named countReady .
*/
function countDownTimer(){
	weatherAPI();
	setTimeout(count3,1000);
	setTimeout(count2,2000);
	setTimeout(count1,3000);
	setTimeout(returnVideo,3500);
	//Put the third page
/*
	setTimeout(resultsPage,3700);
	setTimeout(countReady,10000);
*/
	
}



//countdown starting at 3
function count3(){
	errorPage.style.display="none";
	firstPage.style.display="none";
	secondPage.style.display="block";
	document.getElementById("timer").innerHTML="3";
}
function count2(){
	document.getElementById("timer").innerHTML="2";
}
function count1(){
	document.getElementById("timer").innerHTML="1";
	
}
function servingSettings(){
	servingPage.style.display="none";
	setTimeout(resultsPage,1000);
	setTimeout(countReady,10000);
	
}

function dietSettings(){
	dietPage.style.display="none";

	displayImage();
	servingPageDisplay(); 

}


//after the counter hits 1, we turn the counter off so it doesn't display any text, then we run the displayImage() to show the results
function countReady(){
	//document.getElementById("timer").innerHTML="";

	errorPage.style.display="none";
	sendDataToHeath();
	thirdPage.style.display="none";


	printPage.style.display="inline-block";

}

//!!!!!!!!!!!BUG!!!!!!!!!! split second where nothing is showing, Not a big deal, kinda annoying.
function returnVideo(){

	secondPage.style.display="none";
	canvasElement.style.display="none";
	dietPageDisplay();
}

function dietPageDisplay(){
	dietPage.style.display="block";

}

function servingPageDisplay(){
	

	servingPage.style.display="block";
}



function resultsPage(){
	thirdPage.style.display="block";
}


function printRecipe(){
	setTimeout(scan,1000);
	setTimeout(exitScan, 7000);
	}


function scan(){
	printPage.style.display="none";
	scanPage.style.display="block";
}

function quit(){
	printPage.style.display="none";
	firstPage.style.display="block";
}

function exitScan(){
	scanPage.style.display="none";
	firstPage.style.display="block";
}



function emoji(){
	if (emotion=="Happiness"){
		imgHappy.style.transform="scale(1.5)";
		imgAngry.style.transform="scale(1.0)";
		imgSad.style.transform="scale(1.0)";
		imgSurprise.style.transform="scale(1.0)";
		imgNeutral.style.transform="scale(1.0)";
	}if (emotion=="Anger"){
		imgHappy.style.transform="scale(1.0)";
		imgAngry.style.transform="scale(1.5)";
		imgSad.style.transform="scale(1.0)";
		imgSurprise.style.transform="scale(1.0)";
		imgNeutral.style.transform="scale(1.0)";
	}if (emotion=="Sadness"){
		imgHappy.style.transform="scale(1.0)";
		imgAngry.style.transform="scale(1.0)";
		imgSad.style.transform="scale(1.5)";
		imgSurprise.style.transform="scale(1.0)";
		imgNeutral.style.transform="scale(1.0)";
	}if (emotion=="Surprise"){
		imgHappy.style.transform="scale(1.0)";
		imgAngry.style.transform="scale(1.0)";
		imgSad.style.transform="scale(1.0)";
		imgSurprise.style.transform="scale(1.5)";
		imgNeutral.style.transform="scale(1.0)";
	}if (emotion=="Neutral"){
		imgHappy.style.transform="scale(1.0)";
		imgAngry.style.transform="scale(1.0)";
		imgSad.style.transform="scale(1.0)";
		imgSurprise.style.transform="scale(1.0)";
		imgNeutral.style.transform="scale(1.5)";
	}
}

//TIMER END


var prodName=document.getElementById('prodName');
var prodPrice=document.getElementById('prodPrice');
var prodNotes=document.getElementById('prodNotes');
var prodImage=document.getElementById('product');


var slideIndex = 1;
showDivs(slideIndex);
function plusDivs(n) {
  showDivs(slideIndex += n);
}

function showDivs(n) {
  var i;
  var x = document.getElementsByClassName("mySlides");
  if (n > x.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = x.length}
  for (i = 0; i < x.length; i++) {
     x[i].style.transform = "scale(1.0)";  
  }

  x[slideIndex-1].style.transform = "scale(1.5)";
  diet=x[slideIndex-1].id;
  console.log(diet);
  
}


function add(){
	if(servings<12){
		servings+=1;	
	}else{
		servings=12;
	}

	servingSize.innerHTML=servings;
}
function minus(){
	if(servings<=1){
		servings=1;
	}else{
		servings-=1;	
	}
	servingSize.innerHTML=servings;
}




//HEATH's STUFF



// Send blob to the backend

		function sendDataToHeath(){
			$.ajax({
				url: "api.heathlogancampbell.com",
				type: "POST",
				data:makeblob(dURL),
				processData:false
			})
			.success(function(json){
				console.log("successfully sent to heath");
			})
			.error(function(xhr, status, err){
				console.log(status+" it didn't work");
			})
		}


//Connection to the button over websockets
//Should only trigger when button is clicked!
var ws = new WebSocket("ws://127.0.0.1:25565/");
ws.onmessage = function(event)
{
	//event.data will be 'Click'
	countDownTimer();
	
};