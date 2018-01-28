


var video=document.getElementById('videoElement');
	
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
		video.style.display="none";

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
				console.log(JSON.stringify(data));
			})
			.error(function (xhr, status, err) {
				console.log(status);
            });

			
		}
//FACE API STOP!!!





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
	setTimeout(count3,1000);
	setTimeout(count2,2000);
	setTimeout(count1,3000);
	setTimeout(countReady,4000);
	setTimeout(returnVideo,5000);

	
}
//countdown starting at 3
function count3(){
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
	document.getElementById("timer").innerHTML="";
	displayImage();
}

//!!!!!!!!!!!BUG!!!!!!!!!! split second where nothing is showing, Not a big deal, kinda annoying.
function returnVideo(){
	canvasElement.style.display="none";
	video.style.display="";

}

//TIMER END

