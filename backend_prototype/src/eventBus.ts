import { EventEmitter } from 'events';

class EventBus extends EventEmitter {
    private static instance: EventBus;

    private constructor() {
        super();
    }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public publish(event: string, payload: any) {
        console.log(`[EVENT] ${event}:`, JSON.stringify(payload, null, 2));
        this.emit(event, payload);
    }
}

export const eventBus = EventBus.getInstance();

export const EVENTS = {
    ORDER_CREATED: 'ORDER_CREATED',
    STORE_SELECTED: 'STORE_SELECTED',
    ORDER_OFFERED_TO_SELLER: 'ORDER_OFFERED_TO_SELLER',
    SELLER_ACCEPTED: 'SELLER_ACCEPTED',
    SELLER_REJECTED: 'SELLER_REJECTED',
    DELIVERY_OFFERED: 'DELIVERY_OFFERED',
    DELIVERY_ASSIGNED: 'DELIVERY_ASSIGNED',
    ORDER_STATUS_UPDATED: 'ORDER_STATUS_UPDATED',
    ORDER_COMPLETED: 'ORDER_COMPLETED'
};
