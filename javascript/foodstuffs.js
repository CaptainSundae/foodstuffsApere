var weather="Default";
var emotion="emoDefault";
var emoDictionary=[];

var video=document.getElementById('videoElement');
var firstPage=document.getElementById('firstPage');
var secondPage=document.getElementById('secondPage');
var thirdPage=document.getElementById('thirdPage');
var weatherText=document.getElementById('weatherText');



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
                    xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "PUT KEY HERE");
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
				var jsonAttribute=data[0].scores;
				console.log("Anger: "+jsonAttribute.anger+"/n Happiness: "+jsonAttribute.happiness);
				console.log([jsonAttribute.anger,jsonAttribute.happiness].sort());
				console.log(JSON.stringify(data));
			})
			.error(function (xhr, status, err) {
				console.log(status);
            });

			
		}
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
				console.log(status+"it didn't work");
			})
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
		url: "http://api.openweathermap.org/data/2.5/weather?q=Auckland&APPID=PASTE KEY HERE",
		type: "GET"
	})
	.success(function(json){
		/*
		Isolate the json, just like in the face api. The json is structured quite differently, with the main array being on the second variable
		to call parts, its the same concept, weatherJSON.description or weatherJSON.main
		*/
		var weatherJSON = json.weather[0];

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
	setTimeout(resultsPage,3700);
	setTimeout(countReady,6000);

	
}
//countdown starting at 3
function count3(){
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
//after the counter hits 1, we turn the counter off so it doesn't display any text, then we run the displayImage() to show the results
function countReady(){
	//document.getElementById("timer").innerHTML="";
	displayImage();
	sendDataToHeath();
	thirdPage.style.display="none";
	firstPage.style.display="block";
}

//!!!!!!!!!!!BUG!!!!!!!!!! split second where nothing is showing, Not a big deal, kinda annoying.
function returnVideo(){
	secondPage.style.display="none";
	canvasElement.style.display="none";
}

function resultsPage(){
	thirdPage.style.display="block";
}
//TIMER END

