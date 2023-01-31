class VitalDefinition {
    constructor(id, title, target, min, max, varFreq, varAmp, initDelay, trigger, override) {
        this.id = id;
        this.title = title;
        this.target = target;
        this.min = min;
        this.max = max;
        this.varFreq = varFreq;
        this.varAmp = varAmp;
        this.initDelay = initDelay;
        this.trigger = trigger;
        this.override = override;
    }
}

class SignalDefinition {
    constructor(id, title, eventParameter, trigger) {
        this.id = id;
        this.title = title;
        this.eventParameter = eventParameter;
        this.trigger = trigger;
    }
}

class Patient {
    firstName = "John"
    surname = "Doe"
    dob = new Date("1970-01-01T00:00:00")
    pid = "123456789"
    constructor(firstName, surname, dob, pid) {
        this.firstName = firstName;
        this.surname = surname;
        this.dob = dob;
        this.pid = pid;
    }

    get fullName() {
        return this.surname + ", " + this.firstName;
    }

    get ymdDob() {
        let fullMonth = (this.dob.getMonth() + 1 < 10) ? '0' + (this.dob.getMonth() + 1) : this.dob.getMonth() + 1
        let fullDate = (this.dob.getDate() < 10) ? '0' + this.dob.getDate() : this.dob.getDate()
        return (this.dob.getFullYear() + '-' + fullMonth + '-' + fullDate)
    }

    get ageInYears() {
        var ageDate = new Date(
            Date.now() - this.dob.getTime()
        );
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    get ageInDays() {
        return (Date.now() - this.dob.getTime()) / (1000 * 60 * 60 * 24)
    }
}