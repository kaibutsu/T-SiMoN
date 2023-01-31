function getCurvePoints(signalName, bufferWidth, minValue, maxSigHeight) {
    switch (signalName) {
        case 'pleth':
            return [
                { x: 0.0 * bufferWidth, y: minValue - 0.0 * maxSigHeight },
                { x: 0.1 * bufferWidth, y: minValue - 0.0 * maxSigHeight },
                { x: 0.2 * bufferWidth, y: minValue - 1.0 * maxSigHeight },
                { x: 0.4 * bufferWidth, y: minValue - 0.4 * maxSigHeight },
                { x: 0.7 * bufferWidth, y: minValue - 0.5 * maxSigHeight },
                { x: 0.9 * bufferWidth, y: minValue - 0.0 * maxSigHeight },
                { x: 1.0 * bufferWidth, y: minValue - 0.0 * maxSigHeight },
            ]
        case 'ecg':
            return [
                { x: 0.000 * bufferWidth, y: minValue - 1.00 * maxSigHeight },
                { x: 0.030 * bufferWidth, y: minValue - 0.10 * maxSigHeight },
                { x: 0.100 * bufferWidth, y: minValue - 0.20 * maxSigHeight },
                { x: 0.200 * bufferWidth, y: minValue - 0.20 * maxSigHeight },
                { x: 0.275 * bufferWidth, y: minValue - 0.35 * maxSigHeight },
                { x: 0.350 * bufferWidth, y: minValue - 0.20 * maxSigHeight },
                { x: 0.500 * bufferWidth, y: minValue - 0.20 * maxSigHeight },
                { x: 0.625 * bufferWidth, y: minValue - 0.20 * maxSigHeight },
                { x: 0.700 * bufferWidth, y: minValue - 0.35 * maxSigHeight },
                { x: 0.775 * bufferWidth, y: minValue - 0.20 * maxSigHeight },
                { x: 0.900 * bufferWidth, y: minValue - 0.20 * maxSigHeight },
                { x: 0.970 * bufferWidth, y: minValue - 0.20 * maxSigHeight },
                { x: 1.000 * bufferWidth, y: minValue - 1.00 * maxSigHeight },
            ]
        case 'resp':
            return [
                { x: 0.00 * bufferWidth, y: minValue },
                { x: 0.10 * bufferWidth, y: minValue },
                { x: 0.45 * bufferWidth, y: minValue - maxSigHeight },
                { x: 0.90 * bufferWidth, y: minValue },
                { x: 1.00 * bufferWidth, y: minValue },
            ]
        default:
            return [
                { x: 0, y: 0.5 * maxSigHeight },
                { x: bufferWidth, y: 0.5 * maxSigHeight }
            ]
    }
}

function initCanvasContexts(signalName) {
    contexts[signalName] = {}
    contexts[signalName]['signal'] = ractive.find("#" + signalName + "SigCanvas").getContext("2d", { willReadFrequently: true });
    contexts[signalName]['buffer'] = ractive.find("#" + signalName + "BufferCanvas").getContext("2d", { willReadFrequently: true });
}

function updateCanvas(signalName) {
    currentContext = contexts[signalName]["signal"]
    currentContext.canvas.width = currentContext.canvas.parentElement.clientWidth;

    signal = ractive.get("display.signals." + signalName);
    signalTrigger = ractive.get("display.signals." + signalName).trigger;

    signalCanvas = contexts[signalName]["signal"]
    if (signalTrigger) {
        signalCanvas.strokeStyle = ractive.get('display.colors.' + signalName)
    } else {
        signalCanvas.strokeStyle = signalCanvas.fillStyle
    }
    signalCanvas.lineWidth = signalLineWidth;
}

function bufferNextCurve(signalName, amplitude = 0.9) {
    let signalContext = contexts[signalName]["signal"];
    let bufferContext = contexts[signalName]["buffer"];
    let bufferPointer = bufferPointers[signalName];
    let eventParameter = ractive.get("display.signals." + signalName + ".eventParameter")
    let eventRate = ractive.get("display." + eventParameter)

    // Adapt buffer size to one event:
    let bufferWidth = bufferContext.canvas.width = Math.round((60 / eventRate) * signalPixelsPerSecond);
    let bufferHeigth = bufferContext.canvas.height = Math.round(signalContext.canvas.height - signalContext.lineWidth * 2);

    // Set line color and width:
    bufferContext.strokeStyle = signalContext.strokeStyle;
    bufferContext.lineWidth = signalContext.lineWidth;

    // pleth signal height could be adjusted later:
    let maxSigHeight = bufferHeigth * amplitude
    let minValue = bufferHeigth - bufferContext.lineWidth
    // calculate points to draw curve
    points = getCurvePoints(signalName, bufferWidth, minValue, maxSigHeight)

    // interpolate curve
    // from: https://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
    bufferContext.moveTo(points[0].x, points[0].y);
    for (i = 1; i < points.length - 2; i++) {
        var xc = (points[i].x + points[i + 1].x) / 2;
        var yc = (points[i].y + points[i + 1].y) / 2;
        bufferContext.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    bufferContext.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    bufferContext.stroke();
    bufferPointer.pos = 0;
    bufferPointer.size = bufferWidth;
}

function animateSignal(signalName) {
    signalContext = contexts[signalName]['signal']
    bufferContext = contexts[signalName]['buffer']
    bufferPointer = bufferPointers[signalName]
    if (!(bufferPointer.pos < bufferPointer.size)) {
        bufferNextCurve(signalName);
    }
    bufferContext.save;
    let bufferedCol = bufferContext.getImageData(bufferPointer.pos, 0, 1, signalContext.canvas.height)
    // shift everything to the left:
    oldImageData = signalContext.getImageData(1, 0, signalContext.canvas.width - 1, signalContext.canvas.height)
    signalContext.putImageData(oldImageData, 0, 0);
    // Write buffer column to right end:
    signalContext.putImageData(bufferedCol, signalContext.canvas.width - 1, 0);

    bufferPointer.pos = bufferPointer.pos + 1;
    bufferContext.restore()
}