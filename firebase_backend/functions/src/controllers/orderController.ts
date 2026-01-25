import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { firestoreService } from '../services/firestoreService';
import { Order, OrderStatus, FulfillmentStatus } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }

    const { customerId, storeId, items } = req.body;
    // Payload: items: [{ productId, quantity }]

    try {
        const orderId = uuidv4();
        const orderRef = firestoreService.ordersCol.doc(orderId);

        // Run Transaction: Check Stock -> Decrement -> Create Order
        await firestoreService.db.runTransaction(async (t) => {
            let totalAmount = 0;

            for (const item of items) {
                const invRef = firestoreService.getStoreInventoryRef(storeId, item.productId);
                const invDoc = await t.get(invRef);

                if (!invDoc.exists) throw new Error(`Product ${item.productId} not found`);

                const currentStock = invDoc.data()?.stockLevel || 0;
                const price = invDoc.data()?.price || 0;

                if (currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.productId}`);
                }

                // Decrement Stock
                t.update(invRef, { stockLevel: currentStock - item.quantity });
                totalAmount += price * item.quantity;
            }

            // Create Order
            const newOrder: Order = {
                id: orderId,
                customerId,
                storeId,
                items,
                totalAmount,
                orderStatus: OrderStatus.SELLER_PENDING,
                fulfillmentStatus: FulfillmentStatus.UNASSIGNED,
                createdAt: admin.firestore.Timestamp.now()
            };

            t.set(orderRef, newOrder);
        });

        res.json({ success: true, orderId });
    } catch (error: any) {
        console.error('Order Creation Failed:', error);
        res.status(500).json({ error: error.message });
    }
});
