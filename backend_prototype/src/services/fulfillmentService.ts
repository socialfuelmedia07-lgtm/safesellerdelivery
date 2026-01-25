import { orderService } from './orderService';
import { eventBus, EVENTS } from '../eventBus';
import { OrderStatus, FulfillmentStatus } from '../models/types';

export class FulfillmentService {
    constructor() {
        this.setupListeners();
    }

    private setupListeners() {
        eventBus.on(EVENTS.ORDER_CREATED, (order) => {
            console.log(`[Fulfillment] Order ${order.id} created. Notifying seller ${order.storeId}...`);
        });
    }

    public async sellerAcceptOrder(orderId: string): Promise<boolean> {
        const order = orderService.getOrder(orderId);
        if (!order || order.orderStatus !== OrderStatus.SELLER_PENDING) {
            console.log(`[Fulfillment] Seller accept failed: Order ${orderId} not pending.`);
            return false;
        }

        console.log(`[Fulfillment] Seller accepted order ${orderId}. Starting delivery search...`);
        orderService.updateOrderStatus(orderId, OrderStatus.ACTIVE);
        orderService.updateFulfillmentStatus(orderId, FulfillmentStatus.ASSIGNING_DELIVERY);

        eventBus.publish(EVENTS.SELLER_ACCEPTED, { orderId });
        this.broadcastToDeliveryPartners(orderId);
        return true;
    }

    public async sellerRejectOrder(orderId: string): Promise<boolean> {
        const order = orderService.getOrder(orderId);
        if (!order) return false;

        console.log(`[Fulfillment] Seller rejected order ${orderId}.`);
        orderService.updateOrderStatus(orderId, OrderStatus.CANCELLED);
        eventBus.publish(EVENTS.SELLER_REJECTED, { orderId });
        return true;
    }

    private broadcastToDeliveryPartners(orderId: string) {
        console.log(`[Fulfillment] Broadcasting order ${orderId} to nearby delivery partners...`);
        // In real app: Push Notification / WebSocket
        eventBus.publish(EVENTS.DELIVERY_OFFERED, { orderId });
    }

    public async deliveryPartnerAccept(orderId: string, partnerId: string): Promise<boolean> {
        // LOCKING LOGIC: Check if still unassigned
        const order = orderService.getOrder(orderId);

        if (!order) {
            return false;
        }

        if (order.fulfillmentStatus !== FulfillmentStatus.ASSIGNING_DELIVERY) {
            console.log(`[Fulfillment] Partner ${partnerId} failed to accept ${orderId}: Already assigned or invalid status.`);
            return false;
        }

        // ATOMIC UPDATE (Simulated by single-threaded JS event loop here)
        console.log(`[Fulfillment] Partner ${partnerId} accepted order ${orderId}. Locked.`);
        orderService.updateFulfillmentStatus(orderId, FulfillmentStatus.ON_THE_WAY, partnerId);
        eventBus.publish(EVENTS.DELIVERY_ASSIGNED, { orderId, partnerId });

        return true;
    }

    public async updateDeliveryStatus(orderId: string, status: FulfillmentStatus) {
        const order = orderService.getOrder(orderId);
        if (!order) return;

        if (status === FulfillmentStatus.DELIVERED) {
            orderService.updateFulfillmentStatus(orderId, FulfillmentStatus.DELIVERED);
            orderService.updateOrderStatus(orderId, OrderStatus.COMPLETED);
            orderService.confirmOrder(orderId); // Release reservation cleanup
            eventBus.publish(EVENTS.ORDER_COMPLETED, { orderId });
            console.log(`[Fulfillment] Order ${orderId} delivered successfully.`);
        } else {
            orderService.updateFulfillmentStatus(orderId, status);
        }
    }
}

export const fulfillmentService = new FulfillmentService();
