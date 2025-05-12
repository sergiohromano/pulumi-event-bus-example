import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Create an EventBridge event bus
const eventBus = new aws.cloudwatch.EventBus("demo-event-bus", {
    name: "demo-event-bus",
});

// Define IAM role for Lambda functions
const lambdaRole = new aws.iam.Role("lambda-role", {
    assumeRolePolicy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: "sts:AssumeRole",
            Principal: {
                Service: "lambda.amazonaws.com",
            },
            Effect: "Allow",
            Sid: "",
        }],
    }),
});

// Attach basic Lambda execution policy
new aws.iam.RolePolicyAttachment("lambda-execution-policy", {
    role: lambdaRole.name,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
});

// Ensure CloudWatch Logs permissions
const cloudwatchLogsPolicy = new aws.iam.Policy("cloudwatch-logs-policy", {
    description: "Allow Lambda functions to create and write to CloudWatch logs",
    policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            Resource: "arn:aws:logs:*:*:*",
            Effect: "Allow",
        }],
    }),
});

new aws.iam.RolePolicyAttachment("cloudwatch-logs-policy-attachment", {
    role: lambdaRole.name,
    policyArn: cloudwatchLogsPolicy.arn,
});

// Add EventBridge permissions to the Lambda role
const eventBridgePolicy = new aws.iam.Policy("eventbridge-policy", {
    description: "Allow Lambda functions to publish events to EventBridge",
    policy: eventBus.arn.apply(arn => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Action: [
                "events:PutEvents"
            ],
            Resource: arn,
            Effect: "Allow",
        }],
    })),
});

new aws.iam.RolePolicyAttachment("eventbridge-policy-attachment", {
    role: lambdaRole.name,
    policyArn: eventBridgePolicy.arn,
});

// Create Lambda functions with descriptive names
const createLambda = (name: string, handlerFile: string, environment?: pulumi.Input<{[key: string]: pulumi.Input<string>}>) => {
    const lambdaFunction = new aws.lambda.Function(name, {
        code: new pulumi.asset.AssetArchive({
            ".": new pulumi.asset.FileArchive("./dist"),
        }),
        handler: handlerFile,
        role: lambdaRole.arn,
        runtime: aws.lambda.Runtime.NodeJS18dX,
        timeout: 10,
        environment: environment ? {
            variables: environment,
        } : undefined,
    });

    return lambdaFunction;
};

// Create Lambda functions with descriptive names and specific behaviors
const orderProcessingLambda = createLambda(
    "orderProcessingLambda",
    "orderProcessingLambda.handler",
    { 
        EVENT_BUS_NAME: eventBus.name,
        AWS_REGION: aws.config.region || "eu-central-1"
    }
);

const paymentProcessingLambda = createLambda(
    "paymentProcessingLambda",
    "paymentProcessingLambda.handler"
);

const inventoryUpdateLambda = createLambda(
    "inventoryUpdateLambda",
    "inventoryUpdateLambda.handler"
);

const userRegistrationLambda = createLambda(
    "userRegistrationLambda",
    "userRegistrationLambda.handler"
);

// Add notification Lambda
const notificationLambda = createLambda(
    "notificationLambda", 
    "notificationLambda.handler"
);

// Create EventBridge Rules with different patterns
const orderCreatedRule = new aws.cloudwatch.EventRule("orderCreatedRule", {
    eventBusName: eventBus.name,
    description: "Rule for order created events",
    eventPattern: JSON.stringify({
        source: ["custom.orders"],
        "detail-type": ["OrderCreated"],
    }),
});

const paymentCompletedRule = new aws.cloudwatch.EventRule("paymentCompletedRule", {
    eventBusName: eventBus.name,
    description: "Rule for payment completed events",
    eventPattern: JSON.stringify({
        source: ["custom.payments"],
        "detail-type": ["PaymentCompleted"],
    }),
});

const inventoryUpdatedRule = new aws.cloudwatch.EventRule("inventoryUpdatedRule", {
    eventBusName: eventBus.name,
    description: "Rule for inventory updated events",
    eventPattern: JSON.stringify({
        source: ["custom.inventory"],
        "detail-type": ["InventoryUpdated"],
    }),
});

const userRegisteredRule = new aws.cloudwatch.EventRule("userRegisteredRule", {
    eventBusName: eventBus.name,
    description: "Rule for user registration events",
    eventPattern: JSON.stringify({
        source: ["custom.users"],
        "detail-type": ["UserRegistered"],
    }),
});

// Connect rules to Lambda targets
new aws.cloudwatch.EventTarget("orderProcessingTarget", {
    rule: orderCreatedRule.name,
    eventBusName: eventBus.name,
    arn: orderProcessingLambda.arn,
});

// Add two targets to the payment rule: the main payment processor and the notification service
new aws.cloudwatch.EventTarget("paymentProcessingTarget", {
    rule: paymentCompletedRule.name,
    eventBusName: eventBus.name,
    arn: paymentProcessingLambda.arn,
});

new aws.cloudwatch.EventTarget("paymentNotificationTarget", {
    rule: paymentCompletedRule.name,
    eventBusName: eventBus.name,
    arn: notificationLambda.arn,
});

new aws.cloudwatch.EventTarget("inventoryUpdateTarget", {
    rule: inventoryUpdatedRule.name,
    eventBusName: eventBus.name,
    arn: inventoryUpdateLambda.arn,
});

new aws.cloudwatch.EventTarget("userRegistrationTarget", {
    rule: userRegisteredRule.name,
    eventBusName: eventBus.name,
    arn: userRegistrationLambda.arn,
});

// Add explicit Lambda permissions for EventBridge to invoke Lambda functions
// This fixes the permission issue we encountered
new aws.lambda.Permission("orderProcessingLambda-permission", {
    action: "lambda:InvokeFunction",
    function: orderProcessingLambda.name,
    principal: "events.amazonaws.com",
    sourceArn: orderCreatedRule.arn,
});

new aws.lambda.Permission("paymentProcessingLambda-permission", {
    action: "lambda:InvokeFunction",
    function: paymentProcessingLambda.name,
    principal: "events.amazonaws.com",
    sourceArn: paymentCompletedRule.arn,
});

new aws.lambda.Permission("notificationLambda-permission", {
    action: "lambda:InvokeFunction",
    function: notificationLambda.name,
    principal: "events.amazonaws.com",
    sourceArn: paymentCompletedRule.arn,
});

new aws.lambda.Permission("inventoryUpdateLambda-permission", {
    action: "lambda:InvokeFunction",
    function: inventoryUpdateLambda.name,
    principal: "events.amazonaws.com",
    sourceArn: inventoryUpdatedRule.arn,
});

new aws.lambda.Permission("userRegistrationLambda-permission", {
    action: "lambda:InvokeFunction",
    function: userRegistrationLambda.name,
    principal: "events.amazonaws.com",
    sourceArn: userRegisteredRule.arn,
});

// Export outputs
export const eventBusName = eventBus.name;
export const eventBusArn = eventBus.arn;
export const orderProcessingLambdaName = orderProcessingLambda.name;
export const paymentProcessingLambdaName = paymentProcessingLambda.name;
export const inventoryUpdateLambdaName = inventoryUpdateLambda.name;
export const userRegistrationLambdaName = userRegistrationLambda.name;
export const notificationLambdaName = notificationLambda.name; 