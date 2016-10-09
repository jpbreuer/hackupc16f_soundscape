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
for (var i = 0 ; i < 800 ; i++)
    circleData[i] = 0;

var sonarData = [];
for (var i = 0 ; i < 5000; i++)
    sonarData[i] = 0;

Plotly.newPlot('myDiv2', [{x:0, y:0,type: 'scatter'}], genLayout); 
Plotly.newPlot('myDiv', [{x:0, y:0,type: 'scatter'}], xcLayout);  

function startSonar(){
    document.getElementById('startButton').disabled = true;
    document.getElementById('stopButton').disabled = false;

    doSonar();

    updateChirp();
    functionID = setInterval(function() {
        doSonar();
    }, 2000);
}

function stopSonar(){
    document.getElementById('startButton').disabled=false;
    document.getElementById('stopButton').disabled=true;

    window.clearInterval(functionID);
}


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

            var angle = 0;
            var angleIndex = Math.round(angle / 360 * 8);

            for (var i = 0 ; i < 800 ; i++){
                circleData[i] *= 0.9;
            }

            for (var i = index ; i < index+5000 ; i++){
                var dist = (i - index) / context.sampleRate * 340.29 / 2 + 1;
                xcorr[i] = xcorr[i] * dist * dist;
                sonarData[i-index] += xcorr[i];

                var idr = Math.round(dist*10);
                if (idr < 100)
                    circleData[angleIndex + idr * 8] += xcorr[i];
            }

            var chart = circularHeatChart()
            .segmentHeight(2)
            .innerRadius(0)
            .numSegments(8)
            .segmentLabels(["N", "NE", "E", "SE", "S", "SW", "W", "NW"])

            d3.select('#circleChart')
            .selectAll('svg')
            .data([circleData])
            .enter()
            .append('svg')
            .call(chart);



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

          Plotly.newPlot('myDiv2', [sd], cumLayout); 
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