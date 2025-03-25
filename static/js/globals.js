let ractive;
let busTimer, signalUpdateTimer;
let runtime = 0;
let bufferPointers = {};
const contexts = {};

const timeStamp = new Date()
const monitorRefreshIntervalMs = 20;
const displayValueUpdateInterval = 100;
const signalLineWidth = 4;
const wordStringLength = 3;

const validDataTypes = ['patient', 'vitals', 'sounds'];

const standardSounds = {
    breathing: {
        selected: 'None',
        probability: '0.7',
        files: {
            none: {
                label: 'None',
                fileName: '""',
            },
            crying: {
                label: 'Crying',
                fileName: 'crying.mp3',
            },
            grunting: {
                label: 'Grunting',
                fileName: 'grunting.mp3',
            },
        },
    }
}

const standardColors = {
    ecg: 'lawngreen',
    pleth: 'skyblue',
    nbp: 'GhostWhite',
    resp: 'gold',
    temp: 'orange',
}

const standardSignals = {
    pleth: {
        id: 'pleth',
        title: 'Pleth',
        eventVital: 'hfEcg',
        trigger: 'pleth',
    },
    ecg: {
        id: 'ecg',
        title: 'ECG',
        eventVital: 'hfEcg',
        trigger: 'ecg',
    },
    resp: {
        id: 'resp',
        title: 'Resp',
        eventVital: 'resp',
        trigger: 'resp',
    },
}

const standardPatient = {
    firstName: 'Baby',
    lastName: 'Blue',
    // Somewhat complicated function to store current time as local ISO conformant string...
    dob: new Date(
        timeStamp.getTime() - timeStamp.getTimezoneOffset() * 60 * 1000
    ).toISOString().slice(0, -8),
    pid: '123456789',
};

const standardVitals = {
    hfEcg: {
        id: 'hfEcg',
        title: 'HF<sub>ECG</sub> (bpm)',
        target: 140,
        min: 40,
        max: 230,
        varFreq: 1000,
        varAmp: 1,
        initDelay: 1000,
        trigger: 'ecg',
        decimals: 0,
    },
    pleth: {
        id: 'pleth',
        title: 'SpO<sub>2</sub> (%)',
        target: 100,
        min: 21,
        max: 100,
        varFreq: 2000,
        varAmp: 1,
        initDelay: 10000,
        trigger: 'pleth',
        decimals: 0,
    },
    resp: {
        id: 'resp',
        title: 'Resp (bpm)',
        target: 50,
        min: 5,
        max: 180,
        varFreq: 1000,
        varAmp: 5,
        initDelay: 3000,
        trigger: 'resp',
        decimals: 0,
    },
    nbpSys: {
        id: 'nbpSys',
        title: 'NPB<sub>SYS</sub> (mmHg)',
        target: 50,
        min: 0,
        max: 220,
        varFreq: 1000,
        varAmp: null,
        initDelay: 10000,
        trigger: 'nbp',
        decimals: 0,
    },
    nbpDia: {
        id: 'nbpDia',
        title: 'NPB<sub>DIA</sub> (mmHg)',
        target: 20,
        min: 0,
        max: 100,
        varFreq: 1000,
        varAmp: null,
        initDelay: 10000,
        trigger: 'nbp',
        decimals: 0,
    },
    temp: {
        id: 'temp',
        title: 'Temp (&deg;C)',
        target: 37.5,
        min: 35.5,
        max: 41.5,
        varFreq: 1000,
        varAmp: 0,
        initDelay: 10000,
        trigger: 'temp',
        decimals: 1,
    },
};

const standardTriggers = {
    ecg: true,
    pleth: true,
    resp: false,
    nbp: false,
    temp: false,
    rBeep: false,
};