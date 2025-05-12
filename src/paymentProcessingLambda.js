exports.handler = async (event) => {
    console.log('Payment Processing Lambda received event:', JSON.stringify(event, null, 2));
    
    const payment = event.detail || {};
    const amount = payment.amount || 0;
    const orderId = payment.orderId || 'unknown';
    
    console.log(`Processing payment for order ${orderId} with amount $${amount}`);
    
    // Intentionally trigger error for large amounts (over $1000)
    if (amount > 1000) {
        const errorMessage = `Payment amount $${amount} exceeds the maximum allowed amount of $1000`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    // Process the payment
    console.log(`Payment for order ${orderId} processed successfully`);
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Payment processed successfully',
            orderId: orderId,
            amount: amount,
            paymentId: payment.paymentId || `payment-${Date.now()}`
        })
    };
}; 