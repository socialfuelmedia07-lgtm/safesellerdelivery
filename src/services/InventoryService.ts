import {
    collection,
    doc,
    onSnapshot,
    setDoc,
    updateDoc,
    query,
    addDoc,
    getDocs
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface InventoryItem {
    id: string;
    name: string;
    price: number;
    stockLevel: number;
    sold: number;
}

export class InventoryService {
    /**
     * Listen to inventory changes for a specific store/seller
     */
    static subscribeToInventory(storeId: string, callback: (items: InventoryItem[]) => void) {
        const invRef = collection(db, "stores", storeId, "inventory");

        return onSnapshot(invRef, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as InventoryItem[];
            callback(items);
        });
    }

    /**
     * Add a new product to the store
     */
    static async addProduct(storeId: string, product: Omit<InventoryItem, 'id'>) {
        const invRef = collection(db, "stores", storeId, "inventory");
        await addDoc(invRef, product);
    }

    /**
     * Update stock level for a product
     */
    static async updateStock(storeId: string, productId: string, newStock: number) {
        const itemRef = doc(db, "stores", storeId, "inventory", productId);
        await updateDoc(itemRef, { stockLevel: newStock });
    }
}
