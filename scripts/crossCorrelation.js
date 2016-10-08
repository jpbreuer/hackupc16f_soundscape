
var dataSize = 30;

var countArray = [];
for (var i = 0, t = dataSize; i < t; i++) {
    countArray.push(i + 1);
}

var sendSignal = [];
for (var i = 0, t = dataSize; i < t; i++) {
    sendSignal.push(Math.round(Math.random() * t))
}

var recSignal = [];
for (var i = 0, t = dataSize; i < t; i++) {
    recSignal.push(Math.round(Math.random() * t));
}

//document.write(countArray,"<br>",sendSignal,"<br>",recSignal,"<br>");
document.write(sendSignal, "<br>", recSignal, "<br>");

/* Calculate the mean of the two series x[], y[] */
mx = 0;
my = 0;
for (i = 0, n = dataSize; i < n; i++) {
    mx += sendSignal[i];
    my += recSignal[i];
}
mx /= n;
my /= n;

document.write("AverageX: ", mx, " AverageY: ", my, "<br>");

/* Calculate the denominator */
sx = 0;
sy = 0;
for (i = 0, n = dataSize; i < n; i++) {
    sx += (sendSignal[i] - mx) * (sendSignal[i] - mx);
    sy += (recSignal[i] - my) * (recSignal[i] - my);
}
denom = Math.sqrt(sx * sy);
document.write("SX: ", sx, " SY: ", sy, "<br>");
document.write("Denominator: ", denom, "<br>");

var maxdelay = 30;
var r = [];
/* Calculate the correlation series */
for (delay = -maxdelay + 1; delay < maxdelay; delay++) {
    sxy = 0;
    for (i = 0, n = dataSize; i < n; i++) {
        j = i + delay;
        if (j < 0 || j >= n)
            continue;
        else
            sxy += sendSignal[i] * recSignal[j];
    }
    r.push(sxy);
}
corPoint = Math.max.apply(Math, r)
var Index = r.indexOf(Math.max.apply(Math, r));
document.write("Delay Array; ", r, "<br>", "Length of array: ", r.length, " Correlation Point: ", corPoint, " Index of Correltion Point: ", Index, "<br>");

