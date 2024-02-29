function varyVital(vitalName) {
    vital = ractive.get('vitals.' + vitalName)

    let newDisplay = Math.round(
        vital.target
        + (2 * (Math.random() - 0.5) * vital.varAmp)
    )
    newDisplay = Math.max(
        Math.min(
            newDisplay, vital.max
        ), vital.min
    )

    ractive.set('display.' + vitalName, newDisplay)
};

function updateMonitor() {
    let vitals = ractive.get('vitals');

    runtime += displayValueUpdateInterval;
    ractive.set('display.dateTime', new Date().toLocaleString());

    Object.entries(vitals).forEach(([vitalName, vitalDef]) => {
        if (
            runtime % ractive.get('vitals.' + vitalName + '.varFreq') < displayValueUpdateInterval
        ) {
            varyVital(vitalName)
        }
    });
}

/**
 * Helper function to emit a beep sound in the browser using the Web Audio API.
 * Taken from https://ourcodeworld.com/articles/read/1627/how-to-easily-generate-a-beep-notification-sound-with-javascript
 * 
 * @param {number} duration - The duration of the beep sound in milliseconds.
 * @param {number} frequency - The frequency of the beep sound.
 * @param {number} volume - The volume of the beep sound.
 * @param {AudioContext} audioContext - The audio context to use.
 * 
 * @returns {Promise} - A promise that resolves when the beep sound is finished.
 **/
function beep(duration, frequency, volume, audioContext) {
    if (!audioContext | !(audioContext instanceof AudioContext)) {
        throw new Error('No valid AudioContext given.')
    }

    return new Promise((resolve, reject) => {
        // Set default duration if not provided
        duration = duration || 200;
        frequency = frequency || 440;
        volume = volume || 100;

        try {
            myAudioContext = new (AudioContext)
            let oscillatorNode = myAudioContext.createOscillator();
            let gainNode = myAudioContext.createGain();
            oscillatorNode.connect(gainNode);

            // Set the oscillator frequency in hertz
            oscillatorNode.frequency.value = frequency;

            // Set the type of oscillator
            oscillatorNode.type = 'sine';
            gainNode.connect(myAudioContext.destination);

            // Set the gain to the volume
            gainNode.gain.value = volume * 0.01;

            // Start audio with the desired duration
            oscillatorNode.start(myAudioContext.currentTime);
            oscillatorNode.stop(myAudioContext.currentTime + duration * 0.001);

            // Resolve the promise when the sound is finished
            oscillatorNode.onended = () => {
                myAudioContext.close();
                resolve();
            };
        } catch (error) {
            reject(error);
        }
    });
}

function prepareDataForSend(type, payload) {
    if (!validDataTypes.includes(type)) {
        throw new Error(
            'Unkonwn Type of \'' + type + '\'. '
            + 'Type should be one of the following: \''
            + validDataTypes.join('\', \'')
            + '\'.'
        );
    };

    if (typeof payload != 'object') {
        throw new Error('Payload should be of type \'object\'.');
    };

    return {
        'type': type,
        'payload': payload,
    };
}

function validateData(dataPackage) {
    if (!validDataTypes.includes(dataPackage.type)) {
        throw new Error(
            'Unkonwn Type of \'' + dataPackage.type + '\'. '
            + 'Type should be one of the following: \''
            + validDataTypes.join('\', \'')
            + '\'.'
        );
    };

    if (typeof dataPackage.payload != 'object') {
        throw new Error('Payload should be of type \'object\'.');
    };

    return dataPackage;
}

function closeConnection(deleteLocalData = false) {
    ractive.set('connection.remotePeerId', '');

    if (deleteLocalData) {
        ractive.set({
            'patient': {},
            'vitals': {},
            'sounds': {}
        });
    };
}
