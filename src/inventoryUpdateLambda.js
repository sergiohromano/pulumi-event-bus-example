exports.handler = async (event) => {
    console.log('Inventory Update Lambda received event:', JSON.stringify(event, null, 2));
    
    const inventory = event.detail || {};
    const productId = inventory.productId || 'unknown';
    const quantity = inventory.quantity || 0;
    
    console.log(`Updating inventory for product ${productId} with quantity ${quantity}`);
    
    // Process the inventory update
    console.log(`Inventory for product ${productId} updated successfully`);
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Inventory updated successfully',
            productId: productId,
            quantity: quantity,
            warehouseId: inventory.warehouseId || 'main-warehouse',
            timestamp: new Date().toISOString()
        })
    };
}; 