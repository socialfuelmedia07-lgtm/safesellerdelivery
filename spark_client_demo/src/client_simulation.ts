import { clientOrderService } from './services/orderService';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { db } from './services/firestore';

// Emulator connection removed to use real Firestore (Spark Plan)
// connectFirestoreEmulator(db, 'localhost', 8080);


const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function runClientSimulation() {
    console.log('--- STARTING CLIENT-SIDE (SPARK PLAN) SIMULATION ---');

    const STORE_ID = 'store-spark-1';

    // 1. Seed Data
    console.log('\n--- STEP 1: SEEDING STORE INVALID DATA ---');
    await clientOrderService.seedStore(STORE_ID, [
        { id: 'milk', price: 2.50, stock: 10 },
        { id: 'eggs', price: 5.00, stock: 20 }
    ]);

    // 2. Place Order
    console.log('\n--- STEP 2: PLACING ORDER ---');
    let orderId = '';
    try {
        orderId = await clientOrderService.placeOrder('cust-1', STORE_ID, [
            { productId: 'milk', quantity: 2 },
            { productId: 'eggs', quantity: 1 }
        ]);
    } catch (e) {
        console.error('Failed to place order', e);
        return;
    }

    await delay(1000);

    // 3. Seller Accepts
    console.log('\n--- STEP 3: SELLER ACCEPTANCE ---');
    // (In real app, Seller Dashboard would listen to 'orders' collection)
    await clientOrderService.sellerAccept(orderId);

    await delay(1000);

    // 4. Delivery Race Condition
    console.log('\n--- STEP 4: DELIVERY RACE ---');
    const p1 = clientOrderService.deliveryPartnerAccept(orderId, 'partner-A');
    const p2 = clientOrderService.deliveryPartnerAccept(orderId, 'partner-B');

    const [res1, res2] = await Promise.all([p1, p2]);

    console.log(`Partner A Result: ${res1}`);
    console.log(`Partner B Result: ${res2}`);

    console.log('\n--- SIMULATION COMPLETE ---');
    console.log('Note: To run this, you must have "firebase emulators:start --only firestore" running in another terminal.');
    process.exit(0);
}

runClientSimulation();
