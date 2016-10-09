var functionID;

document.getElementById('startButton').disabled = false;
document.getElementById('stopButton').disabled = true;

var xcLayout = {
  xaxis: {title: 'Distance [m]', range: [-.5, 6]},
  yaxis: {title: 'Reflection Coefficient', range: [0, 100]},
  title: 'Sonar Reflection',
  hovermode: 'closest'
};

var genLayout = {
  xaxis: {title: 'Sample #'},
  yaxis: {title: 'Amplitude'},
  title: 'Signals',
  hovermode: 'closest'
};

var cumLayout = {
  xaxis: {title: 'Distance [m]'},
  yaxis: {title: 'Amplitude'},
  title: 'Cumulative',
  hovermode: 'closest'
};

var circleData = [];
for (var i = 0 ; i < 1600 ; i++)
    circleData[i] = 0;

var sonarData = [];
for (var i = 0 ; i < 5000; i++)
    sonarData[i] = 0;

Plotly.newPlot('myDiv2', [{x:0, y:0,type: 'scatter'}], genLayout); 
Plotly.newPlot('myDiv', [{x:0, y:0,type: 'scatter'}], xcLayout); 

var circleChart = circularHeatChart()
.segmentHeight(2)
.innerRadius(0)
.numSegments(16)

d3.select('#circleChart')
.selectAll('svg')
.data([circleData])
.enter()
.append('svg')
.call(circleChart); 

var div = document.getElementById('circleChart');
var deg = -11.25;
div.style.webkitTransform = 'rotate('+deg+'deg)'; 
div.style.mozTransform    = 'rotate('+deg+'deg)'; 
div.style.msTransform     = 'rotate('+deg+'deg)'; 
div.style.oTransform      = 'rotate('+deg+'deg)'; 
div.style.transform       = 'rotate('+deg+'deg)'; 

if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(event) {
        //document.getElementById('beta').innerHTML = Math.round(event.beta);
        //document.getElementById('gamma').innerHTML = Math.round(event.gamma);
        //document.getElementById('alpha').innerHTML = Math.round(event.alpha);

        angle = event.beta;
    });
}

if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', function(event) {
        //document.getElementById('interval').innerHTML = event.interval;
    });
}


function startSonar(){
    document.getElementById('startButton').disabled = true;
    document.getElementById('stopButton').disabled = false;

    doSonar();

    updateChirp();
    functionID = setInterval(function() {
        doSonar();
    }, 1000 * document.getElementById("delayTime").value);
}

function stopSonar(){
    document.getElementById('startButton').disabled=false;
    document.getElementById('stopButton').disabled=true;

    window.clearInterval(functionID);
}

var angle = 0;
function doSonar() {
    sendChirp();        
    //Start recording

    recorder && recorder.record();

    //Stop recording
    var rawData = [];
    setTimeout(function(){
        mod = modGain = osc = null;

        recorder && recorder.stop();

        // create WAV download link using audio data blob
        recorder.getBuffer(function(data) {
            for (var i = 0 ; i < data[0].length ; i++)
            {
                rawData[i] = data[0][i];
            }
            
            var maxdelay = chirpWaveform.length;

            var xcorr = [];      

            for (i = 0, n = rawData.length; i < n; i++) {
                sxy = 0;
                for (delay = 0; delay < chirpWaveform.length; delay++) {
                    j = i - delay;
                    if (j < 0 || j >= n)
                        continue;
                    else
                        sxy += chirpWaveform[delay] * rawData[j];
                }
                
                xcorr.push((Math.abs(sxy)));
            }

            var index = 0;
            for (var i = 0 ; i < xcorr.length ; i++){
                if (xcorr[i] > 10){

                    index = i;
                    break;
                }
            }

            var angleIndex = Math.round(angle / 360 * 16);
            console.log(angleIndex);

            for (var i = 0 ; i < 1600 ; i++){
                circleData[i] *= 0.75;
            }

            for (var i = index ; i < index+5000 ; i++){
                var dist = (i - index) / context.sampleRate * 340.29 / 2 + 1;
                xcorr[i] = xcorr[i] * dist * dist;
                sonarData[i-index] += xcorr[i];

                var idr = Math.round(dist*100/6);
                if (idr < 100)
                    circleData[angleIndex + idr * 16] += xcorr[i];
            }


            var color = d3.scale.linear().domain([0.0, max = Math.max.apply(null, circleData)]).range(["white", "red"]);
            d3.select('#circleChart').selectAll('path').data(circleData).attr('fill', color);


            var cp = {
                x: Array.apply(null, Array(chirpWaveform.length)).map(function (_, i) {return (i*100);}),
                y: chirpWaveform, 
                name: 'Chirp',
                type: 'scatter'
            };

            var rec = {
                x: Array.apply(null, Array(rawData.length)).map(function (_, i) {return (i);}),
                y: rawData, 
                name: 'Record',
                type: 'scatter'
            };

            
            var xc = {
                x: Array.apply(null, Array(xcorr.length)).map(function (_, i) {return (i - index) / context.sampleRate * 340.29 / 2;}),
                y: xcorr, 
                type: 'scatter'
            };

            var sd = {
                x: Array.apply(null, Array(sonarData.length)).map(function (_, i) {return (i) / context.sampleRate * 340.29 / 2;}),
                y: sonarData, 
                type: 'scatter'
            };

          Plotly.newPlot('myDiv2', [cp, rec], genLayout); 
          Plotly.newPlot('myDiv', [xc], xcLayout); 
      });

        recorder.clear();

    }, 1000 * document.getElementById("recTime").value);
}

function __log(e, data) {
    log.innerHTML += "\n" + e + " " + (data || '');
}

var audio_context;
var recorder;

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.');

    recorder = new Recorder(input);
    __log('Recorder initialised.');
}

function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
        var url = URL.createObjectURL(blob);
        var li = document.createElement('li');
        var au = document.createElement('audio');
        var hf = document.createElement('a');

        au.controls = true;
        au.src = url;
        hf.href = url;
        hf.download = new Date().toISOString() + '.wav';
        hf.innerHTML = hf.download;
        li.appendChild(au);
        li.appendChild(hf);
        recordingslist.appendChild(li);
    });
}

window.onload = function init() {
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext;
        __log('Audio context set up.');
        __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({
        audio: true
    }, startUserMedia, function(e) {
        __log('No live audio input: ' + e);
    });
};