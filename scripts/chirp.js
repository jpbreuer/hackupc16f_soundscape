var context = new (window.AudioContext || window.webkitAudioContext)();
var mod, modGain, osc;
var out = context.destination;

var drawChirp = function(){
    var fs = 44100;
    var N = document.getElementById("chirpLength").value * fs;

    var time = Array.apply(null, Array(N)).map(function (_, i) {return (i-1) / fs;});
    var signal = [];

    for (var i = 0; i < N; i++) {
        signal[i] = Math.cos(2*Math.PI*document.getElementById("fc").value*time[i] + 2 * Math.PI * document.getElementById("bw").value / document.getElementById("chirpLength").value * (0.5 * time[i] * time[i] - document.getElementById("chirpLength").value / 2 * time[i]));;
    }

    var chirp = {
      x: time, 
      y: signal, 
      type: 'scatter'
    };

    Plotly.newPlot('myDiv', [chirp]);
};

var startTest = function(){

    mod = context.createOscillator();
    mod.type = 'sawtooth';
    mod.frequency.value = .5 * 1/document.getElementById("chirpLength").value;
    
    modGain = context.createGain();
    modGain.gain.value = document.getElementById("bw").value;
    
    osc = context.createOscillator();
    osc.frequency.value = document.getElementById("fc").value;
    
    mod.connect(modGain);
    modGain.connect(osc.frequency);
    osc.connect(out);

    osc.start();
    mod.start();
    
    var stopTime = context.currentTime + 0.5 / mod.frequency.value ;
    osc.stop(stopTime);
    mod.stop(stopTime);

    setTimeout(function(){
            mod = modGain = osc = null;
    }, 500 / mod.frequency.value);
};

document.getElementById("start").onclick = function(){
  startTest();
  drawChirp();
};

drawChirp();
