#!/usr/bin/env node
'use strict';

const { EventHubProducerClient } = require('@azure/event-hubs');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { version: packageVersion } = require('./package.json'); // Import version from package.json

/**
 * Sends messages to an Azure Event Hub.
 *
 * @param {string} connectionString - The connection string for the Event Hub.
 * @param {string} eventHubName - The name of the Event Hub.
 * @param {number} messageCount - The number of messages to send.
 * @param {string} messagePayload - The payload of the messages.
 * @param {boolean} verbose - Whether to enable verbose logging.
 */
async function sendMessages(connectionString, eventHubName, messageCount, messagePayload, verbose) {
    const producer = new EventHubProducerClient(connectionString, eventHubName);

    if (typeof messageCount !== 'number' || messageCount < 1) {
        throw new Error('Invalid message count. Must be a positive integer.');
    }

    if (!connectionString || !eventHubName || !messagePayload) {
        throw new Error('Connection string, Event Hub name, and message payload are required.');
    }

    try {
        let batch = await producer.createBatch();

        for (let i = 0; i < messageCount; i++) {
            const eventData = { body: messagePayload };

            if (!batch.tryAdd(eventData)) {
                if (verbose) {
                    console.log('Sending batch with size:', batch.count, 'for events starting at index', i - batch.count);
                }

                try {
                    await producer.sendBatch(batch);
                } catch (sendError) {
                    console.error('Error sending batch:', sendError);
                }

                batch = await producer.createBatch();
                batch.tryAdd(eventData);
            }
        }

        if (batch.count > 0) {
            if (verbose) {
                console.log('Sending final batch with size:', batch.count, 'for events starting at index', messageCount - batch.count);
            }
            await producer.sendBatch(batch);
        }

        console.log('All events sent successfully');
    } catch (err) {
        console.error('Error sending events:', err);
    } finally {
        try {
            await producer.close();
        } catch (closeError) {
            console.error('Error closing the producer:', closeError);
        }
    }
}

const argv = yargs(hideBin(process.argv))
    .option('connection-string', {
        alias: 'c',
        description: 'The connection string for the Event Hub',
        type: 'string',
        demandOption: true
    })
    .option('eventhub-name', {
        alias: 'e',
        description: 'The name of the Event Hub',
        type: 'string',
        demandOption: true
    })
    .option('message-count', {
        alias: 'n',
        description: 'The number of messages to send',
        type: 'number',
        demandOption: true
    })
    .option('message-payload', {
        alias: 'p',
        description: 'The payload of the messages',
        type: 'string',
        demandOption: true
    })
    .option('verbose', {
        alias: 'v',
        description: 'Output verbose logging',
        type: 'boolean',
        default: false
    })
    .option('version', {
        alias: 'V',
        description: 'Show version number',
        type: 'string',
        default: packageVersion // Set default version to package.json version
    })
    .conflicts('verbose', 'version')
    .help()
    .alias('help', 'h')
    .argv;

if (argv.version) {
    console.log(packageVersion); // Output the version from package.json
    process.exit(0);
}

sendMessages(argv['connection-string'], argv['eventhub-name'], argv['message-count'], argv['message-payload'], argv.verbose).catch(console.error);