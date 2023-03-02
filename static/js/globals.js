let ractive;
let busTimer, signalUpdateTimer;
let runtime = 0;
let bufferPointers = {};
const contexts = {};

const updateInterval = 100;
const signalPixelsPerSecond = 150;
const signalLineWidth = 4;
const wordStringLength = 3;

const fallbackPatient = {
    firstName: 'John',
    surname: 'Doe',
    dob: new Date('1970-01-01T00:00:00'),
    pid: '123456789',
};

const fallbackVitals = {
    hfEcg: {
        id: 'hfEcg',
        title: 'HF<sub>ECG</sub> (bpm)',
        target: 60,
        min: 0,
        max: 230,
        varFreq: 1000,
        varAmp: 1,
        initDelay: 1000,
        trigger: 'ecg',
        override: '',
    },
    hfPleth: {
        id: 'hfPleth',
        title: 'HF<sub>Pleth</sub> (bpm)',
        target: 60,
        min: 0,
        max: 230,
        varFreq: 2000,
        varAmp: 2,
        initDelay: 10000,
        trigger: 'pleth',
        override: 'hfEcg',
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
        override: '',
    },
    resp: {
        id: 'resp',
        title: 'Resp (bpm)',
        target: 14,
        min: 0,
        max: 180,
        varFreq: 5000,
        varAmp: 5,
        initDelay: 3000,
        trigger: 'resp',
        override: '',
    },
    nbpSys: {
        id: 'nbpSys',
        title: 'NPB<sub>SYS</sub> (mmHg)',
        target: 120,
        min: 30,
        max: 220,
        varFreq: 10000,
        varAmp: null,
        initDelay: 30000,
        trigger: 'nbp',
        override: '',
    },
    nbpDia: {
        id: 'nbpDia',
        title: 'NPB<sub>DIA</sub> (mmHg)',
        target: 60,
        min: 20,
        max: 100,
        varFreq: 10000,
        varAmp: null,
        initDelay: 30000,
        trigger: 'nbp',
        override: '',
    },
    temp: {
        id: 'temp',
        title: 'Temp (&deg;C)',
        target: 37.5,
        min: 36.0,
        max: 41.5,
        varFreq: 5000,
        varAmp: 0.5,
        initDelay: 30000,
        trigger: 'temp',
        override: '',
    },
};

const fallbackTriggers = {
    ecg: true,
    pleth: true,
    resp: false,
    nbp: false,
    temp: false,
    rBeep: false,
};