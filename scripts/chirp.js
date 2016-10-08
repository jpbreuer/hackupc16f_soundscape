var context = new (window.AudioContext || window.webkitAudioContext)();
var mod, modGain, osc;
var out = context.destination;

var chirpWaveform = [];
var source;

var doChirp = function(){
    var channels = 1;
    var frameCount = context.sampleRate * document.getElementById("chirpLength").value;
    var arrayBuffer = context.createBuffer(channels, frameCount, context.sampleRate);

    for (var channel = 0; channel < channels; channel++) {
        var nowBuffering = arrayBuffer.getChannelData(channel);
        var t = 0;
        for (var i = 0; i < frameCount; i++) {
            nowBuffering[i] = chirpWaveform[i];
        }
    }

    var source = context.createBufferSource();
    source.buffer = arrayBuffer;
    source.connect(context.destination);
  
    source.start();
};

var drawChirp = function(){
    var frameCount = context.sampleRate * document.getElementById("chirpLength").value;
    for (var i = 0; i < frameCount; i++) {
        t = i / context.sampleRate;
        chirpWaveform[i] = Math.cos(2*Math.PI*document.getElementById("fc").value*t + 2 * Math.PI * document.getElementById("bw").value / document.getElementById("chirpLength").value * (0.5 * t * t - document.getElementById("chirpLength").value / 2 * t));
    }   

    var chirp = {
      x: Array.apply(null, Array(chirpWaveform.length)).map(function (_, i) {return (i-1);}), 
      y: chirpWaveform, 
      type: 'scatter'
    };

    Plotly.newPlot('myDiv', [chirp]);
};


var sendChirp = function(){
    doChirp();

    drawChirp();
};

drawChirp();
