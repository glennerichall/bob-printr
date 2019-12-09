export const levels = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5,
    none: 6
};

class Logger {
    constructor() {
        this.level = levels.error;
    }

    trace(msg) {
        if (this.level > levels.trace) return;
        console.trace(msg);
    }

    debug(msg) {
        if (this.level > levels.debug) return;
        console.debug(msg);
    }

    info(msg) {
        if (this.level > levels.info) return;
        console.info(msg);
    }

    warn(msg) {
        if (this.level > levels.warn) return;
        console.warn(msg);
    }

    error(msg) {
        if (this.level > levels.error) return;
        console.error(msg);
    }

    fatal(msg) {
        if (this.level > levels.fatal) return;
        console.fatal(msg);
    }

    log(msg) {
        console.log(msg);
    }
}

export default new Logger();