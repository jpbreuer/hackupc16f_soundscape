var context = new (window.AudioContext || window.webkitAudioContext)();
var mod, modGain, osc;
var out = context.destination;

var drawChirp = function(){

    var chirp = {
      x: chirpX, 
      y: chirpY, 
      type: 'scatter'
    };

    Plotly.newPlot('myDiv', [chirp]);
};

var startTest = function(){

    mod = context.createOscillator();
    mod.type = 'sawtooth';
    mod.frequency.value = .5 * 100;
    
    modGain = context.createGain();
    modGain.gain.value = 2000;
    
    osc = context.createOscillator();
    osc.frequency.value = 20000;
    
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
};

drawChirp();
