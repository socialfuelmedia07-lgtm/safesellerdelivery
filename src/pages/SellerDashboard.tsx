import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from '@/hooks/useAuth';
import { InventoryService, InventoryItem } from '@/services/InventoryService';
import { toast } from "sonner";
import {
  LayoutDashboard,
  Package,
  History,
  LogOut,
  Menu,
  X,
  ChevronRight,
  MapPin,
  Clock,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'dashboard' | 'inventory' | 'history';

interface OrderHistory {
  id: string;
  date: string;
  items: string[];
  total: number;
  deliveryPartner: string;
  status: 'delivered' | 'in_transit' | 'pending';
  from: string;
  to: string;
  duration: number;
}

const mockOrders: OrderHistory[] = [
  {
    id: 'ORD-001',
    date: '2026-01-25',
    items: ['Parker Pen Set', 'Faber-Castell Notebooks x2'],
    total: 586,
    deliveryPartner: 'Rahul Kumar',
    status: 'delivered',
    from: 'Warehouse A, Connaught Place',
    to: 'Block B, Vasant Kunj',
    duration: 32,
  },
  {
    id: 'ORD-002',
    date: '2026-01-24',
    items: ['Art Supplies Kit', 'Premium Sketch Book'],
    total: 892,
    deliveryPartner: 'Amit Singh',
    status: 'delivered',
    from: 'Warehouse A, Connaught Place',
    to: 'Sector 18, Noida',
    duration: 45,
  },
  {
    id: 'ORD-003',
    date: '2026-01-24',
    items: ['Office Desk Organizer'],
    total: 450,
    deliveryPartner: 'Vijay Patel',
    status: 'in_transit',
    from: 'Warehouse B, Nehru Place',
    to: 'DLF Phase 3, Gurgaon',
    duration: 0,
  },
];

const mockInventory = [
  { id: '1', name: 'Parker Pen Premium Set', stock: 45, sold: 120, price: 299 },
  { id: '2', name: 'Faber-Castell Notebooks', stock: 230, sold: 456, price: 154 },
  { id: '3', name: 'Art Supplies Combo', stock: 18, sold: 67, price: 419 },
  { id: '4', name: 'Office Desk Organizer', stock: 34, sold: 89, price: 450 },
  { id: '5', name: 'Premium Sketch Book', stock: 156, sold: 234, price: 189 },
];

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Product State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

  useEffect(() => {
    if (user?.id && activeTab === 'inventory') {
      setIsLoading(true);
      const unsubscribe = InventoryService.subscribeToInventory(user.id, (items) => {
        setInventory(items);
        setIsLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user?.id, activeTab]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      await InventoryService.addProduct(user.id, {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        stockLevel: parseInt(newProduct.stock),
        sold: 0
      });
      setIsAddProductOpen(false);
      setNewProduct({ name: '', price: '', stock: '' });
      toast.success("Product added successfully!");
    } catch (error) {
      toast.error("Failed to add product");
      console.error(error);
    }
  };

  const handleUpdateStock = async (productId: string, currentStock: number) => {
    if (!user?.id) return;
    const newStock = window.prompt("Enter new stock level:", currentStock.toString());
    if (newStock !== null) {
      try {
        await InventoryService.updateStock(user.id, productId, parseInt(newStock));
        toast.success("Stock updated!");
      } catch (error) {
        toast.error("Failed to update stock");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory' as Tab, label: 'Inventory', icon: Package },
    { id: 'history' as Tab, label: 'Order History', icon: History },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border">
        <Logo size="sm" />
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Logo size="sm" />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={cn(
                  "nav-item w-full",
                  activeTab === item.id ? "nav-item-active" : "nav-item-inactive"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
              <p className="text-muted-foreground">Here's your store overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="This Week"
                value="₹12,450"
                change="+12% from last week"
                changeType="positive"
                icon="trending"
              />
              <StatCard
                title="This Month"
                value="₹48,920"
                change="+8% from last month"
                changeType="positive"
                icon="dollar"
              />
              <StatCard
                title="This Year"
                value="₹2,45,600"
                change="+23% from last year"
                changeType="positive"
                icon="trending"
              />
              <StatCard
                title="Total Orders"
                value="1,234"
                change="56 pending"
                changeType="neutral"
                icon="package"
              />
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
              <div className="space-y-3">
                {mockOrders.slice(0, 3).map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.items[0]}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">₹{order.total}</p>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        order.status === 'delivered' && "bg-success/10 text-success",
                        order.status === 'in_transit' && "bg-warning/10 text-warning",
                        order.status === 'pending' && "bg-muted text-muted-foreground"
                      )}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Inventory</h1>
                <p className="text-muted-foreground">Manage your products</p>
              </div>

              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button>Add Product</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock">Initial Stock</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={newProduct.stock}
                          onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save Product</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Sold</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          {isLoading ? "Loading inventory..." : "No products found. Add your first product!"}
                        </td>
                      </tr>
                    ) : (
                      inventory.map(item => (
                        <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="p-4 font-medium">{item.name}</td>
                          <td className="p-4 text-primary font-semibold">₹{item.price}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {item.stockLevel}
                              <button
                                onClick={() => handleUpdateStock(item.id, item.stockLevel)}
                                className="text-xs text-primary hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                          <td className="p-4">{item.sold || 0}</td>
                          <td className="p-4">
                            <span className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              item.stockLevel > 50 ? "bg-success/10 text-success" :
                                item.stockLevel > 20 ? "bg-warning/10 text-warning" :
                                  "bg-destructive/10 text-destructive"
                            )}>
                              {item.stockLevel > 50 ? 'In Stock' : item.stockLevel > 20 ? 'Low Stock' : 'Critical'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">Order History</h1>
              <p className="text-muted-foreground">Track your past deliveries</p>
            </div>

            <div className="space-y-4">
              {mockOrders.map(order => (
                <div key={order.id} className="bg-card rounded-xl p-4 border border-border hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{order.id}</span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          order.status === 'delivered' && "bg-success/10 text-success",
                          order.status === 'in_transit' && "bg-warning/10 text-warning",
                          order.status === 'pending' && "bg-muted text-muted-foreground"
                        )}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                    </div>
                    <p className="text-xl font-bold text-primary">₹{order.total}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">{order.items.join(', ')}</p>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Delivered by: <span className="text-foreground">{order.deliveryPartner}</span></span>
                    </div>

                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-foreground">{order.from}</span>
                          <ChevronRight className="w-4 h-4" />
                          <span className="text-foreground">{order.to}</span>
                        </div>
                      </div>
                    </div>

                    {order.duration > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Delivery time: <span className="text-foreground">{order.duration} minutes</span></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SellerDashboard;
