import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const firestoreService = {
    db,

    // Collections
    ordersCol: db.collection('orders'),
    storesCol: db.collection('stores'),
    usersCol: db.collection('users'),
    reservedStockCol: db.collection('reserved_stock'),

    // Helpers
    getStoreInventoryRef: (storeId: string, productId: string) =>
        db.doc(`stores/${storeId}/inventory/${productId}`)
};
