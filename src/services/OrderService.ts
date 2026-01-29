export type OrderStatus = 'pending' | 'packing' | 'on_way' | 'delivered' | 'failed';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  total: number;
  timestamp: string;
  status: OrderStatus;
  type: 'ongoing' | 'history';
}

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2026-001',
    customerName: 'Aman Sharma',
    customerPhone: '+91 98877 66554',
    deliveryAddress: 'House 42, Sector 15, Gurgaon',
    items: [
      { id: 'i1', name: 'Parker Pen Premium Set', quantity: 1, price: 299 },
      { id: 'i2', name: 'Faber-Castell Notebooks', quantity: 2, price: 154 }
    ],
    total: 607,
    timestamp: '2026-01-29T09:30:00Z',
    status: 'pending',
    type: 'ongoing'
  },
  {
    id: 'ORD-2026-002',
    customerName: 'Priya Verma',
    customerPhone: '+91 99887 76655',
    deliveryAddress: 'Flat 102, Green Apartments, Noida',
    items: [
      { id: 'i3', name: 'Art Supplies Combo', quantity: 1, price: 419 }
    ],
    total: 419,
    timestamp: '2026-01-29T10:00:00Z',
    status: 'packing',
    type: 'ongoing'
  },
  {
    id: 'ORD-2026-003',
    customerName: 'Rohan Gupta',
    customerPhone: '+91 88776 65544',
    deliveryAddress: 'Plot 7, MG Road, Bangalore',
    items: [
      { id: 'i4', name: 'Office Desk Organizer', quantity: 1, price: 450 }
    ],
    total: 450,
    timestamp: '2026-01-28T15:20:00Z',
    status: 'delivered',
    type: 'history'
  }
];

class OrderService {
  private orders: Order[] = [...MOCK_ORDERS];
  private subscribers: ((orders: Order[]) => void)[] = [];

  subscribe(callback: (orders: Order[]) => void) {
    this.subscribers.push(callback);
    callback([...this.orders]);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== callback);
    };
  }

  private notify() {
    this.subscribers.forEach(callback => callback([...this.orders]));
  }

  getOngoingOrders() {
    return this.orders.filter(o => o.type === 'ongoing');
  }

  getOrderHistory() {
    return this.orders.filter(o => o.type === 'history');
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    this.orders = this.orders.map(order => {
      if (order.id === orderId) {
        const newOrder = { ...order, status };
        if (status === 'delivered') {
          newOrder.type = 'history';
        }
        return newOrder;
      }
      return order;
    });
    this.notify();
  }
}

export const orderService = new OrderService();
