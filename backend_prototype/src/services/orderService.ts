import { Order, OrderStatus, FulfillmentStatus, OrderItem, ReservedStock } from '../models/types';
import { storeService } from './storeService';
import { eventBus, EVENTS } from '../eventBus';
import { v4 as uuidv4 } from 'uuid';

export class OrderService {
    private orders: Map<string, Order> = new Map();
    private reservations: Map<string, ReservedStock[]> = new Map(); // OrderID -> Reservations

    public createOrder(customerId: string, location: { lat: number; lng: number }, items: { productId: string, quantity: number }[]): Order | null {
        // 1. Find suitable store
        const store = storeService.findNearbyStore(location, items);

        if (!store) {
            console.log(`[Order] No store found with sufficient stock.`);
            return null;
        }

        // 2. Reserve Stock (Concurrency Handling)
        const orderId = uuidv4();
        const reservedItems: ReservedStock[] = [];
        let reservationSuccess = true;

        for (const item of items) {
            const success = storeService.decrementStock(store.id, item.productId, item.quantity);
            if (success) {
                reservedItems.push({
                    storeId: store.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    expiresAt: new Date(Date.now() + 10 * 60000), // 10 mins
                    orderId
                });
            } else {
                reservationSuccess = false;
                break;
            }
        }

        // Rollback if any item failed to reserve
        if (!reservationSuccess) {
            console.log(`[Order] Reservation failed. Rolling back.`);
            this.rollbackReservations(reservedItems);
            return null;
        }

        this.reservations.set(orderId, reservedItems);

        // 3. Create Order Object
        const orderItems: OrderItem[] = items.map(item => {
            const product = storeService.getProduct(item.productId);
            return {
                productId: item.productId,
                quantity: item.quantity,
                priceAtPurchase: product ? product.price : 0
            };
        });

        const totalAmount = orderItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);

        const newOrder: Order = {
            id: orderId,
            customerId,
            storeId: store.id,
            items: orderItems,
            totalAmount,
            orderStatus: OrderStatus.SELLER_PENDING,
            fulfillmentStatus: FulfillmentStatus.UNASSIGNED,
            createdAt: new Date()
        };

        this.orders.set(orderId, newOrder);

        // 4. Emit Event
        eventBus.publish(EVENTS.ORDER_CREATED, newOrder);

        // Configure Auto-Expiry of Reservation (Simulated)
        setTimeout(() => {
            this.checkReservationExpiry(orderId);
        }, 10 * 60000); // 10 mins

        return newOrder;
    }

    public getOrder(orderId: string): Order | undefined {
        return this.orders.get(orderId);
    }

    public updateOrderStatus(orderId: string, status: OrderStatus) {
        const order = this.orders.get(orderId);
        if (!order) return;

        order.orderStatus = status;
        eventBus.publish(EVENTS.ORDER_STATUS_UPDATED, { orderId, status });

        if (status === OrderStatus.CANCELLED) {
            // Prepare to release stock if cancelled
            this.releaseReservations(orderId);
        }
    }

    public updateFulfillmentStatus(orderId: string, status: FulfillmentStatus, partnerId?: string) {
        const order = this.orders.get(orderId);
        if (!order) return;

        order.fulfillmentStatus = status;
        if (partnerId) order.deliveryPartnerId = partnerId;

        eventBus.publish(EVENTS.ORDER_STATUS_UPDATED, { orderId, fulfillmentStatus: status, partnerId });
    }

    private rollbackReservations(reservations: ReservedStock[]) {
        for (const res of reservations) {
            storeService.restoreStock(res.storeId, res.productId, res.quantity);
        }
    }

    public releaseReservations(orderId: string) {
        const resList = this.reservations.get(orderId);
        if (resList) {
            this.rollbackReservations(resList);
            this.reservations.delete(orderId);
            console.log(`[Order] Reservations released for order ${orderId}`);
        }
    }

    public confirmOrder(orderId: string) {
        // Called when order is successfully completed or passed point of no return
        // We remove the reservation entry but NOT restore stock (since it's sold)
        this.reservations.delete(orderId);
    }

    private checkReservationExpiry(orderId: string) {
        const order = this.orders.get(orderId);
        if (order && order.orderStatus === OrderStatus.SELLER_PENDING) {
            console.log(`[Order] Order ${orderId} timed out waiting for seller. Cancelled.`);
            this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
        }
    }
}

export const orderService = new OrderService();
