function doSonar(button) {
    sendChirp();
    //Start recording
    recorder && recorder.record();

    button.disabled = true;
    button.nextElementSibling.disabled = false;
    __log('Recording...');
    
    //Stop recording
    var rawData = [];
    setTimeout(function(){
        mod = modGain = osc = null;

        recorder && recorder.stop();
        button.disabled = false;
        button.previousElementSibling.disabled = false;
        __log('Stopped recording.');


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
                if (xcorr[i] > 1){

                    index = i;
                    break;
                }
            }


            var cp = {
                x: Array.apply(null, Array(chirpWaveform.length)).map(function (_, i) {return (i-1);}),
                y: chirpWaveform, 
                name: 'Chirp',
                type: 'scatter'
            };

            var rec = {
                x: Array.apply(null, Array(rawData.length)).map(function (_, i) {return (i-1);}),
                y: rawData, 
                name: 'Record',
                type: 'scatter'
            };

            
            var xc = {
                x: Array.apply(null, Array(xcorr.length)).map(function (_, i) {return (i - index) / context.sampleRate * 340.29 / 2;}),
                y: xcorr, 
                type: 'scatter'
            };

            var xcLayout = {
              xaxis: {title: 'Distance [m]', range: [-.5, 6]},
              yaxis: {title: 'Reflection Coefficient'},
              title: 'Sonar Reflection',
              hovermode: 'closest'
          };

          var genLayout = {
              xaxis: {title: 'Sample #'},
              yaxis: {title: 'Amplitude'},
              title: 'Signals',
              hovermode: 'closest'
          };

          Plotly.newPlot('myDiv2', [cp, rec],genLayout); 
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

    // Uncomment if you want the audio to feedback directly
    //input.connect(audio_context.destination);
    //__log('Input connected to audio context destination.');

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