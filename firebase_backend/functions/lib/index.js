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
exports.acceptDelivery = exports.onOrderUpdate = exports.onOrderCreated = exports.createOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const orderController_1 = require("./controllers/orderController");
Object.defineProperty(exports, "createOrder", { enumerable: true, get: function () { return orderController_1.createOrder; } });
const firestoreService_1 = require("./services/firestoreService");
const types_1 = require("./models/types");
// --- TRIGGERS ---
// 1. Notify Seller when Order Created
exports.onOrderCreated = functions.firestore
    .document('orders/{orderId}')
    .onCreate(async (snap, context) => {
    const order = snap.data();
    console.log(`[TRIGGER] Order ${context.params.orderId} created. Notify Seller: ${order.storeId}`);
    // Send FCM / Email to Seller Here
});
// 2. Broadcast to Delivery Partners when Seller Accepts
exports.onOrderUpdate = functions.firestore
    .document('orders/{orderId}')
    .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    // Detect Status Change: SELLER_PENDING -> ACTIVE
    if (oldData.orderStatus !== types_1.OrderStatus.ACTIVE && newData.orderStatus === types_1.OrderStatus.ACTIVE) {
        console.log(`[TRIGGER] Order ${context.params.orderId} Accepted by Seller. Broadcasting to Delivery Partners.`);
        await change.after.ref.update({
            fulfillmentStatus: types_1.FulfillmentStatus.ASSIGNING_DELIVERY
        });
        // In real app: Write to 'delivery_offers' collection or send FCM
    }
});
// 3. Delivery Acceptance Logic (HTTP for Locking)
exports.acceptDelivery = functions.https.onRequest(async (req, res) => {
    const { orderId, partnerId } = req.body;
    const orderRef = firestoreService_1.firestoreService.ordersCol.doc(orderId);
    try {
        await firestoreService_1.firestoreService.db.runTransaction(async (t) => {
            const doc = await t.get(orderRef);
            if (!doc.exists)
                throw new Error("Order not found");
            const data = doc.data();
            if (data.fulfillmentStatus !== types_1.FulfillmentStatus.ASSIGNING_DELIVERY) {
                throw new Error("Order already assigned or not ready");
            }
            t.update(orderRef, {
                fulfillmentStatus: types_1.FulfillmentStatus.ON_THE_WAY,
                deliveryPartnerId: partnerId
            });
        });
        res.json({ success: true, message: "Delivery Assigned" });
    }
    catch (e) {
        res.status(409).json({ error: e.message }); // 409 Conflict
    }
});
//# sourceMappingURL=index.js.map