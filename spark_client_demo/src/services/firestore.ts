import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, runTransaction, onSnapshot, Unsubscribe } from "firebase/firestore";

// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "API_KEY_MOCK", // Not needed for emulation/admin-demo but needed for real web app
    projectId: "quilbox-salesandshipping"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helpers
export const getStoreInventoryRef = (storeId: string, productId: string) =>
    doc(db, "stores", storeId, "inventory", productId);

export const getOrderRef = (orderId: string) =>
    doc(db, "orders", orderId);
