import { orderService } from './services/orderService';
import { fulfillmentService } from './services/fulfillmentService';
import { eventBus, EVENTS } from './eventBus';
import { UserRole } from './models/types';

// Simple delay helper
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runSimulation() {
    console.log('--- STARTING HYPERLOCAL DELIVERY SIMULATION ---');

    // 1. User places an order
    console.log('\n--- STEP 1: CUSTOMER PLACES ORDER ---');
    const customerId = 'user-cust-1';
    const location = { lat: 40.7128, lng: -74.0060 }; // Near Downtown Grocers
    const items = [
        { productId: 'prod-1', quantity: 2 }, // Milk
        { productId: 'prod-3', quantity: 5 }  // Eggs
    ];

    const order = orderService.createOrder(customerId, location, items);
    if (!order) {
        console.error('Failed to create order');
        return;
    }
    console.log(`Order Placed: ${order.id} | Status: ${order.orderStatus}`);

    await delay(1000);

    // 2. Seller Accepts Order
    console.log('\n--- STEP 2: SELLER ACTIONS ---');
    await fulfillmentService.sellerAcceptOrder(order.id);

    await delay(1000);

    // 3. Delivery Partners Compete (Race Condition Test)
    console.log('\n--- STEP 3: DELIVERY ASSIGNMENT (RACE) ---');
    const p1 = 'partner-1';
    const p2 = 'partner-2';

    // Partner 1 tries to accept
    const success1 = await fulfillmentService.deliveryPartnerAccept(order.id, p1);
    console.log(`Partner 1 Accept Result: ${success1}`);

    // Partner 2 tries to accept immediately after
    const success2 = await fulfillmentService.deliveryPartnerAccept(order.id, p2);
    console.log(`Partner 2 Accept Result: ${success2} (Should be false)`);

    await delay(1000);

    // 4. Delivery Process
    console.log('\n--- STEP 4: DELIVERY COMPLETION ---');
    await fulfillmentService.updateDeliveryStatus(order.id, 'DELIVERED' as any); // Type cast for ease

    console.log('\n--- SIMULATION COMPLETE ---');
}

runSimulation();
