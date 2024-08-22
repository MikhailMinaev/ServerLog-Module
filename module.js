const systeminformation = require('systeminformation')
const fs = require('fs');
const path = require('path');
const process = require('process');
const os = require('os');
const { setTimeout } = require('timers/promises');
const util = require('util');

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

const getLogTypeName = (logType) => {
    switch (logType) {
        case 1:
            return 'Fatal';
        case 2:
            return 'Error';
        case 3:
            return 'Warning';
        case 4:
            return 'Info';
        case 5:
            return 'Debug';
        case 6:
            return 'Trace';
        case 7:
            return 'All Logs';
    }
}

const getLogLevelByType = (logType) => {
    switch (logType.toLowerCase()) {
        case 'fatal':
            return 1;
        case 'error':
            return 2;
        case 'warning':
            return 3;
        case 'info':
            return 4;
        case 'message':
            return 4;
        case 'success':
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
let consoleLogLevel = 7;
let fileLogLevel = 6;
let serverLogLevel = 4;

let condition = undefined;
let rabbitmqConnection = false;
let restapiConnection = false;
let serverLogsEnabled = false;
let sessionToken = '';

let serverConnectionType;

let restapiConnectionHost = process.env.SERVERLOG_REST_HOST;
let rabbitmqConnectionHost = process.env.SERVERLOG_RABBITMQ_HOST;

class ServerQueue {
    constructor(conditionFn) {
        this.queue = [];
        this.isProcessing = false;
        this.conditionFn = conditionFn;
    }

    enqueue(data) {

        let postToServerFunction = () => { }

        if (serverConnectionType == 'rest') {
            postToServerFunction = async () => {
                console.log({ session: sessionToken, ...data })
                try {
                    const response = fetch(`http://${restapiConnectionHost}/logs`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ session: sessionToken, ...data })
                    });
                    // const data = await response.json(); // Парсинг JSON ответа
                    // console.log(data); // Ответ от сервера
                } catch (error) {
                    console.error('Ошибка:', error);
                }
            }
        } else if (serverConnectionType == 'rabbitmq') {
            postToServerFunction = () => {
                console.log({ session: sessionToken, ...data})
            }
        } else {
            return
        }

        this.queue.push(postToServerFunction);
        this.processQueue(); // Try to process the queue after adding a new function
    }

    async processQueue() {
        if (this.isProcessing || !this.conditionFn()) {
            // If queue is processing or the condition is not met, exit
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0 && this.conditionFn()) {
            const processFunction = this.queue.shift();
            processFunction(); // Function to be executed
        }

        this.isProcessing = false;
    }
}

const serverConditionFunction = () => condition;

const queue = new ServerQueue(serverConditionFunction);

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

    setFileLogLevel(levelName) {
        fileLogLevel = getLogLevel(levelName);
    }

    setLogToFile(value) {
        logToFile = value;
    }

    setLogFilePath(path) {
        logPath = path;
    }

    setLogFileName(name) {
        logName = `${name}.log`;
    }

    setServerConnectionType(type) {
        switch (type.toLowerCase()) {
            case 'rest':
            case 'http':
                serverConnectionType = 'rest';
                break;
            case 'rabbitmq':
            case 'rabbit':
                serverConnectionType = 'rabbitmq';
                break;
        }
    }

    setRestApiConnectionHost(host) {
        restapiConnectionHost = host;
    }

    enableServerLogs() {
        serverLogsEnabled = true;
    }

    async initializeServerLogs() {

        const log = new ServiceLogger('Initialize Server Logs');

        if (serverLogsEnabled == false) {
            log.warning('Server logs are not enabled!').process();
            condition = false;
            return
        } else if (serverConnectionType == undefined) {
            log.warning('Server connection type is not defined!').process();
            condition = false;
            return
        } else if (restapiConnectionHost == undefined) {
            log.warning('REST API connection to LogsCollectService host is not defined!').process();
            condition = false;
            return
        }

        const statusResponse = await this.getStatusOfRestApiConnection()

        if (statusResponse == undefined) {
            log.warning('REST API connection to LogsCollectService host is not available!').process();
            condition = false;
            return
        } else if (statusResponse.active != true) {
            log.warning('REST API connection to LogsCollectService host is not active!').process();
            condition = false;
            return
        }

        let sessionData = {}

        try {
            const response = await fetch(`http://${restapiConnectionHost}/sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    service: appName,
                    timestamp: Date.now(),
                    hostname: os.hostname(),
                })
            });
            sessionData = await response.json(); // Или response.json() для JSON-ответа
        } catch (error) {
            log.error('Get session data error').process();
            condition = false;
            return
        }

        // Check Session data 

        if (sessionData.error == true) {
            log.error('Get session data error').process();
            condition = false;
            return
        } else if (sessionData.data == undefined) { 
            log.error('Get session data undefined').process();
            condition = false;
            return
        } else if (sessionData.data.id == undefined) {
            log.error('Get session id undefined').process();
            condition = false;
            return
        } else {
            sessionToken = sessionData.data.id
        }

        log.success(`Server logs initialized [SessionID: ${sessionToken}]`).process();

        restapiConnection = true;
        condition = true

        queue.processQueue();

    }

    async getStatusOfRestApiConnection() {

        const log = new ServiceLogger('REST API Status');

        try {
            const response = await fetch(`http://${restapiConnectionHost}/status`);
            const data = await response.json(); // Или response.json() для JSON-ответа
            return data
        } catch (error) {
            log.error('Get status of REST API connection error').process();
            return undefined
        }

    }

    options() {
        return {
            consoleLogLevel: consoleLogLevel,
            serverLogLevel: serverLogLevel,
            fileLogLevel: fileLogLevel,
        }
    }

    parseArgs(args, formatedText, data, dataFormat, textColor) {

        let message = '';
        let text = '';

        args.forEach((arg, index) => {
            if (index > 0) { text += ' '; message += ' '; };

            if (typeof arg == 'string') {
                formatedText += terminalText(arg, textColor, '', false);
                message += arg
                text += arg;
            } else if (arg instanceof Error) {
                formatedText += '\n' + util.inspect(arg, { depth: 1000, colors: true, compact: true, maxArrayLength: 300 }) + ' '
                text += '\n' + util.inspect(arg, { depth: 1000, colors: false, compact: true, maxArrayLength: 300 }) + ' '
                data = util.inspect(arg, { depth: 1000, colors: false, compact: true, maxArrayLength: 300 })
                dataFormat = 'message'
            } else if (arg instanceof Array) {
                formatedText += util.inspect(arg, { depth: 1000, colors: true, compact: true, maxArrayLength: 300 }) + ' '
                text += util.inspect(arg, { depth: 1000, colors: false, compact: true, maxArrayLength: 300 }); + ' '
                if (data == undefined) {
                    data = arg
                    dataFormat = 'array'
                }
            } else if (arg instanceof Object) {
                formatedText += util.inspect(arg, { depth: 1000, colors: true, compact: true, maxArrayLength: 300 }) + ' '
                text += util.inspect(arg, { depth: 1000, colors: false, compact: true, maxArrayLength: 300 }); + ' '
                if (data == undefined) {
                    data = arg
                    dataFormat = 'object'
                }
            }

        })
        return { text: text, formatedText: formatedText, message: message, data: data, dataFormat: dataFormat }
    }

    log(text) {
        const formatedText = serverName('clean') + text;
        return new Log(text, formatedText, this.options()).setLogType('All');
    }

    heading(text) {
        const formatedText = '\n' + serverName('blue') + terminalText(text, 'white', 'blue', false) + '\n';
        return new Log(text, formatedText, this.options()).setLogType('Info');
    }

    error(...args) {

        let { text, formatedText, message, data, dataFormat } = this.parseArgs([...args], serverName('') + dividerBack('red', '') + terminalText("  Error ", 'white', 'red', false) + divider('red', ''), undefined, 'message', 'red');   

        return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message }).setLogType('Error');
    }

    warning(text) {
        const formatedText = serverName('') + dividerBack('yellow', '') + terminalText(" Warning", 'white', 'yellow', false) + divider('yellow', '') + terminalText(text, 'yellow', '', false);
        return new Log(text, formatedText, this.options()).setLogType('Warning');
    }

    success(text) {
        const formatedText = serverName('') + dividerBack('green', '') + terminalText(" Success", 'white', 'green', false) + divider('green', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText, this.options()).setLogType('Success');
    }

    message(text) {
        const formatedText = serverName('') + dividerBack('cyan', '') + terminalText(" Message", 'white', 'cyan', false) + divider('cyan', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText, this.options()).setLogType('Message');
    }

    debug(text) {
        const formatedText = serverName('') + dividerBack('blue', '') + terminalText("  Debug ", 'white', 'blue', false) + divider('blue', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText, this.options()).setLogType('Debug');
    }

    info(text) {
        const formatedText = serverName('') + dividerBack('purple', '') + terminalText("  Info  ", 'white', 'purple', false) + divider('purple', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText, this.options()).setLogType('Info');
    }
}

class ServiceLogger {

    #serviceConsoleLogLevel;
    #serviceServerLogLevel;
    #serviceFileLogLevel;

    constructor(serviceName, options) {
        this.serviceName = serviceName;
        this.#serviceConsoleLogLevel = options?.consoleLogLevel != undefined ? getLogLevel(options.consoleLogLevel) : consoleLogLevel;
        this.#serviceServerLogLevel = options?.serverLogLevel != undefined ? getLogLevel(options.serverLogLevel) : serverLogLevel;
        this.#serviceFileLogLevel = options?.fileLogLevel != undefined ? getLogLevel(options.fileLogLevel) : fileLogLevel;
    }

    options() {
        return {
            consoleLogLevel: this.#serviceConsoleLogLevel,
            serverLogLevel: this.#serviceServerLogLevel,
            fileLogLevel: this.#serviceFileLogLevel,
        }
    }

    log(text) {
        const formatedText = serverName('') + terminalText(this.serviceName, 'white', '', false) + divider('white', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText, this.options()).setServiceName(this.serviceName).setLogLevel('All');
    }

    error(text) {
        const formatedText = serverName('red') + terminalText(this.serviceName, 'white', 'red', false) + divider('red', '') + terminalText(text, 'red', '', false);
        return new Log(text, formatedText, this.options()).setServiceName(this.serviceName).setLogType('Error');
    }

    warning(text) {
        const formatedText = serverName('yellow') + terminalText(this.serviceName, 'white', 'yellow', false) + divider('yellow', '') + terminalText(text, 'yellow', '', false);
        return new Log(text, formatedText, this.options()).setServiceName(this.serviceName).setLogLevel('warning').setLogType('Warning');
    }

    success(text) {
        const formatedText = serverName('green') + terminalText(this.serviceName, 'white', 'green', false) + divider('green', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText, this.options()).setServiceName(this.serviceName).setLogType('Success');
    }

    message(text) {
        const formatedText = serverName('cyan') + terminalText(this.serviceName, 'white', 'cyan', false) + divider('cyan', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText, this.options()).setServiceName(this.serviceName).setLogType('Message');
    }

    debug(text) {
        const formatedText = serverName('blue') + terminalText(this.serviceName, 'white', 'blue', false) + divider('blue', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText, this.options()).setServiceName(this.serviceName).setLogType('Debug');
    }

    info(text) {
        const formatedText = serverName('purple') + terminalText(this.serviceName, 'white', 'purple', false) + divider('purple', '') + terminalText(text, 'white', '', false);
        return new Log(text, formatedText, this.options()).setServiceName(this.serviceName).setLogType('Info');
    }
}

class Log {

    #text;
    #formatedText;
    #consoleLogLevel;
    #serverLogLevel;
    #fileLogLevel
    #logToFile;
    #logToServer;
    #logType;
    #logLevel;
    #serviceName = undefined;

    #data = undefined;
    #dataFormat = undefined;
    #message = undefined;

    constructor(text, formatedText, options) {
        // console.log(options)
        this.#text = text;
        this.#formatedText = formatedText;
        this.#consoleLogLevel = options?.consoleLogLevel != undefined ? options.consoleLogLevel : 0;
        this.#serverLogLevel = options?.serverLogLevel != undefined ? options.serverLogLevel : 0;
        this.#fileLogLevel = options?.fileLogLevel != undefined ? options.fileLogLevel : 0;
        this.#logLevel = options?.logLevel != undefined ? getLogLevel(options.logLevel) : 7;
        this.#logType = options?.logType != undefined ? options.logType : 'Message';
        this.#logToFile = options?.logToFile != undefined ? options.logToFile : undefined;
        this.#logToServer = options?.logToServer != undefined ? options.logToFile : undefined;

        this.#data = options?.data != undefined ? options.data : undefined;
        this.#dataFormat = options?.dataFormat != undefined ? options.dataFormat : undefined;
        this.#message = options?.message != undefined ? options.message : undefined;
    }

    /** @private */
    setServiceName(serviceName) {
        this.#serviceName = serviceName;
        return this;
    }

    setLogType(logType) {
        this.#logType = logType;
        this.#logLevel = getLogLevelByType(logType)
        return this;
    }

    /** @private */
    setLogLevel(logLevel) {
        this.#logType = logLevel;
        return this;
    }

    saveToFile(state) {
        this.#logToFile = state != undefined ? state : true;
        return this;
    }

    saveToServer(state) {
        this.#logToServer = state != undefined ? state : true;
        return this;
    }

    process() {

        // console.log(`Check | Log level: ${this.#logLevel} | Log type: ${this.#logType.padEnd(7, ' ')} | Console Log Level: ${this.#consoleLogLevel} | Server Log Level: ${this.#serverLogLevel}`)

        // Console Logging 

        if (this.#logLevel <= this.#consoleLogLevel) {
            console.log(this.#formatedText)
        }

        // Saving to file

        let fileServiceNameBlock = ''
        let messageTypeBlock = ''

        if (this.#serviceName != undefined) {
            fileServiceNameBlock = `${this.#serviceName} | `
        }

        if (this.#serviceName != undefined) {
            messageTypeBlock = `[Service ${this.#logType}]`
        } else {
            messageTypeBlock = `[${this.#logType}]`
        }

        messageTypeBlock = messageTypeBlock.padEnd(17, ' ')

        if (this.#logToFile != false && (logPath != undefined && logPath != undefined) && (this.#logLevel <= this.#fileLogLevel || this.#logToFile == true)) {
            // console.log(`Saving to file: ${logPath}${logName} | Log level: ${this.#logLevel} | Log type: ${this.#logType.padEnd(7, ' ') } | Console Log Level: ${this.#consoleLogLevel} | Server Log Level: ${this.#serverLogLevel}`)
            fs.appendFile(path.join(logPath, logName), `${getCurrentTimestamp()} ${messageTypeBlock} | ${appName} | ${fileServiceNameBlock}${this.#text} \n`, (err) => {
                if (err) { console.error('Error when adding new data to log:', err); }
            });
        }

        // Saving to server

        if (this.#logToServer != false && (serverLogsEnabled != false && condition != false) && (this.#logLevel <= this.#serverLogLevel || this.#logToServer == true)) {
            // console.log(`Saving to server: ${serverConnectionType} | Log level: ${this.#logLevel} | Log type: ${this.#logType.padEnd(7, ' ') } | Console Log Level: ${this.#consoleLogLevel} | Server Log Level: ${this.#serverLogLevel}`)
            
            const data = {
                subservice: this.#serviceName == undefined ? appName : this.#serviceName,
                timestamp: Date.now(),
                type: this.#logType.toLowerCase(),
            }

            if (this.#data != undefined && this.#dataFormat != undefined && this.#dataFormat != 'message') {
                data.data = this.#data;
                data.format = this.#dataFormat;
                data.message = this.#message;
            } else if (this.#logType.toLowerCase() == 'error' && this.#data != undefined && this.#dataFormat == 'message') {
                data.format = 'message';
                data.message = this.#text
            } else {
                data.format = 'message';
                data.message = this.#text;
            }

            queue.enqueue(data)
        }
    }
}

// Module init

module.exports = {
    
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