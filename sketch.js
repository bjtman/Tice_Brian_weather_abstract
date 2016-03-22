// each day has been a chance to see how beautiful, talented and amazing you are. you are beyond words. 

//
// Brian Tice
// 2/23/16
//
// Code is either from class, from sound examples on p5.js website or my own

// Iteration 3a - Combining with some elements from the literal and adding new features

var forecastData;                                 // for API callback
var apiKey = '7ffe3c1e27a3a9e254d7cfc69669342b';  // DarkSky API Key

// current weather variables:

var currentTemperature;
var currentWindSpeed;
var currentWindBearing;
var currentPressure;

var temperatureToReverb;
var windSpeedToDelay;
var windBearingToPan;

var effects;

var humidityOfWeek = [];        // 7 element array containing humidities, range 0-1
var temperatureMinOfWeek = [];  // 7 element array containing Farenheight Lows
var temperatureMaxOfWeek = [];  // 7 element array containing Farenheight Highs
var moonPhaseOfWeek = [];       // 7 element array containing Moon Phase, range 0-1
var textSummaryOfWeek = [];     // 7 element array containing text summary of weather
var cloudCoverOfWeek = [];

var colorArray = [];            // array of colors for sidebar color scheme
var averageTemperature;         // Used to map temperature to colorArray

var myFont;

var daySelection; // a value 0 - 6 that changes based on y-mouse position


function setup() {
  
  sound = loadSound('assets/Paperhouse.mp3'); // load sound file
  var cnv = createCanvas(667, 375);         // make canvas
  cnv.mouseClicked(togglePlay);             // allow easy toggle feature
  fft = new p5.FFT();                       // fast fourier transform
  sound.amp(0.8);                           // attenuate sound
  
  reverb = new p5.Reverb();
  delay = new p5.Delay();
  
  
  // API Calls to Dark Sky 
  currentTemperature = forecastData.currently.temperature;
  print("Current Temperature in Boston: " + currentTemperature);
  
  currentWindSpeed = forecastData.currently.windSpeed;
  print("Current Wind Speed in Boston: " + currentWindSpeed);
  
  currentWindBearing = forecastData.currently.windBearing;
  print("Current Wind Bearing in Boston: " + currentWindBearing);
  
  currentPressure = forecastData.currently.pressure;
  print("Current Pressure in Boston: " + currentPressure);
  
  // remap real world Weather data to constraints used by reverb(), delay(), and pan()
  
  temperatureToReverb = round(map(round(currentTemperature),-20,100,0,10)); // how many second of reverb
  print("Reverb length in seconds: " + temperatureToReverb);
  
  windSpeedToDelay = map(round(currentWindSpeed),1,30,0,1); 
  print("Delay length in seconds: " + windSpeedToDelay)
  
  windBearingToPan = map(round(currentWindBearing),0,360,-1,1); 
  print("Pan level: " + windBearingToPan);
  
  // set reverb paramaters
  reverb.process(sound, 3, temperatureToReverb);
  
  // set delay parameters
  delay.process(sound, .12, .7, 2300);
  
  // set pan parameters
  sound.pan(windBearingToPan);
  
  // API Calls to DarkSky Forecast API for the week
  for(var i=0;i<7;i++) {
    
    humidityOfWeek[i] = forecastData.daily.data[i].humidity;
    print("Humidity Index: " + i + " Value: " + humidityOfWeek[i]);
    
    temperatureMinOfWeek[i] = forecastData.daily.data[i].temperatureMin;
    print("Low Temp Index: " + i + " Value: " + temperatureMinOfWeek[i]);
    
    temperatureMaxOfWeek[i] = forecastData.daily.data[i].temperatureMax;
    print("High Temp Index: " + i + " Value: " + temperatureMaxOfWeek[i]);
    
    moonPhaseOfWeek[i] = forecastData.daily.data[i].moonPhase;
    print("Moon Phase Index: " + i + " Value: " + moonPhaseOfWeek[i]);
    
    textSummaryOfWeek[i] = forecastData.daily.data[i].summary;
    print("Summary Index: " + i + " Value: " + textSummaryOfWeek[i]);
    
    cloudCoverOfWeek[i] = forecastData.daily.data[i].cloudCover;
    print("Cloud Index: " + i + " Value: " + cloudCoverOfWeek[i]);
    
  }
  
  
  // Create color array for temperature map
  // made use of colors from: colorbrewer2.org
  

  colorArray[0] = color(2,56,88); // coldest
  colorArray[1] = color(4,90,141);    colorArray[2] = color(5,112,176);   colorArray[3] = color(54,144,192);
  colorArray[4] = color(116,169,207); colorArray[5] = color(166,189,219); colorArray[6] = color(208,209,230);
  colorArray[7] = color(236,231,242); colorArray[8] = color(255,255,204); colorArray[9] = color(255,237,160);
  colorArray[10] = color(254,217,118);colorArray[11] = color(254,178,76); colorArray[12] = color(253,141,60);
  colorArray[13] = color(252,78,42);  colorArray[14] = color(227,26,28);  colorArray[15] = color(189,0,38);
  colorArray[16] = color(128,0,38); // hottest
  
  
  
}

function draw() {
  
  background(33);
  
  if(effects == 1) {
    reverb.disconnect();
    delay.disconnect();
  }
  else if(effects == 0) {
    reverb.connect();
    delay.connect();
  }
  
  effect = 2; // set out of bounds until keyPressed again 
  
  
  fill(200);
  noStroke();
  textSize(10);
  text("[ reverb ] Boston Current Temp: " + round(currentTemperature) + " Degrees",460,320);
  text("[ delay ] Boston Wind Speed: " + currentWindSpeed + "m/s",460,340);
  text("[ pan ] Boston Wind Bearing: " + currentWindBearing + " Degrees",460,360 );
  
  var spectrum = fft.analyze(); 
  noStroke();
  fill(0,155,250); // spectrum is green
  for (var i = 0; i< spectrum.length; i++){
    
    // change mapping to move the FFT to the right side of the screen
    var x = map(i, 0, spectrum.length, 0, width);
    //var x = map(i, 0, spectrum.length, 0, width);
    
    
    // similarly change mapping to move the FFT to only the bottom half of screen
    
    var h = -height + map(0.4*spectrum[i], 0, 255, height, 0);
    //var h = -height + map(spectrum[i], 0, 255, height, 0);
    
    
    rect(x, height, width / spectrum.length, h )
  }
  
  var waveform = fft.waveform();
  
  
  // Need to change this section to map the line to go from the extended forecast 
  // To roll over for the mapping to change each time
  
  
  // ==== This is the code to write the amplitude 
  var x;
  var y;
  var audioAngle;
  noFill();
  beginShape();
  stroke(255,0,0); // waveform is red
  strokeWeight(1);
  for(var i = 0; i < waveform.length; i++){
    
    if(daySelection < 4) {
      x = map(i, 0, waveform.length, 85, 450);
      y = map( 0.2*waveform[i], -1, 1, 0, height);
    }
    
    else if(daySelection == 5) {
      x = map(i, 0, waveform.length, 35, 450);
      y = map( 0.2*waveform[i], -1, 1, 0, height);
    }
    
    else if(daySelection == 6) {
      x = map(i, 0, waveform.length, 0, 450);
      y = map( 0.2*waveform[i], -1, 1, 0, height);
    }
    
    else {
      x = map(i, 0, waveform.length, 55, 450);
      y = map( 0.2*waveform[i], -1, 1, 0, height);
    }
    // look up table for angles
    
    
    if(daySelection == 0) {
      audioAngle = .3;
    }
    else if(daySelection == 1) {
      audioAngle = .2;
    }
    else if(daySelection == 2) {
      audioAngle = .1;
    }
    else if(daySelection == 3) {
      audioAngle = 0;
    }
    else if(daySelection == 4) {
      audioAngle = -0.1;
    }
    else if(daySelection == 5) {
      audioAngle = -0.2;
    }
    else if(daySelection == 6) {
      audioAngle = -0.3;
    }
    
    
    
    
    // rotate the line 
    x = x*cos(audioAngle)-y*sin(audioAngle);
    y = y*cos(audioAngle)+x*sin(audioAngle);
    
    
    vertex(x,y+(daySelection*height/7 - 160));
  }
  endShape();
  
  // ====
  /*
  noFill();
  beginShape();
  stroke(255,0,0); // waveform is red
  strokeWeight(1);
  for (var i = 0; i< waveform.length; i++){
    var x = map(i, 0, waveform.length, 85, width/2+25);
    var y = map( waveform[i]*0.2, -1, 1, height/7+3, height/2+126);
    vertex(x,y);
  }
  endShape();
  */
  
  
  
  

fill(200);
noStroke();
//text("Weather Seeded Audio Effects", 10, 25);
textSize(10);

// Change this to click and touch based rather than mouseOver...

//text('click to play/pause', 480, 315);
//text("LEFT ARROW to play without effects", 480, 335);
//text("RIGHT ARROW to play with effects", 480, 355);


// 2/23/16
// ===== Adding all of the literal stuff here, to be changed later

 push();
  
  // create side buttons
 
  for(var index = 0; index < 7; index++) {
    
    // make fill based on temperature 
    // print our High's / Low's in side bar
   
    // Draw Sidebar rectangles
    strokeWeight(1);
    stroke(66);
    
    // Calculate average temperature
    averageTemperature = (temperatureMinOfWeek[index] + temperatureMaxOfWeek[index] /2 );
    
    // Map average temperature to colorArray indexes 
    sideBarColorIndex = round(map(averageTemperature,-2,100,0,16)); 
    
    var a = colorArray[sideBarColorIndex];
    fill(a);
    
    
    rect(20,index*height/7+3,65,45,20);
    
    
    
    
    
    
    // Draw Text inside Sidebar Rectangles
    textSize(16);
    //textFont(loadFont('assets/FuturaStd-Heavy.otf'));
    
    textFont("Georgia");
    noStroke();
    fill(0);
    
    text(round(temperatureMinOfWeek[index]),30,index*height/7 + 38);
    text(round(temperatureMaxOfWeek[index]),58,index*height/7 + 21);
    
    fill(190);
    textSize(10);
    text("Today",90,height/7-22);
    text("Tomorrow",90,2*height/7-22);
    text("Day After Tomorrow",90,3*height/7-22);
    text("In three Days",90,4*height/7-22);
    text("In four Days",90,5*height/7-22);
    text("In five Days",90,6*height/7-22);
    text("In six Days",90,7*height/7-22);
    
    
    
    
    
  }
  
  
    if(mouseY >= 0 && mouseY < 54) {
      daySelection = 0;
    }
    else if(mouseY >= 55 && mouseY < 108) {
      daySelection = 1;
    }
    else if(mouseY >= 109 && mouseY < 162) {
      daySelection = 2;
    }
    else if(mouseY >= 163 && mouseY < 216) {
      daySelection = 3;
    }
    else if(mouseY >= 217 && mouseY < 270) {
      daySelection = 4;
    }
    else if(mouseY >= 271 && mouseY < 324) {
      daySelection = 5;
    }
    else if(mouseY >= 325 && mouseY < height) {
      daySelection = 6;
    }
    
    
    // Calculate average temperature
    averageTemperature = (temperatureMinOfWeek[daySelection] + temperatureMaxOfWeek[daySelection] / 2 );
    
    // Map average temperature to colorArray indexes 
    sideBarColorIndex = round(map(averageTemperature,-2,100,0,16)); 
    
    var b = colorArray[sideBarColorIndex];
    fill(b);
    rectMode(CENTER);
    rect(width/2+160,height/2,270,126,20);
    rectMode(CORNER);
    
    strokeWeight(2);
    //stroke();
    noFill();
    //bezier(width/2 - 135, height/2 - 63, (width/2-100-10*humidityOfWeek[daySelection] ), (height/2-100-10*humidityOfWeek[daySelection] ), 200, 200, width/2 + 30, height/2 + 30);
    // bezier(width/2,height/2, 200,200,300,300,width/2 + 400, height/2 + 400);
    stroke(127, 20, 0);
    
    // Humidity Percentage, with bezier control points seeded by 
    bezier(width/2+160, height/2-65, 400, 2 + 100 * humidityOfWeek[daySelection], 500, 90, 600, 75);
    
     // Moon Phase percentage, 
    bezier(width/2+160, height/2+65, 365 - 170 * moonPhaseOfWeek[daySelection], 290 + 50*moonPhaseOfWeek[daySelection], 500, 390, 300, 300);
    
    // cloudCover 
    bezier(width/2+160, height/2-65, 185, 2 + 100 * cloudCoverOfWeek[daySelection], 150, 90, 235, 55);
    
    noStroke();
    fill(255);
    textSize(12);
    var humidityString = "Humidity: " + 100*humidityOfWeek[daySelection] + "%";
    var moonPhaseString = "Moon Phase: " + round(100*moonPhaseOfWeek[daySelection]) + "%";
    var cloudCoverString = "Cloud Cover: " + cloudCoverOfWeek[daySelection];
    text(humidityString, 580,60);
    text(moonPhaseString, 270, 290);
    text(cloudCoverString, 205,40);
    
   
    
    
   
    // check where mouse is in y direction
    //if(mouseY )
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(12);
    
    text(textSummaryOfWeek[daySelection],width/2+160,height/2);
  
    
    
  
  // old code
  
  var temp = forecastData.currently.temperature;
  var time = forecastData.currently.time;
  
  var tempString = "The time is " + time + " and\n"
                   + "the temperature is " + temp;
                   
  var tomorrowsHumidity = forecastData.daily.data[1].humidity; // tomorrows index, weeklong array
  var humidityString = "Tomorrow's humidity is " + tomorrowsHumidity*100 + "%";
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(12);
  //text(tempString,width/2,height/2);
  //text(humidityString,width/2,height/2);
  // --- 
  
  pop();
  
  
  
  push();
  
  fill(255);
  noStroke();
  
  for(var idx=0;idx < forecastData.daily.data.length;idx++) {
    
   var x = map(idx,0,forecastData.daily.data.length-1,0,width);
   var y = map(forecastData.daily.data[idx].humidity,0,1,height,0);
   
   fill(25,25,150);
   //ellipse(x,y,20,20);
   
   //vertex(x,y);
   //endShape();
    
  pop();  
  }
  
  
  
  
  pop();
  
  
  //var tomorrowsHumidity = forecastData.daily.data[1].humidity; // tomorrows index, weeklong array
  //var humidityString = "Tomorrow's humidity is" + tomorrowsHumidity;

// ===== 
  
}

// fade sound if mouse is over canvas
function togglePlay() {
  if (sound.isPlaying()) {
    sound.pause();
  } else {
    sound.loop();
  }
}


function keyPressed() {
  
  if(keyCode === LEFT_ARROW) {
     effects = 1;
  } 
  else if(keyCode === RIGHT_ARROW) {
    effects = 0;
  }
  
  
}


//-- You can ignore everything past this point if you'd like --//

function preload() {
  if (apiKey) {
    var url = 'https://api.forecast.io/forecast/'
            + apiKey + '/42.358429,-71.059769';
    loadJSON(url, loadCallback, 'jsonp');
  }
  else {
    loadJSON('cachedForecastForBoston.json', loadCallback);
  }
}

function loadCallback(data) {
  forecastData = data;
  
  // Reformat current date
  if (forecastData.currently) {
    forecastData.currently.time =
      formatTime(forecastData.currently.time);
  }
  
  // Reformat minute date
  if (forecastData.minutely && forecastData.minutely.data) {
    for (minuteIdx = 0; minuteIdx < forecastData.minutely.data.length; minuteIdx++) {
      forecastData.minutely.data[minuteIdx].time = 
        formatTime(forecastData.minutely.data[minuteIdx].time);
    }
  }
  
  // Reformat hourly date
  if (forecastData.hourly && forecastData.hourly.data) {
    for (hourIdx = 0; hourIdx < forecastData.hourly.data.length; hourIdx++) {
      forecastData.hourly.data[hourIdx].time = 
        formatTime(forecastData.hourly.data[hourIdx].time);
    }
  }
  
  // Reformat daily date
  if (forecastData.daily && forecastData.daily.data) {
    var dailyData = forecastData.daily.data
    for (dayIdx = 0; dayIdx < dailyData.length; dayIdx++) {
      dailyData[dayIdx].time = 
        formatTime(dailyData[dayIdx].time);
      
      // sunrise
      if (dailyData[dayIdx].sunriseTime) {
        dailyData[dayIdx].sunriseTime =
          formatTime(dailyData[dayIdx].sunriseTime);
      }
      
      // sunset
      if (dailyData[dayIdx].sunsetTime) {
        dailyData[dayIdx].sunsetTime =
          formatTime(dailyData[dayIdx].sunsetTime);
      }
      
      // max precipitation time
      if (dailyData[dayIdx].precipIntensityMaxTime) {
        dailyData[dayIdx].precipIntensityMaxTime = 
        formatTime(dailyData[dayIdx].precipIntensityMaxTime);
      }
      
      // min temp time
      if (dailyData[dayIdx].temperatureMinTime) {
        dailyData[dayIdx].temperatureMinTime = 
        formatTime(dailyData[dayIdx].temperatureMinTime);
      }
      
      // max temp time
      if (dailyData[dayIdx].temperatureMaxTime) {
        dailyData[dayIdx].temperatureMaxTime = 
        formatTime(dailyData[dayIdx].temperatureMaxTime);
      }
      
      // apparent min temp time
      if (dailyData[dayIdx].apparentTemperatureMinTime) {
        dailyData[dayIdx].apparentTemperatureMinTime = 
        formatTime(dailyData[dayIdx].apparentTemperatureMinTime);
      }
      
      // apparent max temp time
      if (dailyData[dayIdx].apparentTemperatureMaxTime) {
        dailyData[dayIdx].apparentTemperatureMaxTime = 
        formatTime(dailyData[dayIdx].apparentTemperatureMaxTime);
      }
    }
  }
  
  // Reformat alerts date
  if (forecastData.alerts) {
    for (alertIdx = 0; alertIdx < forecastData.alerts.length; alertIdx++) {
      forecastData.alerts[alertIdx].time = 
        formatTime(forecastData.alerts[alertIdx].time);
    }
  }
  
  // Convenience method for formatting time
  function formatTime(timeField) {
      var d = new Date();
      d.setTime(timeField*1000);
      return d;
  }
}