ractive = new Ractive({
    target: '#ractive-target',
    template: '#ractive-template',
    data: {
        patient: null,
        vitals: null,
        sounds: null,
        connection: {
            peerId: '',
            remotePeerId: '',
            keepInSync: true,
        },
    },
    connectToMonitor: () => {
        peerConnection = initConnection()
    },
    disconnectFromMonitor: () => {
        peerConnection.close()
    },
    sendToMonitor: () => {
        sendToMonitor()
    }
});

let peer = new Peer(generateWordString(wordStringLength), { debug: 3 });
let peerConnection = null;
const mySearchParams = new URLSearchParams(window.location.search)

peer.on('open', (id) => {
    ractive.set({
        'connection.peerId': id,
        'connection.remotePeerId': ''
    });
    peerConnection = initConnection()

    peerConnection.on("open", () => {
        ractive.set('connection.remotePeerId', peerConnection.peer)
    });

    peerConnection.on('close', () => {
        closeConnection(deleteLocalData = true)
    });

    peerConnection.on('data', (data) => {
        validatedData = validateData(data);
        ractive.set(validatedData.type, validatedData.payload)
    });
});

peer.on('disconnected', (c) => {
    closeConnection(c.peer, role = 'simulator')
})

peer.on('error', e => {
    console.log("Fehler:", e)
})

function initConnection() {
    targetMonitorPeerId = document.getElementById('monitorPeerId').value
    if (!targetMonitorPeerId) {
        for (const [key, value] of mySearchParams) {
            if (key === 'monitorPeerId') {
                targetMonitorPeerId = value;
            }
        }
    }

    peerConnection = peer.connect(targetMonitorPeerId);
    return peerConnection;
}

function sendToMonitor() {
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
}

ractive.observe('patient.* vitals.* sounds.*', (newValue, oldValue, keypath) => {
    if (ractive.get('connection.keepInSync')) {
        sendToMonitor()
    }
}, { 'init': false, 'defer': true });