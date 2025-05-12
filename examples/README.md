# Event Examples

This folder contains example JSON files that can be used to send events to the EventBridge bus.

## Available Examples

1. `order_created.json` - Triggers the Order Processing Lambda
2. `payment_completed.json` - Triggers the Payment Processing Lambda (normal case)
3. `payment_error.json` - Triggers an error in the Payment Processing Lambda (amount > $1000)
4. `inventory_updated.json` - Triggers the Inventory Update Lambda
5. `user_registered.json` - Triggers the User Registration Lambda
6. `chain_reaction.json` - Triggers the Order Processing Lambda, which then sends a payment event

## Using the Examples

### Option 1: Using the provided script

The `send_event.sh` script makes it easy to send events:

```bash
# Make the script executable (one time only)
chmod +x send_event.sh

# Send an event
./send_event.sh order_created.json
```

### Option 2: Using AWS CLI directly

```bash
# Copy the JSON content from a file and use it with AWS CLI
aws events put-events --entries '[<paste JSON content here>]'
```

### Option 3: Using with AWS Console

1. Open the AWS Console
2. Navigate to Amazon EventBridge
3. Click "Event buses" in the sidebar
4. Select your event bus (demo-event-bus)
5. Click "Send events"
6. Copy and paste the content from any of the JSON files
7. Click "Send"

## Watching the Results

After sending an event, you can see the results in CloudWatch Logs:

1. Open the AWS Console
2. Navigate to CloudWatch
3. Click "Log groups" in the sidebar
4. Look for log groups named after your Lambda functions (e.g., `/aws/lambda/orderProcessingLambda`)
5. Click on the log group to see the logs and observe the event processing 