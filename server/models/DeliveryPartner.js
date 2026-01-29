const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, sparse: true, unique: true },
    phone: { type: String, sparse: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'delivery_partner' },
    languages: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
