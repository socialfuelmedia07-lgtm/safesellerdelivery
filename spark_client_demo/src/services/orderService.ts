import { db, getOrderRef, getStoreInventoryRef } from './firestore';
import { runTransaction, doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Order, OrderStatus, FulfillmentStatus, OrderItem } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class ClientOrderService {

    // 1. SEED DATA (Helper to setup test)
    async seedStore(storeId: string, products: { id: string, price: number, stock: number }[]) {
        console.log(`[Seed] Creating store ${storeId}...`);
        for (const p of products) {
            await setDoc(getStoreInventoryRef(storeId, p.id), {
                price: p.price,
                stockLevel: p.stock
            });
        }
    }

    // 2. PLACE ORDER (Client-Side Transaction)
    async placeOrder(customerId: string, storeId: string, items: { productId: string, quantity: number }[]): Promise<string> {
        const orderId = uuidv4();
        const orderRef = getOrderRef(orderId);

        try {
            await runTransaction(db, async (t) => {
                let totalAmount = 0;
                const finalItems: OrderItem[] = [];

                // 1. READ PASS
                const inventoryEntries = [];
                for (const item of items) {
                    const invRef = getStoreInventoryRef(storeId, item.productId);
                    const invDoc = await t.get(invRef);

                    if (!invDoc.exists()) throw new Error(`Product ${item.productId} not found`);
                    inventoryEntries.push({ invRef, invDoc, item });
                }

                // 2. WRITE PASS
                for (const entry of inventoryEntries) {
                    const { invRef, invDoc, item } = entry;
                    const data = invDoc.data()!;
                    const currentStock = data.stockLevel;
                    const price = data.price;

                    if (currentStock < item.quantity) {
                        throw new Error(`Insufficient stock for ${item.productId}. Have ${currentStock}, need ${item.quantity}`);
                    }

                    // Decrement Stock
                    t.update(invRef, { stockLevel: currentStock - item.quantity });

                    totalAmount += price * item.quantity;
                    finalItems.push({ productId: item.productId, quantity: item.quantity, price });
                }

                // Create Order
                const newOrder: Order = {
                    id: orderId,
                    customerId,
                    storeId,
                    items: finalItems,
                    totalAmount,
                    orderStatus: OrderStatus.SELLER_PENDING,
                    fulfillmentStatus: FulfillmentStatus.UNASSIGNED,
                    createdAt: serverTimestamp()
                };

                t.set(orderRef, newOrder);
            });

            console.log(`[Client] Order ${orderId} placed successfully!`);
            return orderId;
        } catch (e: any) {
            console.error(`[Client] Order failed: ${e.message}`);
            throw e;
        }
    }

    // 3. SELLER ACCEPT (Direct Update - Security Rules normally protect this)
    async sellerAccept(orderId: string) {
        const orderRef = getOrderRef(orderId);
        await updateDoc(orderRef, {
            orderStatus: OrderStatus.ACTIVE,
            fulfillmentStatus: FulfillmentStatus.ASSIGNING_DELIVERY
        });
        console.log(`[Client] Seller accepted order ${orderId}`);
    }

    // 4. DELIVERY ACCEPT (Client-Side Lock)
    async deliveryPartnerAccept(orderId: string, partnerId: string): Promise<boolean> {
        const orderRef = getOrderRef(orderId);

        try {
            await runTransaction(db, async (t) => {
                const docSnap = await t.get(orderRef);
                if (!docSnap.exists()) throw new Error("Order not found");

                const data = docSnap.data() as Order;
                if (data.fulfillmentStatus !== FulfillmentStatus.ASSIGNING_DELIVERY) {
                    throw new Error("Order already assigned or not ready");
                }

                // Lock it
                t.update(orderRef, {
                    fulfillmentStatus: FulfillmentStatus.ON_THE_WAY,
                    deliveryPartnerId: partnerId
                });
            });

            console.log(`[Client] Partner ${partnerId} accepted order ${orderId}`);
            return true;
        } catch (e) {
            console.log(`[Client] Partner ${partnerId} failed to accept: ${(e as Error).message}`);
            return false;
        }
    }
}

export const clientOrderService = new ClientOrderService();
