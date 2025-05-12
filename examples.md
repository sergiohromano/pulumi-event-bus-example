# Event Bus Example Payloads

This document contains example payloads for testing each Lambda function in the event bus architecture.

## 1. Order Processing Lambda

This event will trigger the Order Processing Lambda, which will then generate a payment event:

```bash
aws events put-events --entries '[{
  "Source": "custom.orders",
  "DetailType": "OrderCreated",
  "Detail": "{
    \"orderId\": \"ORD-12345\",
    \"amount\": 500,
    \"customerId\": \"CUST-789\",
    \"items\": [
      {\"productId\": \"PROD-001\", \"quantity\": 2, \"price\": 200},
      {\"productId\": \"PROD-002\", \"quantity\": 1, \"price\": 100}
    ],
    \"timestamp\": \"2023-08-15T14:30:00Z\"
  }",
  "EventBusName": "demo-event-bus"
}]'
```

## 2. Payment Processing Lambda (Normal Case)

This event will be handled by both the Payment Processing Lambda and the Notification Lambda:

```bash
aws events put-events --entries '[{
  "Source": "custom.payments",
  "DetailType": "PaymentCompleted",
  "Detail": "{
    \"orderId\": \"ORD-12345\",
    \"amount\": 500,
    \"paymentId\": \"PMT-6789\",
    \"paymentMethod\": \"credit_card\",
    \"cardType\": \"visa\",
    \"lastFour\": \"4242\",
    \"status\": \"succeeded\",
    \"timestamp\": \"2023-08-15T14:35:00Z\"
  }",
  "EventBusName": "demo-event-bus"
}]'
```

## 3. Payment Processing Lambda (Error Case)

This event will trigger an error in the Payment Processing Lambda (amount > $1000), but the Notification Lambda will still process it:

```bash
aws events put-events --entries '[{
  "Source": "custom.payments",
  "DetailType": "PaymentCompleted",
  "Detail": "{
    \"orderId\": \"ORD-67890\",
    \"amount\": 1500,
    \"paymentId\": \"PMT-9012\",
    \"paymentMethod\": \"credit_card\",
    \"cardType\": \"mastercard\",
    \"lastFour\": \"5678\",
    \"status\": \"succeeded\", 
    \"timestamp\": \"2023-08-15T15:00:00Z\"
  }",
  "EventBusName": "demo-event-bus"
}]'
```

## 4. Inventory Update Lambda

This event will trigger the Inventory Update Lambda:

```bash
aws events put-events --entries '[{
  "Source": "custom.inventory",
  "DetailType": "InventoryUpdated",
  "Detail": "{
    \"productId\": \"PROD-001\",
    \"quantity\": 50,
    \"warehouseId\": \"WH-NORTH\",
    \"reason\": \"restock\",
    \"previousQuantity\": 10,
    \"updatedBy\": \"system\",
    \"timestamp\": \"2023-08-15T16:00:00Z\"
  }",
  "EventBusName": "demo-event-bus"
}]'
```

## 5. User Registration Lambda

This event will trigger the User Registration Lambda:

```bash
aws events put-events --entries '[{
  "Source": "custom.users",
  "DetailType": "UserRegistered",
  "Detail": "{
    \"userId\": \"USER-456\",
    \"email\": \"jane.doe@example.com\",
    \"name\": \"Jane Doe\",
    \"userType\": \"standard\",
    \"marketingConsent\": true,
    \"source\": \"mobile_app\",
    \"timestamp\": \"2023-08-15T17:00:00Z\"
  }",
  "EventBusName": "demo-event-bus"
}]'
```

## Chain Reaction Example

This example shows how to trigger the entire chain:
1. Order event → Order Processing Lambda
2. Order Processing Lambda automatically sends a payment event
3. Payment event triggers both Payment Processing Lambda and Notification Lambda

```bash
# Just trigger the order event, and watch the chain reaction
aws events put-events --entries '[{
  "Source": "custom.orders",
  "DetailType": "OrderCreated",
  "Detail": "{
    \"orderId\": \"ORD-CHAIN-123\",
    \"amount\": 750,
    \"customerId\": \"CUST-456\",
    \"timestamp\": \"2023-08-15T18:00:00Z\"
  }",
  "EventBusName": "demo-event-bus"
}]'
``` 