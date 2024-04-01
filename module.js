const systeminformation = require('systeminformation')

// Helpers

systemInformationServices = {
    time:               '  Time   ',
    system:             ' System  ',
    bios:               '  Bios   ',
    baseboard:          'Baseboard',
    cpu:                '  CPU    ',
    memory:             ' Memory  ',
    graphics:           'Graphics ',
    osInfo:             'OS       ',
    versions:           'Software ',
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

//Functions

let appName;

const setAppName = (name) => {

    appName = name;

}

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

const log = (text) => {

    console.log(serverName('clean') + text)

}

const heading = (text) => {

    console.log();
    console.log(serverName('blue') + terminalText(" " + text, 'white', 'blue', false))
    console.log();
    
}

const serviceMessage = (serviceName, text) => {
    console.log(serverName('cyan') + terminalText(" " + serviceName + " ", 'white', 'cyan', false) + divider('cyan', '') + terminalText(text, 'white', '', false))
}

const serviceInfo = (serviceName, text) => {
    console.log(serverName('purple') + terminalText(" " + serviceName + " ", 'white', 'purple', false) + divider('purple', '') + terminalText(text, 'white', '', false))
}

const serviceError = (serviceName, text) => {
    console.log(serverName('red') + terminalText(" " + serviceName + " ", 'white', 'red', false) + divider('red', '') + terminalText(text, 'red', '', false))
}

const serviceWarning = (serviceName, text) => {
    console.log(serverName('yellow') + terminalText(" " + serviceName + " ", 'white', 'yellow', false) + divider('yellow', '') + terminalText(text, 'yellow', '', false))
}

const serviceSuccess = (serviceName, text) => {
    console.log(serverName('green') + terminalText(" " + serviceName + " ", 'white', 'green', false) + divider('green', '') + terminalText(text, 'white', '', false))
}

const message = (infoText) => {
    console.log(serverName('') + dividerBack('blue', '') + terminalText("   Info  ", 'white', 'blue', false) + divider('purple', '') + terminalText(infoText, 'blue', '', false))
}

const error = (errorText) => {
    console.log(serverName('') + dividerBack('red', '') + terminalText("  Error ", 'white', 'red', false) + divider('red', '') + terminalText(errorText, 'red', '', false))
}

const warning = (warningText) => {
    console.log(serverName('') + dividerBack('yellow', '') + terminalText(" Warning", 'white', 'yellow', false) + divider('yellow', '') + terminalText(warningText, 'yellow', '', false))
}

const info = (infoText) => {
    console.log(serverName('') + dividerBack('purple', '') + terminalText("   Info  ", 'white', 'purple', false) + divider('purple', '') + terminalText(infoText, 'purple', '', false))
}

const success = (infoText) => {
    console.log(serverName('') + dividerBack('green', '') + terminalText("   Info  ", 'white', 'green', false) + divider('green', '') + terminalText(infoText, 'white', '', false))
}

const systemTimeInformation = async () => {

    const time = await systeminformation.time()

    const formatedTime = unixTimeConverter(time.current)

    serviceInfo(systemInformationServices.time,     `\x1b[1mUTC Time:               \x1b[0m${formatedTime.UTCFormatedTime}`)
    serviceInfo(systemInformationServices.time,     `\x1b[1mLocal Time:             \x1b[0m${formatedTime.localFormatedTime}`)
    serviceInfo(systemInformationServices.time,     `\x1b[1mTimezone:               \x1b[0m${time.timezone}`)
    serviceInfo(systemInformationServices.time,     `\x1b[1mTimezone:               \x1b[0m${time.timezoneName}`)

}

const systemDataInformation = async () => {

    const system = await systeminformation.system()

    serviceInfo(systemInformationServices.system,   `\x1b[1mUUID:                   \x1b[0m${system.uuid}`)

}

const systemBiosInformation = async () => {

    const bios = await systeminformation.bios()

    serviceInfo(systemInformationServices.bios,     `\x1b[1mBIOS Vendor:            \x1b[0m${bios.vendor}`)
    serviceInfo(systemInformationServices.bios,     `\x1b[1mBIOS Version:           \x1b[0m${bios.version}`)

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

}

const systemInformation = async () => {
    systemTimeInformation()
    systemDataInformation()
    systemBiosInformation()
    systemCPUInformation()
    systemMemoryInformation()
}

// Module init

module.exports = {

    appName: setAppName,

    log,
    heading,
    serviceMessage,
    serviceInfo,
    serviceWarning,
    serviceError,
    serviceSuccess,
    message,
    info,
    warning,
    error,
    success,
    
    systemInformation,
    systemTimeInformation

}