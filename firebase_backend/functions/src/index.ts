import * as functions from 'firebase-functions';
import { createOrder } from './controllers/orderController';
import { firestoreService } from './services/firestoreService';
import { OrderStatus, FulfillmentStatus } from './models/types';

// Export HTTP functions
export { createOrder };

// --- TRIGGERS ---

// 1. Notify Seller when Order Created
export const onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
        const order = snap.data();
        console.log(`[TRIGGER] Order ${context.params.orderId} created. Notify Seller: ${order.storeId}`);
        // Send FCM / Email to Seller Here
    });

// 2. Broadcast to Delivery Partners when Seller Accepts
export const onOrderUpdate = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
        const newData = change.after.data();
        const oldData = change.before.data();

        // Detect Status Change: SELLER_PENDING -> ACTIVE
        if (oldData.orderStatus !== OrderStatus.ACTIVE && newData.orderStatus === OrderStatus.ACTIVE) {
            console.log(`[TRIGGER] Order ${context.params.orderId} Accepted by Seller. Broadcasting to Delivery Partners.`);

            await change.after.ref.update({
                fulfillmentStatus: FulfillmentStatus.ASSIGNING_DELIVERY
            });

            // In real app: Write to 'delivery_offers' collection or send FCM
        }
    });

// 3. Delivery Acceptance Logic (HTTP for Locking)
export const acceptDelivery = functions.https.onRequest(async (req, res) => {
    const { orderId, partnerId } = req.body;
    const orderRef = firestoreService.ordersCol.doc(orderId);

    try {
        await firestoreService.db.runTransaction(async (t) => {
            const doc = await t.get(orderRef);
            if (!doc.exists) throw new Error("Order not found");

            const data = doc.data() as any;
            if (data.fulfillmentStatus !== FulfillmentStatus.ASSIGNING_DELIVERY) {
                throw new Error("Order already assigned or not ready");
            }

            t.update(orderRef, {
                fulfillmentStatus: FulfillmentStatus.ON_THE_WAY,
                deliveryPartnerId: partnerId
            });
        });

        res.json({ success: true, message: "Delivery Assigned" });
    } catch (e: any) {
        res.status(409).json({ error: e.message }); // 409 Conflict
    }
});
