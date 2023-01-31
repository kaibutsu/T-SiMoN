function varyParameter(parameterName) {
    parameter = ractive.get('vitals.' + parameterName)

    if (parameter.override) {
        ractive.set(
            'display.' + parameterName,
            ractive.get('display.' + parameter.override)
        );
        return;
    }

    let newDisplay = Math.round(
        parameter.target
        + (2 * (Math.random() - 0.5) * parameter.varAmp)
    )
    newDisplay = Math.max(
        Math.min(
            newDisplay, parameter.max
        ), parameter.min
    )

    ractive.set('display.' + parameterName, newDisplay)
};

function updateMonitor() {
    let vitals = ractive.get('vitals');

    runtime += updateInterval;
    ractive.set('display.dateTime', new Date().toLocaleString());

    Object.entries(vitals).forEach(([parameterName, parameterDef]) => {
        if (
            runtime % ractive.get("vitals." + parameterName + ".varFreq") < updateInterval
        ) {
            varyParameter(parameterName)
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
function beep(duration, frequency, volume, audioContext){
    if (!audioContext | !(audioContext instanceof AudioContext)) {
        throw new Error("No valid AudioContext given.")
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
            oscillatorNode.type= "sine";
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