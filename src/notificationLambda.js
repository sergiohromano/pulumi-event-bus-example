exports.handler = async (event) => {
    console.log('Notification Lambda received event:', JSON.stringify(event, null, 2));
    
    const eventDetail = event.detail || {};
    const eventType = event['detail-type'] || 'Unknown';
    const eventSource = event.source || 'unknown';
    
    console.log(`Sending notification for ${eventType} from ${eventSource}`);
    
    // Extract relevant information based on event type
    let notificationMessage = '';
    
    if (eventSource === 'custom.payments' && eventType === 'PaymentCompleted') {
        const orderId = eventDetail.orderId || 'unknown';
        const amount = eventDetail.amount || 0;
        notificationMessage = `Payment of $${amount} for order ${orderId} has been processed.`;
    } else {
        notificationMessage = `Event received: ${eventType} from ${eventSource}`;
    }
    
    // In a real scenario, this would send an email, SMS, or push notification
    // For this example, we'll just log it
    console.log(`NOTIFICATION SENT: ${notificationMessage}`);
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Notification sent successfully',
            notificationContent: notificationMessage,
            timestamp: new Date().toISOString()
        })
    };
}; 