export enum OrderStatus {
    SELLER_PENDING = 'SELLER_PENDING',
    ACTIVE = 'ACTIVE',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}

export enum FulfillmentStatus {
    UNASSIGNED = 'UNASSIGNED',
    ASSIGNING_DELIVERY = 'ASSIGNING_DELIVERY',
    ON_THE_WAY = 'ON_THE_WAY',
    DELIVERED = 'DELIVERED'
}

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: string; // Document ID
    customerId: string;
    storeId: string;
    items: OrderItem[];
    totalAmount: number;
    orderStatus: OrderStatus;
    fulfillmentStatus: FulfillmentStatus;
    deliveryPartnerId?: string;
    createdAt: FirebaseFirestore.Timestamp;
}

// For concurrency
export interface ReservedStock {
    storeId: string;
    productId: string;
    quantity: number;
    expiresAt: FirebaseFirestore.Timestamp;
    orderId: string;
}
