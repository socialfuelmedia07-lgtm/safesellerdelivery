import { Store, Product } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class StoreService {
    private stores: Store[] = [];
    private products: Product[] = [];

    constructor() {
        this.seedData();
    }

    private seedData() {
        // Seed some products
        const p1 = { id: 'prod-1', name: 'Milk', price: 2.5 };
        const p2 = { id: 'prod-2', name: 'Bread', price: 1.5 };
        const p3 = { id: 'prod-3', name: 'Eggs', price: 3.0 };
        this.products.push(p1, p2, p3);

        // Seed some stores
        const s1: Store = {
            id: 'store-1',
            sellerId: 'user-seller-1',
            name: 'Downtown Grocers',
            location: { lat: 40.7128, lng: -74.0060 }, // NYC
            inventory: new Map([
                ['prod-1', 10], // 10 Milk
                ['prod-2', 5],  // 5 Bread
                ['prod-3', 20]  // 20 Eggs
            ])
        };

        const s2: Store = {
            id: 'store-2',
            sellerId: 'user-seller-2',
            name: 'Uptown Market',
            location: { lat: 40.7580, lng: -73.9855 }, // Times Squareish
            inventory: new Map([
                ['prod-1', 2],  // 2 Milk
                ['prod-2', 0],  // 0 Bread (Out of stock)
                ['prod-3', 10]
            ])
        };

        this.stores.push(s1, s2);
    }

    public getProduct(productId: string): Product | undefined {
        return this.products.find(p => p.id === productId);
    }

    public findNearbyStore(location: { lat: number; lng: number }, requiredItems: { productId: string, quantity: number }[]): Store | null {
        // Simple mock logic: Find first store that has enough stock. 
        // In real app: Geospatial query + Availability check

        for (const store of this.stores) {
            const hasStock = requiredItems.every(item => {
                const stock = store.inventory.get(item.productId) || 0;
                return stock >= item.quantity;
            });

            if (hasStock) {
                return store; // Return the first match for simplicity
            }
        }

        return null;
    }

    public checkStock(storeId: string, productId: string): number {
        const store = this.stores.find(s => s.id === storeId);
        return store?.inventory.get(productId) || 0;
    }

    public decrementStock(storeId: string, productId: string, quantity: number): boolean {
        const store = this.stores.find(s => s.id === storeId);
        if (!store) return false;

        const currentStock = store.inventory.get(productId) || 0;
        if (currentStock < quantity) return false;

        store.inventory.set(productId, currentStock - quantity);
        console.log(`[Inv] Stock decremented for ${productId} at ${storeId}. New level: ${currentStock - quantity}`);
        return true;
    }

    public restoreStock(storeId: string, productId: string, quantity: number) {
        const store = this.stores.find(s => s.id === storeId);
        if (!store) return;

        const currentStock = store.inventory.get(productId) || 0;
        store.inventory.set(productId, currentStock + quantity);
        console.log(`[Inv] Stock restored for ${productId} at ${storeId}. New level: ${currentStock + quantity}`);
    }
}

export const storeService = new StoreService();
