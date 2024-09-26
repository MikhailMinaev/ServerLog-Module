import systeminformation from 'systeminformation';
import fs from 'fs';
import path from 'path';
import process from 'process';
import os from 'os';
import util from 'util';
import amqp from 'amqplib';

// Types

type Arguments = string | Error | object | Array<any>;

type Color = '' | 'black' | 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'cyan' | 'white' | 'clean';

type Data = {
	subservice: string | undefined;
	timestamp: number;
	type: string;
	data?: any;
	format?: string;
	message?: string;
};

type QueueObject = () => void;

type ConditionFunction = () => boolean | undefined;

// Helpers

const systemInformationServices = {
	time: '   Time   ',
	system: '  System  ',
	bios: '   Bios   ',
	baseboard: ' Baseboard',
	cpu: '   CPU    ',
	memory: '  Memory  ',
	graphics: ' Graphics ',
	osInfo: '    OS    ',
	software: ' Software ',
	diskLayout: ' Disks    ',
	networkInterfaces: ' Network  ',
};

/**
 * Converts a UNIX timestamp to different time formats.
 *
 * @param {number} UNIX_timestamp - The UNIX timestamp to be converted.
 * @return {object} An object containing the converted time in different formats: UTCTime, UTCFormatedTime, localTime, localFormatedTime.
 */
function unixTimeConverter(UNIX_timestamp: number) {
	const timeStamp = new Date(UNIX_timestamp);

	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

	const UTCTime = `${UTCYear}/${String('0' + UTCMonth).substr(-2)}/${String('0' + UTCDay).substr(-2)} ${String('0' + UTCHour).substr(-2)}:${String('0' + UTCMinutes).substr(-2)}:${String('0' + UTCSeconds).substr(-2)} ${timeStamp.toUTCString().substring(26)}`;
	const UTCFormatedTime = `${UTCDayString}, ${UTCYear} ${UTCMonthString} ${String('0' + UTCDay).substr(-2)} ${String('0' + UTCHour).substr(-2)}:${String('0' + UTCMinutes).substr(-2)}:${String('0' + UTCSeconds).substr(-2)} ${timeStamp.toUTCString().substring(26)}`;
	const localTime = `${localYear}/${String('0' + localMonth).substr(-2)}/${String('0' + localDay).substr(-2)} ${String('0' + localHour).substr(-2)}:${String('0' + localMinutes).substr(-2)}:${String('0' + localSeconds).substr(-2)} ${timeStamp.toString().substring(25)}`;
	const localFormatedTime = `${localDayString}, ${localYear} ${localMonthString} ${String('0' + localDay).substr(-2)} ${String('0' + localHour).substr(-2)}:${String('0' + localMinutes).substr(-2)}:${String('0' + localSeconds).substr(-2)} ${timeStamp.toString().substring(25)}`;

	return {
		UTCTime: UTCTime,
		UTCFormatedTime: UTCFormatedTime,
		localTime: localTime,
		localFormatedTime: localFormatedTime,
	};
}

/**
 * Returns the current timestamp in ISO format.
 *
 * @return {string} The current timestamp in ISO format.
 */
const getCurrentTimestamp = () => {
	const now = new Date();
	return now.toISOString();
};

/**
 * Returns a formatted string representing the server name with color and icons.
 *
 * @param {string} nextColor - The next color to be used in the divider.
 * @return {string} The formatted server name string.
 */
export const serverName = (nextColor: Color) => {
	return terminalColor('black', 'white', true) + ' \uf473 ' + appName + ' ' + divider('white', nextColor) + terminalColorReset();
};

/**
 * Returns the ANSI color code for a given text color.
 *
 * @param {string} textColor - The text color (e.g. 'black', 'red', 'green', etc.)
 * @return {string} The ANSI color code for the given text color
 */
const ansiiTextColor = (textColor: Color) => {
	switch (textColor) {
		case 'black':
			return '30';
		case 'red':
			return '31';
		case 'green':
			return '32';
		case 'yellow':
			return '33';
		case 'blue':
			return '34';
		case 'purple':
			return '35';
		case 'cyan':
			return '36';
		case 'white':
			return '37';
		default:
			return '0';
	}
};

/**
 * Returns the ANSI background color code for a given background color.
 *
 * @param {string} backgroundColor - The background color (e.g. 'black', 'red', 'green', etc.)
 * @return {string} The ANSI background color code for the given background color
 */
const ansiiBackgrounColor = (backgroundColor: Color) => {
	switch (backgroundColor) {
		case 'black':
			return '40';
		case 'red':
			return '41';
		case 'green':
			return '42';
		case 'yellow':
			return '43';
		case 'blue':
			return '44';
		case 'purple':
			return '45';
		case 'cyan':
			return '46';
		case 'white':
			return '47';
		default:
			return '0';
	}
};

/**
 * Returns the ANSI escape code for a given text color and background color.
 *
 * @param {string} textColor - The text color (e.g. 'black', 'red', 'green', etc.)
 * @param {string} backgroundColor - The background color (e.g. 'black', 'red', 'green', etc.)
 * @param {boolean} bold - Whether to make the text bold
 * @return {string} The ANSI escape code for the given text color and background color
 */
const terminalColor = (textColor: Color, backgroundColor: Color, bold: boolean = false) => {
	const boldText = bold == true ? ';1' : '';
	return '\x1b[' + ansiiBackgrounColor(backgroundColor) + ';' + ansiiTextColor(textColor) + boldText + 'm';
};

/**
 * Resets the terminal color to its default state.
 *
 * @return {string} The ANSI escape code to reset the terminal color
 */
const terminalColorReset = () => {
	return '\x1b[0m';
};

/**
 * Returns a formatted string with the given text, color, background color, and bold style.
 *
 * @param {string} text - The text to be displayed.
 * @param {string} textColor - The color of the text.
 * @param {string} backgroundColor - The background color of the text.
 * @param {boolean} bold - Whether the text should be bold.
 * @return {string} The formatted string with the given text, color, background color, and bold style.
 */
const terminalText = (text: string, textColor: Color, backgroundColor: Color, bold: boolean = false) => {
	const boldText = bold == true ? ';1' : '';
	return '\x1b[' + ansiiBackgrounColor(backgroundColor) + ';' + ansiiTextColor(textColor) + boldText + 'm' + text + ' ' + terminalColorReset();
};

/**
 * Returns a divider string with the given text color and background color.
 *
 * @param {string} textColor - The text color of the divider.
 * @param {string} backgroundColor - The background color of the divider.
 * @return {string} The formatted divider string.
 */
const divider = (textColor: Color, backgroundColor: Color) => {
	return terminalColorReset() + terminalColor(textColor, backgroundColor) + ' ' + terminalColorReset();
};

/**
 * Returns a divider string with the given text color and background color,
 * specifically designed for the back part of the divider.
 *
 * @param {string} textColor - The text color of the divider.
 * @param {string} backgroundColor - The background color of the divider.
 * @return {string} The formatted divider string.
 */
const dividerBack = (textColor: Color, backgroundColor: Color) => {
	return terminalColorReset() + terminalColor(textColor, backgroundColor) + '' + terminalColorReset();
};

/**
 * Parses the given arguments and formats them into different types of output.
 *
 * @param {Array} args - The array of arguments to be parsed.
 * @param {string} formatedText - The initial formatted text.
 * @param {*} data - The initial data.
 * @param {string} dataFormat - The initial data format.
 * @param {string} textColor - The text color.
 * @return {Object} An object containing the parsed text, formatted text, message, data, and data format.
 */
const parseArgs = (args: Arguments[], prefix: string, data: any, textColor: Color) => {
	let message = '';
	let text = '';
	let dataFormat = '';
	let formatedText = prefix;

	args.forEach((arg, index) => {
		if (index > 0) {
			text += ' ';
			message += ' ';
		}

		if (typeof arg == 'string') {
			formatedText += terminalText(arg, textColor, '', false);
			message += arg;
			text += arg;
		} else if (arg instanceof Error) {
			formatedText += '\n' + util.inspect(arg, { depth: 1000, colors: true, compact: true, maxArrayLength: 300 }) + ' ';
			text += '\n' + util.inspect(arg, { depth: 1000, colors: false, compact: true, maxArrayLength: 300 }) + ' ';
			data = util.inspect(arg, { depth: 1000, colors: false, compact: true, maxArrayLength: 300 });
			dataFormat = 'message';
		} else if (arg instanceof Array) {
			formatedText += util.inspect(arg, { depth: 1000, colors: true, compact: true, maxArrayLength: 300 }) + ' ';
			text += util.inspect(arg, { depth: 1000, colors: false, compact: true, maxArrayLength: 300 });
			+' ';
			if (data == undefined) {
				data = arg;
				dataFormat = 'array';
			}
		} else if (arg instanceof Object) {
			formatedText += util.inspect(arg, { depth: 1000, colors: true, compact: true, maxArrayLength: 300 }) + ' ';
			text += util.inspect(arg, { depth: 1000, colors: false, compact: true, maxArrayLength: 300 });
			+' ';
			if (data == undefined) {
				data = arg;
				dataFormat = 'object';
			}
		}
	});
	return { text: text, formatedText: formatedText, message: message, data: data, dataFormat: dataFormat };
};

/**
 * Returns the log level number corresponding to the given log level name.
 *
 * @param {string} levelName - The name of the log level (e.g. 'fatal', 'error', 'warning', etc.)
 * @return {number} The log level number
 */
const getLogLevel = (levelName: 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'trace' | 'all'): number => {
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
		default:
			return 4;
	}
};

/**
 * Returns the log type name corresponding to the given log type number.
 *
 * @param {number} logType - The log type number
 * @return {string} The log type name
 */
const getLogTypeName = (logType: 1 | 2 | 3 | 4 | 5 | 6 | 7): string => {
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
};

/**
 * Returns the log level number corresponding to the given log type name.
 *
 * @param {string} logType - The name of the log type (e.g. 'fatal', 'error', 'warning', etc.)
 * @return {number} The log level number
 */
const getLogLevelByType = (logType: 'fatal' | 'error' | 'warning' | 'info' | 'message' | 'success' | 'debug' | 'trace' | 'all'): number => {
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
		default:
			return 4;
	}
};

let appName: string, logPath: string, logName: string;
let logToFile = false;
let consoleLogLevel = 7;
let fileLogLevel = 6;
let serverLogLevel = 4;

let condition: boolean | undefined = undefined;
let rabbitmqConnection = false;
let restapiConnection = false;
let serverLogsEnabled = false;
let sessionToken = '';

let serverConnectionType: 'rest' | 'rabbitmq' | undefined = undefined;

let restapiConnectionHost = process.env.SERVERLOG_REST_HOST || undefined;
let rabbitmqConnectionHost = process.env.SERVERLOG_RABBITMQ_HOST || undefined;

let rabbitmqConnectionObject = undefined;
let rabbitmqChannel: amqp.Channel | undefined = undefined;
let rabbitmqExchange = process.env.SERVERLOG_RABBITMQ_EXCHANGE || undefined;

class ServerQueue {
	public queue: QueueObject[];
	public isProcessing: boolean;
	public conditionFn: ConditionFunction;

	/**
	 * Initializes a new instance of the class with the given condition function.
	 *
	 * @param {function} conditionFn - The function used to determine if the queue should be processed.
	 */
	constructor(conditionFn: ConditionFunction) {
		this.queue = [];
		this.isProcessing = false;
		this.conditionFn = conditionFn;
	}

	/**
	 * Adds a new function to the queue and attempts to process the queue.
	 *
	 * @param {object} data - The data to be sent to the server.
	 * @return {undefined}
	 */
	enqueue(data: object) {
		let postToServerFunction = () => {};

		if (serverConnectionType == 'rest') {
			postToServerFunction = async () => {
				try {
					const response = fetch(`http://${restapiConnectionHost}/logs`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ session: sessionToken, ...data }),
					});
					// const data = await response.json(); // Парсинг JSON ответа
					// console.log(data); // Ответ от сервера
				} catch (error) {
					console.error('Ошибка:', error);
				}
			};
		} else if (serverConnectionType == 'rabbitmq') {
			postToServerFunction = () => {
				if (!rabbitmqChannel) {
					return;
				}
				if (!rabbitmqExchange) {
					return;
				}
				rabbitmqChannel.publish(rabbitmqExchange, '', Buffer.from(JSON.stringify({ session: sessionToken, ...data })), {
					persistent: true,
				});
			};
		} else {
			return;
		}

		this.queue.push(postToServerFunction);
		this.processQueue(); // Try to process the queue after adding a new function
	}

	/**
	 * Processes the queue of functions based on the condition function.
	 *
	 * @return {undefined}
	 */
	async processQueue() {
		if (this.isProcessing || !this.conditionFn()) {
			// If queue is processing or the condition is not met, exit
			return;
		}

		this.isProcessing = true;

		while (this.queue.length > 0 && this.conditionFn()) {
			const processFunction = this.queue.shift();
			if (!processFunction) {
				continue;
			}
			processFunction(); // Function to be executed
		}

		this.isProcessing = false;
	}
}

const serverConditionFunction = () => condition;

const queue = new ServerQueue(serverConditionFunction);

export class Logger {
	constructor() {}

	/**
	 * Sets the application name.
	 *
	 * @param {string} name - The name of the application.
	 * @return {undefined}
	 */
	setAppName(name: string) {
		appName = name;
	}

	/**
	 * Sets the console log level to the specified level.
	 *
	 * @param {string} levelName - The name of the log level to set.
	 * @return {void} No return value.
	 */
	setConsoleLogLevel(levelName: 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'trace' | 'all') {
		consoleLogLevel = getLogLevel(levelName);
	}

	/**
	 * Sets the server log level to the specified level.
	 *
	 * @param {string} levelName - The name of the log level to set.
	 * @return {void} No return value.
	 */
	setServerLogLevel(levelName: 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'trace' | 'all') {
		serverLogLevel = getLogLevel(levelName);
	}

	/**
	 * Sets the log level for file logging.
	 *
	 * @param {string} levelName - the name of the log level to set
	 * @return {void} no return value
	 */
	setFileLogLevel(levelName: 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'trace' | 'all') {
		fileLogLevel = getLogLevel(levelName);
	}

	/**
	 * Sets the log to file flag.
	 *
	 * @param {boolean} value - Whether to log to file or not.
	 * @return {void} No return value.
	 */
	setLogToFile(value: boolean) {
		logToFile = value;
	}

	/**
	 * Sets the log file path.
	 *
	 * @param {string} path - The path to the log file.
	 * @return {void} No return value.
	 */
	setLogFilePath(path: string) {
		logPath = path;
	}

	/**
	 * Sets the name of the log file.
	 *
	 * @param {string} name - The name of the log file.
	 * @return {void} This function does not return a value.
	 */
	setLogFileName(name: string) {
		logName = `${name}.log`;
	}

	/**
	 * Sets the server connection type based on the provided type.
	 *
	 * @param {string} type - The type of server connection to set (e.g. 'rest', 'http', 'rabbitmq', 'rabbit')
	 * @return {void} No return value.
	 */
	setServerConnectionType(type: 'rest' | 'rabbitmq') {
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

	/**
	 * Sets the host for the REST API connection.
	 *
	 * @param {string} host - The host URL for the REST API connection.
	 * @return {void} No return value.
	 */
	setRestApiConnectionHost(host: string) {
		restapiConnectionHost = host;
	}

	/**
	 * Sets the RabbitMQ connection host.
	 *
	 * @param {string} host - The host URL for the RabbitMQ connection.
	 * @return {void} No return value.
	 */
	setRabbitMQConnectionHost(host: string) {
		rabbitmqConnectionHost = `amqp://${host}`;
	}

	/**
	 * Sets the RabbitMQ exchange.
	 *
	 * @param {string} exchange - The name of the RabbitMQ exchange to set.
	 * @return {void} No return value.
	 */
	setRabbitMQExchange(exchange: string) {
		rabbitmqExchange = exchange;
	}

	/**
	 * Enables server logs.
	 *
	 * @return {void} No return value.
	 */
	enableServerLogs() {
		serverLogsEnabled = true;
	}

	/**
	 * Initializes the server logs by checking the server connection type,
	 * enabling server logs, and establishing a connection to the LogsCollectService.
	 *
	 * @return {void} No return value.
	 */
	async initializeServerLogs() {
		const log = new ServiceLogger('Initialize Server Logs', {});

		if (serverConnectionType == 'rabbitmq' && rabbitmqExchange == undefined) {
			log.warning('RabbitMQ exchange is not defined!').process();
			condition = false;
			return;
		}

		if (serverLogsEnabled == false) {
			log.warning('Server logs are not enabled!').process();
			condition = false;
			return;
		} else if (serverConnectionType == undefined) {
			log.warning('Server connection type is not defined!').process();
			condition = false;
			return;
		} else if (restapiConnectionHost == undefined) {
			log.warning('REST API connection to LogsCollectService host is not defined!').process();
			condition = false;
			return;
		}

		const statusResponse = await this.getStatusOfRestApiConnection();

		if (statusResponse == undefined) {
			log.warning('REST API connection to LogsCollectService host is not available!').process();
			condition = false;
			return;
		} else if (statusResponse.active != true) {
			log.warning('REST API connection to LogsCollectService host is not active!').process();
			condition = false;
			return;
		}

		let sessionData = {};

		try {
			const response = await fetch(`http://${restapiConnectionHost}/sessions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					service: appName,
					timestamp: Date.now(),
					hostname: os.hostname(),
				}),
			});
			sessionData = await response.json(); // Или response.json() для JSON-ответа
		} catch (error) {
			log.error('Get session data error').process();
			condition = false;
			return;
		}

		// Check Session data

		if (!('error' in sessionData)) {
			log.error('Get session data error').process();
			condition = false;
			return;
		} else if (sessionData.error == true) {
			log.error('Get session data error').process();
			condition = false;
			return;
		} else if (!('data' in sessionData)) {
			log.error('Get session data error').process();
			condition = false;
			return;
		} else if (sessionData.data == undefined) {
			log.error('Get session data undefined').process();
			condition = false;
			return;
		} else if (typeof sessionData.data != 'object') {
			log.error('Get session data undefined').process();
			condition = false;
			return;
		} else if (!('id' in sessionData.data)) {
			log.error('Get session data error').process();
			condition = false;
			return;
		} else if (sessionData.data.id == undefined) {
			log.error('Get session id undefined').process();
			condition = false;
			return;
		} else {
			sessionToken = sessionData.data.id as string;
		}

		restapiConnection = true;

		if (serverConnectionType == 'rest') {
			condition = true;
		} else if (serverConnectionType == 'rabbitmq') {
			if (typeof rabbitmqConnectionHost != 'string') {
				log.error('RabbitMQ connection host is not defined!').process();
				return;
			}
			rabbitmqConnectionObject = await amqp.connect(rabbitmqConnectionHost);
			rabbitmqChannel = await rabbitmqConnectionObject.createChannel();
			condition = true;
		}

		log.success(`Server logs initialized [SessionID: ${sessionToken}]`).process();

		queue.processQueue();
	}

	/**
	 * Retrieves the status of the REST API connection.
	 *
	 * @return {object} The status data of the REST API connection, or undefined if an error occurs.
	 */
	async getStatusOfRestApiConnection() {
		const log = new ServiceLogger('REST API Status');

		try {
			const response = await fetch(`http://${restapiConnectionHost}/status`);
			const data = await response.json(); // Или response.json() для JSON-ответа
			return data;
		} catch (error) {
			log.error('Get status of REST API connection error').process();
			return undefined;
		}
	}

	/**
	 * Returns the current log levels for the console, server, and file.
	 *
	 * @return {object} An object containing the current log levels.
	 */
	options() {
		return {
			consoleLogLevel: consoleLogLevel,
			serverLogLevel: serverLogLevel,
			fileLogLevel: fileLogLevel,
		};
	}

	/**
	 * Creates a new log entry with the given text.
	 *
	 * @param {string} text - The text to be logged.
	 * @return {Log} A new Log object with the given text and log type set to 'All'.
	 */
	log(text: string) {
		const formatedText = serverName('clean') + text;
		return new Log(text, formatedText, this.options()).setLogType('all');
	}

	/**
	 * Creates a new log entry with a heading.
	 *
	 * @param {string} text - The text to be used as the heading.
	 * @return {Log} A new Log object with the given heading and log type set to 'Info'.
	 */
	heading(text: string) {
		const formatedText = '\n' + serverName('blue') + terminalText(text, 'white', 'blue', false) + '\n';
		return new Log(text, formatedText, this.options()).setLogType('info');
	}

	/**
	 * Creates a new log entry with an error message.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the error message.
	 * @return {Log} A new Log object with the given error message and log type set to 'Error'.
	 */
	error(...args: Arguments[]) {
		const prefix = serverName('') + dividerBack('red', '') + terminalText('  Error ', 'white', 'red', false) + divider('red', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'red');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message }).setLogType('error');
	}

	/**
	 * Creates a new log entry with a warning message.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the warning message.
	 * @return {Log} A new Log object with the given warning message and log type set to 'Warning'.
	 */
	warning(...args: Arguments[]) {
		const prefix = serverName('') + dividerBack('yellow', '') + terminalText(' Warning', 'white', 'yellow', false) + divider('yellow', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'yellow');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message }).setLogType('warning');
	}

	/**
	 * Creates a new log entry with a success message.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the success message.
	 * @return {Log} A new Log object with the given success message and log type set to 'Success'.
	 */
	success(...args: Arguments[]) {
		const prefix = serverName('') + dividerBack('green', '') + terminalText(' Success', 'white', 'green', false) + divider('green', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'white');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message }).setLogType('success');
	}

	/**
	 * Creates a new log entry with a message.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the message.
	 * @return {Log} A new Log object with the given message and log type set to 'Message'.
	 */
	message(...args: Arguments[]) {
		const prefix = serverName('') + dividerBack('cyan', '') + terminalText(' Message', 'white', 'cyan', false) + divider('cyan', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'white');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message }).setLogType('message');
	}

	/**
	 * Creates a new log entry with a debug message.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the debug message.
	 * @return {Log} A new Log object with the given debug message and log type set to 'Debug'.
	 */
	debug(...args: Arguments[]) {
		const prefix = serverName('') + dividerBack('blue', '') + terminalText('  Debug ', 'white', 'blue', false) + divider('blue', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'white');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message }).setLogType('debug');
	}

	/**
	 * Creates a new log entry with an info message.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the info message.
	 * @return {Log} A new Log object with the given info message and log type set to 'Info'.
	 */
	info(...args: Arguments[]) {
		const prefix = serverName('') + dividerBack('purple', '') + terminalText('  Info  ', 'white', 'purple', false) + divider('purple', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'white');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message }).setLogType('info');
	}

	/**
	 * Retrieves the system time information and logs it using the ServiceLogger.
	 *
	 * @return {Promise<void>} Promise that resolves when the logging is complete.
	 */
	async systemTimeInformation() {
		const logger = new ServiceLogger(systemInformationServices.time, { consoleLogLevel: 'all' });

		const time = await systeminformation.time();

		const formatedTime = unixTimeConverter(time.current);

		logger.info(`\x1b[1mUTC Time:               \x1b[0m${formatedTime.UTCFormatedTime}`).process();
		logger.info(`\x1b[1mLocal Time:             \x1b[0m${formatedTime.localFormatedTime}`).process();
		logger.info(`\x1b[1mTimezone:               \x1b[0m${time.timezone}`).process();
		logger.info(`\x1b[1mTimezone:               \x1b[0m${time.timezoneName}`).process();

		return;
	}

	/**
	 * Retrieves the system data information and logs it using the ServiceLogger.
	 *
	 * @return {Promise<void>} Promise that resolves when the logging is complete.
	 */
	async systemDataInformation() {
		const logger = new ServiceLogger(systemInformationServices.system, { consoleLogLevel: 'all' });

		const system = await systeminformation.system();

		logger.info(`\x1b[1mUUID:                   \x1b[0m${system.uuid}`).process();

		return;
	}

	/**
	 * Retrieves the system BIOS information and logs it using the ServiceLogger.
	 *
	 * @return {Promise<void>} Promise that resolves when the logging is complete.
	 */
	async systemBiosInformation() {
		const logger = new ServiceLogger(systemInformationServices.bios, { consoleLogLevel: 'all' });

		const bios = await systeminformation.bios();

		logger.info(`\x1b[1mBIOS Vendor:            \x1b[0m${bios.vendor}`).process();
		logger.info(`\x1b[1mBIOS Version:           \x1b[0m${bios.version}`).process();

		return;
	}

	/**
	 * Retrieves the system CPU information and logs it using the ServiceLogger.
	 *
	 * @return {Promise<void>} Promise that resolves when the logging is complete.
	 */
	async systemCPUInformation() {
		const logger = new ServiceLogger(systemInformationServices.cpu, { consoleLogLevel: 'all' });

		const cpu = await systeminformation.cpu();
		const cpuFlags = await systeminformation.cpuFlags();

		logger.info(`\x1b[1mCPU Company:            \x1b[0m${cpu.manufacturer}`).process();
		logger.info(`\x1b[1mCPU:                    \x1b[0m${cpu.brand}`).process();
		logger.info(`\x1b[1mCPU Cores:              \x1b[0m${cpu.cores}`).process();
		logger.info(`\x1b[1mCPU Physical Cores:     \x1b[0m${cpu.physicalCores}`).process();
		logger.info(`\x1b[1mCPU Performance Cores:  \x1b[0m${cpu.performanceCores}`).process();
		logger.info(`\x1b[1mCPU Efficiency Cores:   \x1b[0m${cpu.efficiencyCores}`).process();
		logger.info(`\x1b[1mProcessors:             \x1b[0m${cpu.processors}`).process();
		logger.info(`\x1b[1mVirtualization:         \x1b[0m${cpu.virtualization ? 'Yes' : 'No'}`).process();

		if (cpuFlags.length > 0) {
			logger.info(`\x1b[1mFlags:                  \x1b[0m${cpuFlags}`).process();
		}

		return;
	}

	/**
	 * Retrieves the system memory information and logs it using the ServiceLogger.
	 *
	 * @param {string} measurement - The unit of measurement for the memory values (e.g. 'GB', 'GiB', 'MB', 'MiB'). If undefined, it defaults to 'GiB'.
	 * @return {Promise<void>} Promise that resolves when the logging is complete.
	 */
	async systemMemoryInformation(measurement: 'GiB' | 'MiB') {
		const logger = new ServiceLogger(systemInformationServices.memory, { consoleLogLevel: 'all' });

		const memory = await systeminformation.mem();

		let measurementDivider = 1024 * 1024;
		let measurementSuffix;

		if (measurement == undefined) {
			measurementDivider = 1024 * 1024 * 1024;
			measurementSuffix = 'GiB';
		} else if (measurement == 'GiB') {
			measurementDivider = 1024 * 1024 * 1024;
			measurementSuffix = 'GiB';
		} else if (measurement == 'MiB') {
			measurementDivider = 1024 * 1024;
			measurementSuffix = 'MiB';
		}

		logger.info(`\x1b[1mTotal:                  \x1b[0m${Math.round(memory.total / measurementDivider)} ${measurementSuffix}`).process();
		logger.info(`\x1b[1mFree:                   \x1b[0m${Math.round(memory.free / measurementDivider)} ${measurementSuffix}`).process();
		logger.info(`\x1b[1mUsed:                   \x1b[0m${Math.round(memory.used / measurementDivider)} ${measurementSuffix}`).process();
		logger.info(`\x1b[1mActive:                 \x1b[0m${Math.round(memory.active / measurementDivider)} ${measurementSuffix}`).process();
		logger.info(`\x1b[1mAvailable:              \x1b[0m${Math.round(memory.available / measurementDivider)} ${measurementSuffix}`).process();

		return;
	}

	/**
	 * Retrieves the system OS information and logs it using the ServiceLogger.
	 *
	 * @return {Promise<void>} Promise that resolves when the logging is complete.
	 */
	async systemOSInformation() {
		const logger = new ServiceLogger(systemInformationServices.osInfo, { consoleLogLevel: 'all' });

		const osInfo = await systeminformation.osInfo();

		logger.info(`\x1b[1mPlatform:               \x1b[0m${osInfo.platform}`).process();
		logger.info(`\x1b[1mDistro:                 \x1b[0m${osInfo.distro}`).process();
		logger.info(`\x1b[1mVersion:                \x1b[0m${osInfo.release}`).process();
		logger.info(`\x1b[1mCodename:               \x1b[0m${osInfo.codename}`).process();
		logger.info(`\x1b[1mKernel:                 \x1b[0m${osInfo.kernel}`).process();
		logger.info(`\x1b[1mArch:                   \x1b[0m${osInfo.arch}`).process();
		logger.info(`\x1b[1mHostname:               \x1b[0m${osInfo.hostname}`).process();
		logger.info(`\x1b[1mSerial:                 \x1b[0m${osInfo.serial}`).process();
		logger.info(`\x1b[1mBuild:                  \x1b[0m${osInfo.build}`).process();

		return;
	}

	/**
	 * Retrieves the system software information and logs it using the ServiceLogger.
	 *
	 * @return {Promise<void>} Promise that resolves when the logging is complete.
	 */
	async systemSoftwareInformation() {
		const logger = new ServiceLogger(systemInformationServices.software, { consoleLogLevel: 'all' });

		const software = await systeminformation.versions();

		logger.info(`\x1b[1mOpenSSL:                \x1b[0m${software.openssl}`).process();
		logger.info(`\x1b[1mSystem OpenSSL:         \x1b[0m${software.systemOpenssl}`).process();
		logger.info(`\x1b[1mNode:                   \x1b[0m${software.node}`).process();
		logger.info(`\x1b[1mV8:                     \x1b[0m${software.v8}`).process();
		logger.info(`\x1b[1mNPM:                    \x1b[0m${software.npm}`).process();
		logger.info(`\x1b[1mGit:                    \x1b[0m${software.git}`).process();
		logger.info(`\x1b[1mMySQL:                  \x1b[0m${software.mysql}`).process();
		logger.info(`\x1b[1mRedis:                  \x1b[0m${software.redis}`).process();
		logger.info(`\x1b[1mMongoDB:                \x1b[0m${software.mongodb}`).process();
		logger.info(`\x1b[1mNginx:                  \x1b[0m${software.nginx}`).process();
		logger.info(`\x1b[1mDocker:                 \x1b[0m${software.docker}`).process();
		logger.info(`\x1b[1mPython:                 \x1b[0m${software.python3}`).process();
		logger.info(`\x1b[1mPIP:                    \x1b[0m${software.pip3}`).process();

		if ('zsh' in software) {
			logger.info(`\x1b[1mZSH:                    \x1b[0m${software.zsh}`).process();
		}

		return;
	}

	/**
	 * Retrieves and logs various system information.
	 *
	 * @return {Promise<void>} Promise that resolves when the logging is complete.
	 */
	async systemInformation() {
		await this.systemTimeInformation();
		await this.systemDataInformation();
		await this.systemBiosInformation();
		await this.systemCPUInformation();
		await this.systemMemoryInformation('MiB');
		await this.systemOSInformation();
		await this.systemSoftwareInformation();

		return;
	}
}

export class ServiceLogger {
	private serviceConsoleLogLevel;
	private serviceServerLogLevel;
	private serviceFileLogLevel;
	public serviceName;

	/**
	 * Initializes a new instance of the ServiceLogger class.
	 *
	 * @param {string} serviceName - The name of the service.
	 * @param {object} options - An object containing log level options.
	 * @param {string} options.consoleLogLevel - The console log level.
	 * @param {string} options.serverLogLevel - The server log level.
	 * @param {string} options.fileLogLevel - The file log level.
	 */
	constructor(
		serviceName: string,
		options?: {
			consoleLogLevel?: 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'trace' | 'all';
			serverLogLevel?: 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'trace' | 'all';
			fileLogLevel?: 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'trace' | 'all';
		},
	) {
		this.serviceName = serviceName;
		this.serviceConsoleLogLevel = options?.consoleLogLevel != undefined ? getLogLevel(options.consoleLogLevel) : consoleLogLevel;
		this.serviceServerLogLevel = options?.serverLogLevel != undefined ? getLogLevel(options.serverLogLevel) : serverLogLevel;
		this.serviceFileLogLevel = options?.fileLogLevel != undefined ? getLogLevel(options.fileLogLevel) : fileLogLevel;
	}

	/**
	 * Returns an object containing the log level options for the service.
	 *
	 * @return {Object} An object with the following properties:
	 *   - consoleLogLevel: The console log level for the service.
	 *   - serverLogLevel: The server log level for the service.
	 *   - fileLogLevel: The file log level for the service.
	 */
	options() {
		return {
			consoleLogLevel: this.serviceConsoleLogLevel,
			serverLogLevel: this.serviceServerLogLevel,
			fileLogLevel: this.serviceFileLogLevel,
		};
	}

	/**
	 * Creates a new log entry for the service.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the log message.
	 * @return {Log} A new Log object with the given log message and log level set to 'All'.
	 */
	log(...args: Arguments[]) {
		const prefix = serverName('') + terminalText(this.serviceName, 'white', '', false) + divider('white', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'white');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message })
			.setServiceName(this.serviceName)
			.setLogLevel('All');
	}

	/**
	 * Creates a new log entry with an error message for the service.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the error message.
	 * @return {Log} A new Log object with the given error message and log type set to 'Error'.
	 */
	error(...args: Arguments[]) {
		const prefix = serverName('red') + terminalText(this.serviceName, 'white', 'red', false) + divider('red', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'red');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message })
			.setServiceName(this.serviceName)
			.setLogType('error');
	}

	/**
	 * Creates a new log entry with a warning message for the service.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the warning message.
	 * @return {Log} A new Log object with the given warning message and log type set to 'Warning'.
	 */
	warning(...args: Arguments[]) {
		const prefix = serverName('yellow') + terminalText(this.serviceName, 'white', 'yellow', false) + divider('yellow', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'yellow');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message })
			.setServiceName(this.serviceName)
			.setLogLevel('warning')
			.setLogType('warning');
	}

	/**
	 * Creates a new log entry with a success message for the service.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the success message.
	 * @return {Log} A new Log object with the given success message and log type set to 'Success'.
	 */
	success(...args: Arguments[]) {
		const prefix = serverName('green') + terminalText(this.serviceName, 'white', 'green', false) + divider('green', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'white');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message })
			.setServiceName(this.serviceName)
			.setLogType('success');
	}

	/**
	 * Creates a new log entry with a message for the service.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the message.
	 * @return {Log} A new Log object with the given message and log type set to 'Message'.
	 */
	message(...args: Arguments[]) {
		const prefix = serverName('cyan') + terminalText(this.serviceName, 'white', 'cyan', false) + divider('cyan', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'white');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message })
			.setServiceName(this.serviceName)
			.setLogType('message');
	}

	/**
	 * Creates a new log entry with a debug message for the service.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the debug message.
	 * @return {Log} A new Log object with the given debug message and log type set to 'Debug'.
	 */
	debug(...args: Arguments[]) {
		const prefix = serverName('blue') + terminalText(this.serviceName, 'white', 'blue', false) + divider('blue', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'white');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message })
			.setServiceName(this.serviceName)
			.setLogType('debug');
	}

	/**
	 * Creates a new log entry with an info message for the service.
	 *
	 * @param {...any} args - Variable number of arguments to be used in the info message.
	 * @return {Log} A new Log object with the given info message and log type set to 'Info'.
	 */
	info(...args: Arguments[]) {
		const prefix = serverName('purple') + terminalText(this.serviceName, 'white', 'purple', false) + divider('purple', '');
		let { text, formatedText, message, data, dataFormat } = parseArgs([...args], prefix, 'message', 'white');
		return new Log(text, formatedText, { ...this.options(), data: data, dataFormat: dataFormat, message: message })
			.setServiceName(this.serviceName)
			.setLogType('info');
	}
}

class Log {
	private text;
	private formatedText;
	private consoleLogLevel;
	private serverLogLevel;
	private fileLogLevel;
	private logToFile;
	private logToServer;
	private logType;
	private logLevel = 0;
	private serviceName: string | undefined = undefined;

	private data: object | undefined = undefined;
	private dataFormat: string | undefined = undefined;
	private message: string | undefined = undefined;

	/**
	 * Initializes a new instance of the Log class.
	 *
	 * @param {string} text - The text of the log entry.
	 * @param {string} formatedText - The formatted text of the log entry.
	 * @param {object} options - An object containing additional options for the log entry.
	 * @param {number} [options.consoleLogLevel=0] - The log level for the console.
	 * @param {number} [options.serverLogLevel=0] - The log level for the server.
	 * @param {number} [options.fileLogLevel=0] - The log level for the file.
	 * @param {number|string} [options.logLevel=7] - The log level of the entry.
	 * @param {string} [options.logType='Message'] - The type of the log entry.
	 * @param {boolean} [options.logToFile] - Whether to log to a file.
	 * @param {boolean} [options.logToServer] - Whether to log to the server.
	 * @param {*} [options.data] - Additional data for the log entry.
	 * @param {string} [options.dataFormat] - The format of the additional data.
	 * @param {string} [options.message] - The message of the log entry.
	 */
	constructor(
		text: string,
		formatedText: string,
		options: {
			consoleLogLevel?: number;
			serverLogLevel?: number;
			fileLogLevel?: number;
			logLevel?: 'fatal' | 'error' | 'warning' | 'info' | 'debug' | 'trace' | 'all';
			logType?: string;
			logToFile?: boolean;
			logToServer?: boolean;
			data?: any;
			dataFormat?: string;
			message?: string;
		},
	) {
		this.text = text;
		this.formatedText = formatedText;
		this.consoleLogLevel = options?.consoleLogLevel != undefined ? options.consoleLogLevel : 0;
		this.serverLogLevel = options?.serverLogLevel != undefined ? options.serverLogLevel : 0;
		this.fileLogLevel = options?.fileLogLevel != undefined ? options.fileLogLevel : 0;
		this.logLevel = options?.logLevel != undefined ? getLogLevel(options.logLevel) : 7;
		this.logType = options?.logType != undefined ? options.logType : 'Message';
		this.logToFile = options?.logToFile != undefined ? options.logToFile : undefined;
		this.logToServer = options?.logToServer != undefined ? options.logToFile : undefined;

		this.data = options?.data != undefined ? options.data : undefined;
		this.dataFormat = options?.dataFormat != undefined ? options.dataFormat : undefined;
		this.message = options?.message != undefined ? options.message : undefined;
	}

	/** @private */
	setServiceName(serviceName: string) {
		this.serviceName = serviceName;
		return this;
	}

	/**
	 * Sets the log type for the log entry.
	 *
	 * @param {string} logType - The type of the log entry.
	 * @return {object} The current log entry object.
	 */
	setLogType(logType: 'fatal' | 'error' | 'warning' | 'info' | 'message' | 'success' | 'debug' | 'trace' | 'all') {
		this.logType = logType;
		this.logLevel = getLogLevelByType(logType);
		return this;
	}

	/** @private */
	setLogLevel(logLevel: string) {
		this.logType = logLevel;
		return this;
	}

	/**
	 * Saves the log to a file.
	 *
	 * @param {boolean} state - The state of saving the log to a file. If undefined, defaults to true.
	 * @return {object} The current log entry object.
	 */
	saveToFile(state: boolean) {
		this.logToFile = state != undefined ? state : true;
		return this;
	}

	/**
	 * Saves the log to a server.
	 *
	 * @param {boolean} state - The state of saving the log to a server. If undefined, defaults to true.
	 * @return {object} The current log entry object.
	 */
	saveToServer(state: boolean) {
		this.logToServer = state != undefined ? state : true;
		return this;
	}

	/**
	 * Processes the log entry by performing console logging, saving to a file, and saving to a server based on the log level and type.
	 *
	 * @return {undefined} This function does not return a value.
	 */
	process() {
		// console.log(`Check | Log level: ${this.#logLevel} | Log type: ${this.#logType.padEnd(7, ' ')} | Console Log Level: ${this.#consoleLogLevel} | Server Log Level: ${this.#serverLogLevel}`)

		// Console Logging

		if (this.logLevel <= this.consoleLogLevel) {
			console.log(this.formatedText);
		}

		// Saving to file

		let fileServiceNameBlock = '';
		let messageTypeBlock = '';

		if (this.serviceName != undefined) {
			fileServiceNameBlock = `${this.serviceName} | `;
		}

		if (this.serviceName != undefined) {
			messageTypeBlock = `[Service ${this.logType}]`;
		} else {
			messageTypeBlock = `[${this.logType}]`;
		}

		messageTypeBlock = messageTypeBlock.padEnd(17, ' ');

		if (
			this.logToFile != false &&
			logPath != undefined &&
			logPath != undefined &&
			(this.logLevel <= this.fileLogLevel || this.logToFile == true)
		) {
			console.log(
				`Saving to file: ${logPath}${logName} | Log level: ${this.logLevel} | Log type: ${this.logType.padEnd(7, ' ')} | Console Log Level: ${this.consoleLogLevel} | Server Log Level: ${this.serverLogLevel}`,
			);
			fs.appendFile(
				path.join(logPath, logName),
				`${getCurrentTimestamp()} ${messageTypeBlock} | ${appName} | ${fileServiceNameBlock}${this.text} \n`,
				(err) => {
					if (err) {
						console.error('Error when adding new data to log:', err);
					}
				},
			);
		}

		// Saving to server

		if (
			this.logToServer != false &&
			serverLogsEnabled != false &&
			condition != false &&
			(this.logLevel <= this.serverLogLevel || this.logToServer == true)
		) {
			// console.log(`Saving to server: ${serverConnectionType} | Log level: ${this.#logLevel} | Log type: ${this.#logType.padEnd(7, ' ') } | Console Log Level: ${this.#consoleLogLevel} | Server Log Level: ${this.#serverLogLevel}`)

			const data: Data = {
				subservice: this.serviceName == undefined ? undefined : this.serviceName,
				timestamp: Date.now(),
				type: this.logType.toLowerCase(),
			};

			if (this.data != undefined && this.dataFormat != undefined && this.dataFormat != 'message') {
				data.data = this.data;
				data.format = this.dataFormat;
				data.message = this.message;
			} else if (this.logType.toLowerCase() == 'error' && this.data != undefined && this.dataFormat == 'message') {
				data.format = 'message';
				data.message = this.text;
			} else {
				data.format = 'message';
				data.message = this.text;
			}

			queue.enqueue(data);
		}
	}
}
