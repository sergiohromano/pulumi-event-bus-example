# AWS EventBridge Bus with Lambda Targets

This Pulumi project creates:
- An AWS EventBridge event bus
- 4 EventBridge rules with different event patterns
- 5 Lambda functions as targets for these rules, each handling different event types

## Architecture Overview

The project demonstrates an event-driven architecture with the following components:

1. **Order Processing Lambda** - Processes order creation events and sends payment events to the event bus
2. **Payment Processing Lambda** - Processes payment events (throws error for payments over $1000)
3. **Inventory Update Lambda** - Handles inventory updates
4. **User Registration Lambda** - Manages user registration events
5. **Notification Lambda** - Sends notifications for payment events (demonstrates multiple targets for one rule)

## Event Flow

The project demonstrates a complete event flow:
1. An order created event triggers the Order Processing Lambda
2. The Order Processing Lambda sends a payment event to the event bus
3. The payment event triggers both:
   - The Payment Processing Lambda (which will throw an error if the amount is over $1000)
   - The Notification Lambda (which would send notifications to users in a real system)

This demonstrates how a single event can trigger multiple Lambda functions in parallel.

## Prerequisites

- [Bun](https://bun.sh/) (for faster package installation)
- [Node.js](https://nodejs.org/) (v14 or later)
- [Pulumi CLI](https://www.pulumi.com/docs/get-started/install/)
- [AWS CLI](https://aws.amazon.com/cli/) configured with your credentials

## Setup

1. Install dependencies:
   ```
   bun install
   ```

2. Build the TypeScript code:
   ```
   bun run build
   ```

3. Deploy the infrastructure:
   ```
   bun run deploy
   ```

## Testing the Event Bus

After deployment, you can test the event bus using the example payloads in the `examples` folder:

```bash
# Using the provided script
cd examples
./send_event.sh order_created.json
```

See the `examples/README.md` file for more information on how to use the example payloads.

## Cleanup

To remove all resources:

```
bun run down
``` 