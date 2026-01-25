"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestoreService_1 = require("../services/firestoreService");
const types_1 = require("../models/types");
const uuid_1 = require("uuid");
exports.createOrder = functions.https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
    }
    const { customerId, storeId, items } = req.body;
    // Payload: items: [{ productId, quantity }]
    try {
        const orderId = (0, uuid_1.v4)();
        const orderRef = firestoreService_1.firestoreService.ordersCol.doc(orderId);
        // Run Transaction: Check Stock -> Decrement -> Create Order
        await firestoreService_1.firestoreService.db.runTransaction(async (t) => {
            var _a, _b;
            let totalAmount = 0;
            for (const item of items) {
                const invRef = firestoreService_1.firestoreService.getStoreInventoryRef(storeId, item.productId);
                const invDoc = await t.get(invRef);
                if (!invDoc.exists)
                    throw new Error(`Product ${item.productId} not found`);
                const currentStock = ((_a = invDoc.data()) === null || _a === void 0 ? void 0 : _a.stockLevel) || 0;
                const price = ((_b = invDoc.data()) === null || _b === void 0 ? void 0 : _b.price) || 0;
                if (currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${item.productId}`);
                }
                // Decrement Stock
                t.update(invRef, { stockLevel: currentStock - item.quantity });
                totalAmount += price * item.quantity;
            }
            // Create Order
            const newOrder = {
                id: orderId,
                customerId,
                storeId,
                items,
                totalAmount,
                orderStatus: types_1.OrderStatus.SELLER_PENDING,
                fulfillmentStatus: types_1.FulfillmentStatus.UNASSIGNED,
                createdAt: admin.firestore.Timestamp.now()
            };
            t.set(orderRef, newOrder);
        });
        res.json({ success: true, orderId });
    }
    catch (error) {
        console.error('Order Creation Failed:', error);
        res.status(500).json({ error: error.message });
    }
});
//# sourceMappingURL=orderController.js.map