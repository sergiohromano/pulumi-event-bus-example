const {
  EventBridgeClient,
  PutEventsCommand,
} = require("@aws-sdk/client-eventbridge");

exports.handler = async (event) => {
  console.log(
    "Order Processing Lambda received event:",
    JSON.stringify(event, null, 2),
  );

  // Process the order
  const orderId = event.detail?.orderId || Math.floor(Math.random() * 10000);
  const amount = event.detail?.amount || Math.floor(Math.random() * 500) + 50;

  console.log(`Processing order ${orderId} with amount $${amount}`);

  // Create payment details
  const paymentDetail = {
    orderId: orderId,
    amount: amount,
    paymentId: `pmt-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  console.log(
    "Order processed. Payment details:",
    JSON.stringify(paymentDetail, null, 2),
  );
  console.log("Event bus name:", process.env.EVENT_BUS_NAME);
  console.log("AWS region:", process.env.REGION);

  // Initialize the EventBridge client
  const client = new EventBridgeClient({
    region: process.env.REGION,
  });

  try {
    // Create the event
    const params = {
      Entries: [
        {
          Source: "custom.payments",
          DetailType: "PaymentCompleted",
          Detail: JSON.stringify(paymentDetail),
          EventBusName: process.env.EVENT_BUS_NAME,
        },
      ],
    };

    // Send the event
    const command = new PutEventsCommand(params);
    const response = await client.send(command);
    console.log(`Event sent to EventBridge: ${JSON.stringify(response)}`);
  } catch (error) {
    console.error("Error sending event to EventBridge:", error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Order processed successfully",
      orderId: orderId,
      amount: amount,
    }),
  };
};
