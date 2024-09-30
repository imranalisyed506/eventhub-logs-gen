# README.md

## Event Hub Message Sender

This application sends messages to an Azure Event Hub.

### Prerequisites

- Node.js
- Azure Event Hub connection string and name

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install @azure/event-hubs yargs
   ```

3. To install globally as a binary:

   ```bash
   npm i -g .
   ```

### Usage

Run the script with the following command:

```bash
#!/usr/bin/env node
'use strict';

node <script_name> --connection-string <connectionString> --eventhub-name <eventHubName> --message-count <messageCount> --message-payload <messagePayload>
```

- `--connection-string` or `-c`: Azure Event Hub connection string
- `--eventhub-name` or `-e`: Name of the Event Hub
- `--message-count` or `-n`: Number of messages to send
- `--message-payload` or `-p`: Payload of the messages
- `--verbose` or `-v`: Output verbose logging

### Example

```bash
node index.js -c "Endpoint=sb://<name>.servicebus.windows.net/;SharedAccessKeyName=<keyName>;SharedAccessKey=<key>" -e "my-event-hub" -n 10 -p '{"payload":"Hello World"}' -v
```

This example sends 10 messages to "my-event-hub" with verbose output.

### Author

- Maintainer: Imran
