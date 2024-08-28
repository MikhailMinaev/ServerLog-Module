# Serverlog Module

A customizable logging module for Node.js applications.

## Overview

This module provides a flexible logging system that allows you to log messages to the console, a file, or a server. It supports different log levels and types, and can be easily extended to meet your specific needs.

## Installation

To use this module, simply require it in your Node.js application:
```javascript
const Logger = require('@mikhailminaev/serverlog');
```
## Usage

### Creating a Logger Instance

To create a logger instance, simply create a new instance of the `Logger` class:
```javascript
const logger = new Logger();
```
### Setting Log Levels

You can set the log level for the console, server, and file using the following methods:

* `setConsoleLogLevel(level)`: Sets the log level for the console.
* `setServerLogLevel(level)`: Sets the log level for the server.
* `setFileLogLevel(level)`: Sets the log level for the file.

For example:
```javascript
logger.setConsoleLogLevel('info');
logger.setServerLogLevel('error');
logger.setFileLogLevel('debug');
```
### Logging Messages

You can log messages using the following methods:

* `log(message)`: Logs a message with the default log level.
* `error(message)`: Logs an error message.
* `warning(message)`: Logs a warning message.
* `success(message)`: Logs a success message.
* `message(message)`: Logs a message with the default log level.
* `debug(message)`: Logs a debug message.
* `info(message)`: Logs an info message.

For example:
```javascript
logger.log('Hello, World!');
logger.error('Error!');
logger.warning('Warning!');
logger.success('Success!');
logger.message('Message!');
logger.debug('Debug!');
logger.info('Info!');
```
### Service Logger

The `ServiceLogger` class provides a way to log messages for a specific service. You can create a service logger instance by passing the service name and options to the constructor:
```javascript
const serviceLogger = new ServiceLogger('My Service', {
  consoleLogLevel: 'info',
  serverLogLevel: 'error',
});
```
You can then use the service logger instance to log messages:
```javascript
serviceLogger.log('Hello, World!');
serviceLogger.error('Error!');
serviceLogger.warning('Warning!');
serviceLogger.success('Success!');
serviceLogger.message('Message!');
serviceLogger.debug('Debug!');
serviceLogger.info('Info!');
```
## Configuration

You can configure the logger module by setting the following environment variables:

* `SERVERLOG_REST_HOST`: The host URL for the REST API connection.
* `SERVERLOG_RABBITMQ_HOST`: The host URL for the RabbitMQ connection.
* `SERVERLOG_RABBITMQ_EXCHANGE`: The name of the RabbitMQ exchange.

For example:
```bash
export SERVERLOG_REST_HOST=http://localhost:8011
export SERVERLOG_RABBITMQ_HOST=amqp://localhost
export SERVERLOG_RABBITMQ_EXCHANGE=logs_exchange
```
## API Documentation

### Logger Class

#### Methods

* `setAppName(name)`: Sets the application name.
* `setConsoleLogLevel(level)`: Sets the log level for the console.
* `setServerLogLevel(level)`: Sets the log level for the server.
* `setFileLogLevel(level)`: Sets the log level for the file.
* `log(message)`: Logs a message with the default log level.
* `error(message)`: Logs an error message.
* `warning(message)`: Logs a warning message.
* `success(message)`: Logs a success message.
* `message(message)`: Logs a message with the default log level.
* `debug(message)`: Logs a debug message.
* `info(message)`: Logs an info message.
* `systemInformation()`: Logs system information.

### ServiceLogger Class

#### Methods

* `log(message)`: Logs a message with the default log level.
* `error(message)`: Logs an error message.
* `warning(message)`: Logs a warning message.
* `success(message)`: Logs a success message.
* `message(message)`: Logs a message with the default log level.
* `debug(message)`: Logs a debug message.
* `info(message)`: Logs an info message.

## License

This module is licensed under the MIT License.

## Contributing

Contributions are welcome! Please submit a pull request with your changes.

## Author

Mikhail Minaev
