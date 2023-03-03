ractive = new Ractive({
    target: '#ractive-target',
    template: '#ractive-template',
    data: {
        patient: {},
        vitals: {},
        connection: {
            status: 'disconnected',
            peerId: '',
            monitorPeerId: '',
            peers: [],
        },
    },
    connectToMonitor: (monitorPeerId) => {
        c = peer.connect(monitorPeerId);
        initConnection(c)
    }
});

var peer = new Peer(generateWordString(wordStringLength));
let peerConnection = null;

peer.on('open', (id) => {
    ractive.set('connection.peerId', id);
});

peer.on('connection', initConnection);

peer.on('disconnected', (c) => {
    ractive.set('connection.status', 'disconnected');
    ractive.push('connection.peers', peerConnection.peer);
})

function initConnection(c) {
    peerConnection = c;

    ractive.set('connection.status', 'connected');
    ractive.push('connection.peers', peerConnection.peer);

    peerConnection.on('data', (data) => {
        // Work with data...
    });
}