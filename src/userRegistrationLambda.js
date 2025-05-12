exports.handler = async (event) => {
    console.log('User Registration Lambda received event:', JSON.stringify(event, null, 2));
    
    const user = event.detail || {};
    const userId = user.userId || `user-${Date.now()}`;
    const email = user.email || 'user@example.com';
    
    console.log(`Registering user ${userId} with email ${email}`);
    
    // Process the user registration
    console.log(`User ${userId} registered successfully`);
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'User registered successfully',
            userId: userId,
            email: email,
            registrationDate: new Date().toISOString(),
            status: 'active'
        })
    };
}; 