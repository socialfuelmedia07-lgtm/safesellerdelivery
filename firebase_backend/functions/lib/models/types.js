"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FulfillmentStatus = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["SELLER_PENDING"] = "SELLER_PENDING";
    OrderStatus["ACTIVE"] = "ACTIVE";
    OrderStatus["CANCELLED"] = "CANCELLED";
    OrderStatus["COMPLETED"] = "COMPLETED";
})(OrderStatus = exports.OrderStatus || (exports.OrderStatus = {}));
var FulfillmentStatus;
(function (FulfillmentStatus) {
    FulfillmentStatus["UNASSIGNED"] = "UNASSIGNED";
    FulfillmentStatus["ASSIGNING_DELIVERY"] = "ASSIGNING_DELIVERY";
    FulfillmentStatus["ON_THE_WAY"] = "ON_THE_WAY";
    FulfillmentStatus["DELIVERED"] = "DELIVERED";
})(FulfillmentStatus = exports.FulfillmentStatus || (exports.FulfillmentStatus = {}));
//# sourceMappingURL=types.js.map