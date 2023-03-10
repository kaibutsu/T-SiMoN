ractive = new Ractive({
    target: '#ractive-target',
    template: '#ractive-template',
    data: {
        patient: standardPatient,
        vitals: standardVitals,
        display: {
            colors: standardColors,
            signals: standardSignals,
        },
        triggers: standardTriggers,
        connection: {
            peerId: '',
            remotePeerId: '',
        }
    }
});

var peer = new Peer(generateWordString(wordStringLength), { debug: 3 });
let peerConnection = null;

peer.on('open', (id) => {
    ractive.set({
        'connection.peerId': id,
    });
});

peer.on('connection', (c) => {
    peerConnection = c;

    ractive.set('connection.remotePeerId', peerConnection.peer);

    setTimeout(() => {
        peerConnection.send(
            prepareDataForSend(
                type = 'patient',
                payload = ractive.get('patient')
            )
        )

        peerConnection.send(
            prepareDataForSend(
                type = 'vitals',
                payload = ractive.get('vitals')
            )
        )
    }, 1000);

    peerConnection.on('data', (data) => {
        validatedData = validateData(data);
        ractive.set(validatedData.type, validatedData.payload)
    });

    peerConnection.on('close', () => {
        closeConnection();
    })
});

peer.on('disconnect', () => {
    closeConnection();
})

ractive.observe('triggers.*', (newValue, oldValue, keypath) => {
    triggerName = keypath.split('.').pop();
    Object.entries(ractive.get('display.signals')).forEach(([signalName, signalDef]) => {
        if (signalDef.trigger === triggerName) {
            updateCanvas(signalName)
        }
    })
    if (triggerName === 'rBeep') {
        newValue ? monitorAudioContext = new AudioContext() : monitorAudioContext.close();
    }
}, { 'init': false, 'defer': true });

window.addEventListener('resize', () => {
    Object.entries(ractive.get('display.signals')).forEach(([signalName, signalDef]) => {
        updateCanvas(signalName);
    })
});

Object.entries(ractive.get('display.signals')).forEach(([signalName, signalDef]) => {
    initCanvasContexts(signalName);
    bufferPointers[signalName] = {
        pos: 0,
        size: 0,
    }
})

Object.entries(ractive.get('display.signals')).forEach(([signalName, signalDef]) => {
    updateCanvas(signalName);
})

if (!busTimer) {
    busTimer = setInterval(() => {
        updateMonitor();
    }, updateInterval)
}

if (!signalUpdateTimer) {
    signalUpdateTimer = setInterval(() => {
        Object.entries(ractive.get('display.signals')).forEach(([signalName, signalDef]) => {
            animateSignal(signalName)
        });
        ecgBufferPointer = bufferPointers['ecg']
        if (ractive.get('triggers.rBeep') & (!(ecgBufferPointer.pos < ecgBufferPointer.size))) {
            beep(
                150,
                220 + (220 / 100 * ractive.get('display.pleth')),
                100,
                monitorAudioContext
            );
        }
    }, 1000 / signalPixelsPerSecond);
};
