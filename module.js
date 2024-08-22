const systeminformation = require('systeminformation')
const fs = require('fs');
const path = require('path');

// Helpers

systemInformationServices = {
    time:               '  Time   ',
    system:             ' System  ',
    bios:               '  Bios   ',
    baseboard:          'Baseboard',
    cpu:                '  CPU    ',
    memory:             ' Memory  ',
    graphics:           'Graphics ',
    osInfo:             '   OS    ',
    software:           'Software ',
    diskLayout:         'Disks    ',
    networkInterfaces:  'Network  ',
}

function unixTimeConverter(UNIX_timestamp){

    const timeStamp = new Date(UNIX_timestamp)

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

    //UTC Time
    const UTCYear = timeStamp.getUTCFullYear();
    const UTCMonth = timeStamp.getUTCMonth();
    const UTCMonthString = months[timeStamp.getUTCMonth()];
    const UTCDay = timeStamp.getUTCDate();
    const UTCDayString = days[timeStamp.getUTCDay()];
    const UTCHour = timeStamp.getUTCHours();
    const UTCMinutes = timeStamp.getUTCMinutes();
    const UTCSeconds = timeStamp.getUTCSeconds();
    
    //local Time
    const localYear = timeStamp.getFullYear();
    const localMonth = timeStamp.getMonth();
    const localMonthString = months[timeStamp.getMonth()];
    const localDay = timeStamp.getDate();
    const localDayString = days[timeStamp.getDay()];
    const localHour = timeStamp.getHours();
    const localMinutes = timeStamp.getMinutes();
    const localSeconds = timeStamp.getSeconds();

    const UTCTime =             `${UTCYear}/${String('0' + UTCMonth).substr(-2)}/${String('0' + UTCDay).substr(-2)} ${String('0' + UTCHour).substr(-2)}:${String('0' + UTCMinutes).substr(-2)}:${String('0' + UTCSeconds).substr(-2)} ${timeStamp.toUTCString().substring(26)}`;
    const UTCFormatedTime =     `${UTCDayString}, ${UTCYear} ${UTCMonthString} ${String('0' + UTCDay).substr(-2)} ${String('0' + UTCHour).substr(-2)}:${String('0' + UTCMinutes).substr(-2)}:${String('0' + UTCSeconds).substr(-2)} ${timeStamp.toUTCString().substring(26)}`;
    const localTime =           `${localYear}/${String('0' + localMonth).substr(-2)}/${String('0' + localDay).substr(-2)} ${String('0' + localHour).substr(-2)}:${String('0' + localMinutes).substr(-2)}:${String('0' + localSeconds).substr(-2)} ${timeStamp.toString().substring(25)}`;
    const localFormatedTime =   `${localDayString}, ${localYear} ${localMonthString} ${String('0' + localDay).substr(-2)} ${String('0' + localHour).substr(-2)}:${String('0' + localMinutes).substr(-2)}:${String('0' + localSeconds).substr(-2)} ${timeStamp.toString().substring(25)}`;

    return { 
        UTCTime: UTCTime, 
        UTCFormatedTime: UTCFormatedTime, 
        localTime: localTime,
        localFormatedTime: localFormatedTime
    };

}

const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toISOString();
};

const serverName = (nextColor) => {

    return terminalColor('black', 'white', true) + " \uf473 " + appName + " " + divider('white', nextColor) + terminalColorReset()

}

const ansiiTextColor = (textColor) => {

    switch(textColor){
        case('black'): return '30'
        case('red'): return '31'
        case('green'): return '32'
        case('yellow'): return '33'
        case('blue'): return '34'
        case('purple'): return '35'
        case('cyan'): return '36'
        case('white'): return '37'
        default: return '0'
    }

}   

const ansiiBackgrounColor = (backgroundColor) => {

    switch(backgroundColor){
        case('black'): return '40'
        case('red'): return '41'
        case('green'): return '42'
        case('yellow'): return '43'
        case('blue'): return '44'
        case('purple'): return '45'
        case('cyan'): return '46'
        case('white'): return '47'
        default: return '0'
    }

}

const terminalColor = (textColor, backgroundColor, bold) => {

    boldText = bold == true ? ";1" : ""; 
    return "\x1b[" + ansiiBackgrounColor(backgroundColor) + ";" + ansiiTextColor(textColor) + boldText + "m"

}

const terminalColorReset = () => {

    return "\x1b[0m"

}

const terminalText = (text, textColor, backgroundColor, bold) => {

    boldText = bold == true ? ";1" : ""; 
    return "\x1b[" + ansiiBackgrounColor(backgroundColor) + ";" + ansiiTextColor(textColor) + boldText + "m" + text + " " + terminalColorReset(); 

}

const divider = (textColor, backgroundColor) => {

    return terminalColorReset() + terminalColor(textColor, backgroundColor) + " " + terminalColorReset()

}

const dividerBack = (textColor, backgroundColor) => {

    return terminalColorReset() + terminalColor(textColor, backgroundColor) + "" + terminalColorReset()

}

const serviceMessage = (serviceName, text, logThisToFile = false) => {

    console.log(serverName('cyan') + terminalText(" " + serviceName + " ", 'white', 'cyan', false) + divider('cyan', '') + terminalText(text, 'white', '', false))

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Service Message] | ${appName} | ${serviceName} | ${text} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const serviceInfo = (serviceName, text, logThisToFile = false) => {

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Service Info]    | ${appName} | ${serviceName} | ${text} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const serviceError = (serviceName, text, logThisToFile = false) => {

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Service Error]   | ${appName} | ${serviceName} | ${text} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const serviceWarning = (serviceName, text, logThisToFile = false) => {

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Service Warning] | ${appName} | ${serviceName} | ${text} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const serviceSuccess = (serviceName, text, logThisToFile = false) => {

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Service Success] | ${appName} | ${serviceName} | ${text} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const message = (infoText, logThisToFile = false) => {

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Message]         | ${appName} | ${infoText} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const error = (errorText, logThisToFile = false) => {
    
    console.log()

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Error]           | ${appName} | ${errorText} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const warning = (warningText, logThisToFile = false) => {

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Warning]         | ${appName} | ${warningText} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const info = (infoText, logThisToFile = false) => {

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Info]            | ${appName} | ${infoText} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const success = (infoText, logThisToFile = false) => {

    if (logToFile || logThisToFile == true) {
        fs.appendFile(path.join(logPath, `${logName}.log`), `${getCurrentTimestamp()} [Success]         | ${appName} | ${infoText} \n`, (err) => {
            if (err) { console.error('Error when adding new data to log:', err); }
        });
    }

}

const systemTimeInformation = async () => {

    const time = await systeminformation.time()

    const formatedTime = unixTimeConverter(time.current)

    serviceInfo(systemInformationServices.time,     `\x1b[1mUTC Time:               \x1b[0m${formatedTime.UTCFormatedTime}`)
    serviceInfo(systemInformationServices.time,     `\x1b[1mLocal Time:             \x1b[0m${formatedTime.localFormatedTime}`)
    serviceInfo(systemInformationServices.time,     `\x1b[1mTimezone:               \x1b[0m${time.timezone}`)
    serviceInfo(systemInformationServices.time,     `\x1b[1mTimezone:               \x1b[0m${time.timezoneName}`)

    return
}

const systemDataInformation = async () => {

    const system = await systeminformation.system()

    serviceInfo(systemInformationServices.system,   `\x1b[1mUUID:                   \x1b[0m${system.uuid}`)

    return
}

const systemBiosInformation = async () => {

    const bios = await systeminformation.bios()

    serviceInfo(systemInformationServices.bios,     `\x1b[1mBIOS Vendor:            \x1b[0m${bios.vendor}`)
    serviceInfo(systemInformationServices.bios,     `\x1b[1mBIOS Version:           \x1b[0m${bios.version}`)

    return
}

const systemCPUInformation = async () => {

    const cpu = await systeminformation.cpu()
    const cpuFlags = await systeminformation.cpuFlags()

    serviceInfo(systemInformationServices.cpu,      `\x1b[1mCPU Company:            \x1b[0m${cpu.manufacturer}`)
    serviceInfo(systemInformationServices.cpu,      `\x1b[1mCPU:                    \x1b[0m${cpu.brand}`)
    serviceInfo(systemInformationServices.cpu,      `\x1b[1mCPU Cores:              \x1b[0m${cpu.cores}`)
    serviceInfo(systemInformationServices.cpu,      `\x1b[1mCPU Physical Cores:     \x1b[0m${cpu.physicalCores}`)
    serviceInfo(systemInformationServices.cpu,      `\x1b[1mCPU Performance Cores:  \x1b[0m${cpu.performanceCores}`)
    serviceInfo(systemInformationServices.cpu,      `\x1b[1mCPU Efficiency Cores:   \x1b[0m${cpu.efficiencyCores}`)
    serviceInfo(systemInformationServices.cpu,      `\x1b[1mProcessors:             \x1b[0m${cpu.processors}`)
    serviceInfo(systemInformationServices.cpu,      `\x1b[1mVirtualization:         \x1b[0m${cpu.virtualization ? 'Yes' : 'No'}`)

    if (cpuFlags.length > 0) {
    serviceInfo(systemInformationServices.cpu,      `\x1b[1mFlags:                  \x1b[0m${cpuFlags}`)    
    }

    return
}

const systemMemoryInformation = async (measurement) => {

    const memory = await systeminformation.mem()

    let measurementDivider
    let measurementSuffix

    if (measurement == undefined) {
        measurementDivider = 1024 * 1024 * 1024
        measurementSuffix = 'GiB'
    } else if (measurement == 'GB' || measurement == 'GiB') {
        measurementDivider = 1024 * 1024 * 1024
        measurementSuffix = 'GiB'
    } else if (measurement == 'MB' || measurement == 'MiB') {
        measurementDivider = 1024 * 1024
        measurementSuffix = 'MiB'
    }

    serviceInfo(systemInformationServices.memory,   `\x1b[1mTotal:                  \x1b[0m${Math.round(memory.total / measurementDivider)} ${measurementSuffix}`)
    serviceInfo(systemInformationServices.memory,   `\x1b[1mFree:                   \x1b[0m${Math.round(memory.free / measurementDivider)} ${measurementSuffix}`)
    serviceInfo(systemInformationServices.memory,   `\x1b[1mUsed:                   \x1b[0m${Math.round(memory.used / measurementDivider)} ${measurementSuffix}`)
    serviceInfo(systemInformationServices.memory,   `\x1b[1mActive:                 \x1b[0m${Math.round(memory.active / measurementDivider)} ${measurementSuffix}`)
    serviceInfo(systemInformationServices.memory,   `\x1b[1mAvailable:              \x1b[0m${Math.round(memory.available / measurementDivider)} ${measurementSuffix}`)

    return
}

const systemOSInformation = async () => {

    const osInfo = await systeminformation.osInfo()

    serviceInfo(systemInformationServices.osInfo,   `\x1b[1mPlatform:               \x1b[0m${osInfo.platform}`)
    serviceInfo(systemInformationServices.osInfo,   `\x1b[1mDistro:                 \x1b[0m${osInfo.distro}`)
    serviceInfo(systemInformationServices.osInfo,   `\x1b[1mVersion:                \x1b[0m${osInfo.release}`)
    serviceInfo(systemInformationServices.osInfo,   `\x1b[1mCodename:               \x1b[0m${osInfo.codename}`)
    serviceInfo(systemInformationServices.osInfo,   `\x1b[1mKernel:                 \x1b[0m${osInfo.kernel}`)
    serviceInfo(systemInformationServices.osInfo,   `\x1b[1mArch:                   \x1b[0m${osInfo.arch}`)
    serviceInfo(systemInformationServices.osInfo,   `\x1b[1mHostname:               \x1b[0m${osInfo.hostname}`)
    serviceInfo(systemInformationServices.osInfo,   `\x1b[1mSerial:                 \x1b[0m${osInfo.serial}`)
    serviceInfo(systemInformationServices.osInfo,   `\x1b[1mBuild:                  \x1b[0m${osInfo.build}`)

    return
}

const systemSoftwareInformation = async () => {

    const software = await systeminformation.versions()

    serviceInfo(systemInformationServices.software, `\x1b[1mOpenSSL:                \x1b[0m${software.openssl}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mSystem OpenSSL:         \x1b[0m${software.systemOpenssl}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mNode:                   \x1b[0m${software.node}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mV8:                     \x1b[0m${software.v8}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mNPM:                    \x1b[0m${software.npm}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mGit:                    \x1b[0m${software.git}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mMySQL:                  \x1b[0m${software.mysql}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mRedis:                  \x1b[0m${software.redis}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mMongoDB:                \x1b[0m${software.mongodb}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mNginx:                  \x1b[0m${software.nginx}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mDocker:                 \x1b[0m${software.docker}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mPython:                 \x1b[0m${software.python3}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mPIP:                    \x1b[0m${software.pip3}`)
    serviceInfo(systemInformationServices.software, `\x1b[1mZSH:                    \x1b[0m${software.zsh}`)
    
    return
}

const systemInformation = async () => {
    await systemTimeInformation()
    await systemDataInformation()
    await systemBiosInformation()
    await systemCPUInformation()
    await systemMemoryInformation()
    await systemOSInformation()
    await systemSoftwareInformation()

    return
}

// Classes refactor

const getLogLevel = (levelName) => {
    switch (levelName.toLowerCase()) {
        case 'fatal':
            return 1;
        case 'error':
            return 2;
        case 'warning':
            return 3;
        case 'info':
            return 4;
        case 'debug':
            return 5;
        case 'trace':
            return 6;
        case 'all':
            return 7;
    }
}

let appName, logPath, logName;
let logToFile = false;
let consoleLogLevel = 4;
let serverLogLevel = 4;

class Logger {
    
    constructor() {}

    setAppName(name) {
        appName = name;
    }

    setConsoleLogLevel(levelName) {
        consoleLogLevel = getLogLevel(levelName);
    }

    setServerLogLevel(levelName) {
        serverLogLevel = getLogLevel(levelName);
    }

    setLogToFile(value) {
        logToFile = value;
    }

    setLogFilePath(path) {
        logPath = path;
    }

    setLogFileName(name) {
        logName = name;
    }

    log(text) {
        const formatedText = serverName('clean') + text;
        return new Log(text, formatedText);
    }

    heading(text) {
        const formatedText = '\n' + serverName('blue') + terminalText(text, 'white', 'blue', false) + '\n';
        return new Log(text, formatedText);
    }

    error(text) {
        const formatedText = serverName('') + dividerBack('red', '') + terminalText("  Error ", 'white', 'red', false) + divider('red', '') + terminalText(text, 'red', '', false);
        return new Log(text, formatedText);
    }

    warning(text) {
        const formatedText = serverName('') + dividerBack('yellow', '') + terminalText(" Warning", 'white', 'yellow', false) + divider('yellow', '') + terminalText(text, 'yellow', '', false);
        return new Log(text, formatedText);
    }

    info(text) {
        const formatedText = serverName('') + dividerBack('purple', '') + terminalText("  Info  ", 'white', 'purple', false) + divider('purple', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText);
    }

    message(text) {
        const formatedText = serverName('') + dividerBack('cyan', '') + terminalText(" Message", 'white', 'cyan', false) + divider('cyan', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText);
    }

    debug(text) {
        const formatedText = serverName('') + dividerBack('blue', '') + terminalText("  Debug ", 'white', 'blue', false) + divider('blue', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText);
    }

    success(text) {
        const formatedText = serverName('') + dividerBack('green', '') + terminalText(" Success", 'white', 'green', false) + divider('green', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText);
    }
}

class ServiceLogger {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }

    log(text) {
        const formatedText = serverName('') + terminalText(this.serviceName, 'white', '', false) + divider('white', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText).setServiceName(this.serviceName);
    }

    error(text) {
        const formatedText = serverName('red') + terminalText(this.serviceName, 'white', 'red', false) + divider('red', '') + terminalText(text, 'red', '', false);
        return new Log(text, formatedText).setServiceName(this.serviceName);
    }

    warning(text) {
        const formatedText = serverName('yellow') + terminalText(this.serviceName, 'white', 'yellow', false) + divider('yellow', '') + terminalText(text, 'yellow', '', false);
        return new Log(text, formatedText).setServiceName(this.serviceName);
    }

    info(text) {
        const formatedText = serverName('purple') + terminalText(this.serviceName, 'white', 'purple', false) + divider('purple', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText);
    }

    message(text) {
        const formatedText = serverName('cyan') + terminalText(this.serviceName, 'white', 'cyan', false) + divider('cyan', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText);
    }

    success(text) {
        const formatedText = serverName('green') + terminalText(this.serviceName, 'white', 'green', false) + divider('green', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText);
    }
}

class Log {

    #text;
    #formatedText;
    #consoleLogLevel;
    #serverLogLevel;
    #logToFile
    #serviceName = undefined;

    constructor(text, formatedText) {
        this.#text = text;
        this.#formatedText = formatedText;
        this.#consoleLogLevel = 0;
        this.#serverLogLevel = 0;
        this.#logToFile = undefined;
    }

    /** @private */
    setServiceName(serviceName) {
        this.#serviceName = serviceName;
        return this;
    }

    process() {
        console.log(this.#formatedText)
    }
}

// Module init

module.exports = {

    serviceSuccess,
    
    systemInformation,
    systemTimeInformation,
    systemDataInformation,
    systemBiosInformation,
    systemCPUInformation,
    systemMemoryInformation,
    systemOSInformation,
    systemSoftwareInformation,

    Logger,
    ServiceLogger,

}