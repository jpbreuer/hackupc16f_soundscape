if (window.DeviceOrientationEvent) {
    // Listen for the event and handle DeviceOrientationEvent object
    window.addEventListener('deviceorientation', devOrientHandler, false);
}


if (window.DeviceOrientationEvent) {
    document.getElementById("doEvent").innerHTML = "DeviceOrientation";
    // Listen for the deviceorientation event and handle the raw data
    window.addEventListener('deviceorientation', function (eventData) {
        // gamma is the left-to-right tilt in degrees, where right is positive
        var tiltLR = eventData.gamma;

        // beta is the front-to-back tilt in degrees, where front is positive
        var tiltFB = eventData.beta;

        // alpha is the compass direction the device is facing in degrees
        var dir = eventData.alpha

        // call our orientation event handler
        deviceOrientationHandler(tiltLR, tiltFB, dir);
    }, false);
} else {
    document.getElementById("doEvent").innerHTML = "Not supported."
}

document.getElementById("doEvent").innerHTML = "Not supported."
