export enum OrderStatus {
    SELLER_PENDING = 'SELLER_PENDING',
    ACTIVE = 'ACTIVE', // Accepted by Seller
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}

export enum FulfillmentStatus {
    UNASSIGNED = 'UNASSIGNED',
    ASSIGNING_DELIVERY = 'ASSIGNING_DELIVERY',
    ON_THE_WAY = 'ON_THE_WAY',
    DELIVERED = 'DELIVERED',
    REJECTED_BY_ALL = 'REJECTED_BY_ALL'
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
    createdAt: any; // Firestore Timestamp
}
