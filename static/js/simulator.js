ractive = new Ractive({
    target: '#ractive-target',
    template: '#ractive-template',
    data: {
        patient: {},
        vitals: {},
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

    ractive.set(['connection.status', 'connection.peers'],
        [
            "connected",
            ractive.get('connection.peers').push(peerConection.peer),
        ])

    peerConection.on('data', (data) => {
        // Work with data...
    });
});
