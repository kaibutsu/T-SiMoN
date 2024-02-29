function getCurvePoints(signalName, bufferWidth, minValue, maxSigHeight) {
    switch (signalName) {
        case 'pleth':
            return [
                { x: Math.floor(0.0 * bufferWidth), y: Math.floor(minValue - 0.0 * maxSigHeight) },
                { x: Math.floor(0.1 * bufferWidth), y: Math.floor(minValue - 0.0 * maxSigHeight) },
                { x: Math.floor(0.2 * bufferWidth), y: Math.floor(minValue - 1.0 * maxSigHeight) },
                { x: Math.floor(0.4 * bufferWidth), y: Math.floor(minValue - 0.4 * maxSigHeight) },
                { x: Math.floor(0.7 * bufferWidth), y: Math.floor(minValue - 0.5 * maxSigHeight) },
                { x: Math.floor(0.9 * bufferWidth), y: Math.floor(minValue - 0.0 * maxSigHeight) },
                { x: Math.floor(1.0 * bufferWidth), y: Math.floor(minValue - 0.0 * maxSigHeight) },
            ]
        case 'ecg':
            return [
                { x: Math.floor(0.000 * bufferWidth), y: Math.floor(minValue - 1.00 * maxSigHeight) },
                { x: Math.floor(0.030 * bufferWidth), y: Math.floor(minValue - 0.10 * maxSigHeight) },
                { x: Math.floor(0.100 * bufferWidth), y: Math.floor(minValue - 0.20 * maxSigHeight) },
                { x: Math.floor(0.200 * bufferWidth), y: Math.floor(minValue - 0.20 * maxSigHeight) },
                { x: Math.floor(0.275 * bufferWidth), y: Math.floor(minValue - 0.35 * maxSigHeight) },
                { x: Math.floor(0.350 * bufferWidth), y: Math.floor(minValue - 0.20 * maxSigHeight) },
                { x: Math.floor(0.500 * bufferWidth), y: Math.floor(minValue - 0.20 * maxSigHeight) },
                { x: Math.floor(0.625 * bufferWidth), y: Math.floor(minValue - 0.20 * maxSigHeight) },
                { x: Math.floor(0.700 * bufferWidth), y: Math.floor(minValue - 0.35 * maxSigHeight) },
                { x: Math.floor(0.775 * bufferWidth), y: Math.floor(minValue - 0.20 * maxSigHeight) },
                { x: Math.floor(0.900 * bufferWidth), y: Math.floor(minValue - 0.20 * maxSigHeight) },
                { x: Math.floor(0.970 * bufferWidth), y: Math.floor(minValue - 0.20 * maxSigHeight) },
                { x: Math.floor(1.000 * bufferWidth), y: Math.floor(minValue - 1.00 * maxSigHeight) },
            ]
        case 'resp':
            return [
                { x: Math.floor(0.00 * bufferWidth), y: Math.floor(minValue) },
                { x: Math.floor(0.10 * bufferWidth), y: Math.floor(minValue) },
                { x: Math.floor(0.45 * bufferWidth), y: Math.floor(minValue - maxSigHeight) },
                { x: Math.floor(0.90 * bufferWidth), y: Math.floor(minValue) },
                { x: Math.floor(1.00 * bufferWidth), y: Math.floor(minValue) },
            ]
        default:
            return [
                { x: 0, y: Math.floor(0.5 * maxSigHeight) },
                { x: bufferWidth, y: Math.floor(0.5 * maxSigHeight) }
            ]
    }
}

function initCanvasContexts(signalName) {
    contexts[signalName] = {}
    contexts[signalName]['signal'] = ractive.find('#' + signalName + 'SigCanvas').getContext('2d', { willReadFrequently: true });
    contexts[signalName]['buffer'] = ractive.find('#' + signalName + 'BufferCanvas').getContext('2d', { willReadFrequently: true });
}

function updateCanvas(signalName) {
    currentContext = contexts[signalName]['signal']
    canvasWidth = currentContext.canvas.width = currentContext.canvas.parentElement.clientWidth;

    signal = ractive.get('display.signals.' + signalName);
    signalTrigger = ractive.get('display.signals.' + signalName).trigger;

    signalCanvas = contexts[signalName]['signal']
    if (signalTrigger) {
        signalCanvas.strokeStyle = ractive.get('display.colors.' + signalName)
    } else {
        signalCanvas.strokeStyle = signalCanvas.fillStyle
    }
    signalCanvas.lineWidth = signalLineWidth;
}

function bufferNextCurve(signalName, pixelPerRefresh, amplitude = 0.9) {
    let signalContext = contexts[signalName]['signal'];
    let bufferContext = contexts[signalName]['buffer'];
    let bufferPointer = bufferPointers[signalName];
    let eventVital = ractive.get('display.signals.' + signalName + '.eventVital')
    let eventRate = ractive.get('display.' + eventVital)
    
    // Adapt buffer size to one event:
    let bufferWidth = bufferContext.canvas.width = Math.round((60 * 1000) / (eventRate * monitorRefreshIntervalMs)) * pixelPerRefresh
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
    let signalContext = contexts[signalName]['signal'];
    let signalCanvasWidth = signalContext.canvas.width;
    let signalCanvasHeight = signalContext.canvas.height;

    let bufferContext = contexts[signalName]['buffer'];
    let bufferPointer = bufferPointers[signalName];
    let pixelPerRefresh = Math.floor(signalCanvasWidth/10);
    while (pixelPerRefresh > 5) {
        pixelPerRefresh = Math.floor(pixelPerRefresh * 0.5)
    }
    if (pixelPerRefresh < 1) {
        pixelPerRefresh = 1
    }
    
    if (!(bufferPointer.pos < bufferPointer.size)) {
        bufferNextCurve(signalName, pixelPerRefresh);
    }
    bufferContext.save;
    let bufferedCol = bufferContext.getImageData(bufferPointer.pos, 0, pixelPerRefresh, signalCanvasHeight)
    // shift everything to the left:
    oldImageData = signalContext.getImageData(pixelPerRefresh, 0, signalCanvasWidth - pixelPerRefresh, signalCanvasHeight)
    signalContext.putImageData(oldImageData, 0, 0);
    // Write buffer column to right end:
    signalContext.putImageData(bufferedCol, signalCanvasWidth - pixelPerRefresh, 0);

    bufferPointer.pos = bufferPointer.pos + pixelPerRefresh;
    bufferContext.restore()
}