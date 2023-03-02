ractive = new Ractive({
    target: '#ractive-target',
    template: '#ractive-template',
    data: {
        patient: fallbackPatient,
        vitals: fallbackVitals,
        display: {
            colors: {
                ecg: 'lawngreen',
                pleth: 'skyblue',
                nbp: 'GhostWhite',
                resp: 'gold',
                temp: 'orange',
            },
            signals: {
                pleth: {
                    id: 'pleth',
                    title: 'Pleth',
                    eventParameter: 'hfEcg',
                    trigger: 'pleth',
                },
                ecg: {
                    id: 'ecg',
                    title: 'ECG',
                    eventParameter: 'hfEcg',
                    trigger: 'ecg',
                },
                resp: {
                    id: 'resp',
                    title: 'Resp',
                    eventParameter: 'resp',
                    trigger: 'resp',
                },
            },
        },
        triggers: fallbackTriggers,
        connection: {
            status: 'disconnected',
            peerId: '',
            peers: [],
        }
    }
});

var peer = new Peer(generateWordString(wordStringLength));
let peerConection = null;

peer.on('open', (id) => {
    ractive.set('connection.peerId', id);
});

peer.on('connection', (c) => {
    peerConection = c;

    ractive.set(['connection.status','connection.peers'],
    [
        "connected",
        ractive.get('connection.peers').push(peerConection.peer),
    ])

    peerConection.on('data', (data) => {
        // Work with data...
    });
});

ractive.observe('triggers.*', (newValue, oldValue, keypath) => {
    triggerName = keypath.split('.').pop();
    Object.entries(ractive.get('display.signals')).forEach(([signalName, signalDef]) => {
        if (signalDef.trigger === triggerName) {
            updateCanvas(signalName)
        }
    })
    if (triggerName === "rBeep") {
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
}


