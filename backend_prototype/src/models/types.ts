export enum UserRole {
    CUSTOMER = 'CUSTOMER',
    SELLER = 'SELLER',
    DELIVERY_PARTNER = 'DELIVERY_PARTNER',
    ADMIN = 'ADMIN'
}

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
    DELIVERED = 'DELIVERED',
    REJECTED_BY_ALL = 'REJECTED_BY_ALL' // Fallback
}

export interface User {
    id: string;
    role: UserRole;
    name: string;
    location: { lat: number; lng: number };
}

export interface Store {
    id: string;
    sellerId: string;
    name: string;
    location: { lat: number; lng: number };
    inventory: Map<string, number>; // ProductId -> Quantity
}

export interface Product {
    id: string;
    name: string;
    price: number;
}

export interface OrderItem {
    productId: string;
    quantity: number;
    priceAtPurchase: number;
}

export interface Order {
    id: string;
    customerId: string;
    storeId?: string;
    items: OrderItem[];
    totalAmount: number;
    orderStatus: OrderStatus;
    fulfillmentStatus: FulfillmentStatus;
    deliveryPartnerId?: string;
    createdAt: Date;
}

export interface ReservedStock {
    storeId: string;
    productId: string;
    quantity: number;
    expiresAt: Date;
    orderId: string;
}
