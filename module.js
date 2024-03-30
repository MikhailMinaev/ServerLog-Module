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

const serviceInfo = (serviceName, text) => {
    console.log(serverName('cyan') + terminalText(" " + serviceName + " ", 'white', 'cyan', false) + divider('cyan', '') + terminalText(text, 'white', '', false))
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

// Module init

module.exports = {

    log,
    heading,
    serviceInfo,
    serviceError,
    serviceWarning,
    serviceSuccess,
    error,
    warning,
    info,
    success,
    appName: setAppName

}