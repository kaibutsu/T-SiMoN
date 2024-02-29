ractive = new Ractive({
    target: '#ractive-target',
    template: '#ractive-template',
    data: {
        patient: standardPatient,
        vitals: standardVitals,
        triggers: standardTriggers,
        sounds: standardSounds,
        display: {
            colors: standardColors,
            signals: standardSignals,
        },
        connection: {
            peerId: '',
            remotePeerId: '',
        }
    },
    disconnectMonitor: () => {
        peerConnection.close()
    },
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

    peerConnection.on('open', () => {
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

        peerConnection.send(
            prepareDataForSend(
                type = 'sounds',
                payload = ractive.get('sounds')
            )
        )   
    })

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
        newValue ? beepAudioContext = new AudioContext() : beepAudioContext.close();
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
    let intervalCounter = 0

    busTimer = setInterval(() => {
        if (intervalCounter*monitorRefreshIntervalMs >= displayValueUpdateInterval)  {
            intervalCounter = 0;
            updateMonitor();
        }
            ecgBufferPointer = bufferPointers['ecg']
            if (ractive.get('triggers.rBeep') & (!(ecgBufferPointer.pos < ecgBufferPointer.size))) {
                beep(
                    150,
                    220 + (220 / 100 * ractive.get('display.pleth')),
                    100,
                    beepAudioContext
                );
            }
    
            respBufferPointer = bufferPointers['resp']
            breathingSound = ractive.get('sounds.breathing')
            if (
                !(['None', ''].includes(breathingSound.selected))
                && !(respBufferPointer.pos < respBufferPointer.size)
                && (Math.random() < breathingSound.probability)
            ) {
                document.getElementById(breathingSound.selected).play()
            } 
        Object.entries(ractive.get('display.signals')).forEach(([signalName, signalDef]) => {
            animateSignal(signalName)
        });
        intervalCounter++;
    }, monitorRefreshIntervalMs)
}
