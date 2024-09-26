declare class Logger {
	constructor();

	setAppName(name: string): void;
	setConsoleLogLevel(levelName: string): void;
	setServerLogLevel(levelName: string): void;
	setFileLogLevel(levelName: string): void;
	setLogToFile(value: boolean): void;
	setLogFilePath(path: string): void;
	setLogFileName(name: string): void;
	setServerConnectionType(type: "rest" | "http" | "rabbitmq" | "rabbit"): void;
	setRestApiConnectionHost(host: string): void;
	setRabbitMQConnectionHost(host: string): void;
	setRabbitMQExchange(exchange: string): void;
	enableServerLogs(): void;
	initializeServerLogs(): Promise<void>;
	getStatusOfRestApiConnection(): Promise<{ active?: boolean } | undefined>;
	options(): {
		consoleLogLevel: string;
		serverLogLevel: string;
		fileLogLevel: string;
	};
	log(text: string): Log;
	heading(text: string): Log;
	error(...args: any[]): Log;
	warning(...args: any[]): Log;
	success(...args: any[]): Log;
	message(...args: any[]): Log;
	debug(...args: any[]): Log;
	info(...args: any[]): Log;
	systemTimeInformation(): Promise<void>;
	systemDataInformation(): Promise<void>;
	systemBiosInformation(): Promise<void>;
	systemCPUInformation(): Promise<void>;
	systemMemoryInformation(measurement?: string): Promise<void>;
	systemOSInformation(): Promise<void>;
	systemSoftwareInformation(): Promise<void>;
}

declare class ServiceLogger {
	private #serviceConsoleLogLevel;
	private #serviceServerLogLevel;
	private #serviceFileLogLevel;

	/**
	 * Initializes a new instance of the ServiceLogger class.
	 *
	 * @param serviceName - The name of the service.
	 * @param options - An object containing log level options.
	 * @param options.consoleLogLevel - The console log level.
	 * @param options.serverLogLevel - The server log level.
	 * @param options.fileLogLevel - The file log level.
	 */
	constructor(
		serviceName: string,
		options: {
			consoleLogLevel?: string;
			serverLogLevel?: string;
			fileLogLevel?: string;
		}
	);

	/**
	 * Returns an object containing the log level options for the service.
	 *
	 * @returns An object with the following properties:
	 *   - consoleLogLevel: The console log level for the service.
	 *   - serverLogLevel: The server log level for the service.
	 *   - fileLogLevel: The file log level for the service.
	 */
	options(): {
		consoleLogLevel: string;
		serverLogLevel: string;
		fileLogLevel: string;
	};

	/**
	 * Creates a new log entry for the service.
	 *
	 * @param args - Variable number of arguments to be used in the log message.
	 * @returns A new Log object with the given log message and log level set to 'All'.
	 */
	log(...args: any[]): Log;

	/**
	 * Creates a new log entry with an error message for the service.
	 *
	 * @param args - Variable number of arguments to be used in the error message.
	 * @returns A new Log object with the given error message and log type set to 'Error'.
	 */
	error(...args: any[]): Log;

	/**
	 * Creates a new log entry with a warning message for the service.
	 *
	 * @param args - Variable number of arguments to be used in the warning message.
	 * @returns A new Log object with the given warning message and log type set to 'Warning'.
	 */
	warning(...args: any[]): Log;

	/**
	 * Creates a new log entry with a success message for the service.
	 *
	 * @param args - Variable number of arguments to be used in the success message.
	 * @returns A new Log object with the given success message and log type set to 'Success'.
	 */
	success(...args: any[]): Log;

	/**
	 * Creates a new log entry with a message for the service.
	 *
	 * @param args - Variable number of arguments to be used in the message.
	 * @returns A new Log object with the given message and log type set to 'Message'.
	 */
	message(...args: any[]): Log;

	/**
	 * Creates a new log entry with a debug message for the service.
	 *
	 * @param args - Variable number of arguments to be used in the debug message.
	 * @returns A new Log object with the given debug message and log type set to 'Debug'.
	 */
	debug(...args: any[]): Log;

	/**
	 * Creates a new log entry with an info message for the service.
	 *
	 * @param args - Variable number of arguments to be used in the info message.
	 * @returns A new Log object with the given info message and log type set to 'Info'.
	 */
	info(...args: any[]): Log;
}

declare class Log {
	#text: string;
	#formatedText: string;
	#consoleLogLevel: number;
	#serverLogLevel: number;
	#fileLogLevel: number;
	#logToFile?: boolean;
	#logToServer?: boolean;
	#logType: string;
	#logLevel: number | string;
	#serviceName?: string;
	#data?: any;
	#dataFormat?: string;
	#message?: string;

	/**
	 * Initializes a new instance of the Log class.
	 *
	 * @param text - The text of the log entry.
	 * @param formatedText - The formatted text of the log entry.
	 * @param options - An object containing additional options for the log entry.
	 * @param options.consoleLogLevel - The log level for the console.
	 * @param options.serverLogLevel - The log level for the server.
	 * @param options.fileLogLevel - The log level for the file.
	 * @param options.logLevel - The log level of the entry.
	 * @param options.logType - The type of the log entry.
	 * @param options.logToFile - Whether to log to a file.
	 * @param options.logToServer - Whether to log to the server.
	 * @param options.data - Additional data for the log entry.
	 * @param options.dataFormat - The format of the additional data.
	 * @param options.message - The message of the log entry.
	 */
	constructor(
		text: string,
		formatedText: string,
		options: {
			consoleLogLevel?: number;
			serverLogLevel?: number;
			fileLogLevel?: number;
			logLevel?: number | string;
			logType?: string;
			logToFile?: boolean;
			logToServer?: boolean;
			data?: any;
			dataFormat?: string;
			message?: string;
		}
	);

	/**
	 * Sets the service name for the log entry.
	 * @param serviceName - The name of the service.
	 * @returns The current log entry object.
	 * @private
	 */
	private setServiceName(serviceName: string): this;

	/**
	 * Sets the log type for the log entry.
	 * @param logType - The type of the log entry.
	 * @returns The current log entry object.
	 */
	setLogType(logType: string): this;

	/**
	 * Sets the log level for the log entry.
	 * @param logLevel - The log level of the entry.
	 * @returns The current log entry object.
	 * @private
	 */
	private setLogLevel(logLevel: number): this;

	/**
	 * Saves the log to a file.
	 * @param state - The state of saving the log to a file. If undefined, defaults to true.
	 * @returns The current log entry object.
	 */
	saveToFile(state?: boolean): this;

	/**
	 * Saves the log to a server.
	 * @param state - The state of saving the log to a server. If undefined, defaults to true.
	 * @returns The current log entry object.
	 */
	saveToServer(state?: boolean): this;

	/**
	 * Processes the log entry by performing console logging, saving to a file, and saving to a server based on the log level and type.
	 * @returns This function does not return a value.
	 */
	process(): void;
}