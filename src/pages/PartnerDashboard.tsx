import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { orderService, Order, OrderStatus } from '@/services/OrderService';
import {
  Home,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Star,
  Calendar,
  Truck,
  DollarSign,
  Phone,
  Mail,
  Lock,
  Moon,
  Sun,
  MessageSquare,
  Globe,
  Camera,
  Package,
  History,
  Clock,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'home' | 'orders' | 'history' | 'settings' | 'profile';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Rahul Kumar',
    phone: user?.phone || '+91 98765 12345',
    email: user?.email || 'rahul@example.com',
    languages: user?.languages || ['Hindi', 'English'],
    bio: 'Experienced delivery partner with 2+ years in logistics.',
  });
  const [complaint, setComplaint] = useState('');

  useEffect(() => {
    const unsubscribe = orderService.subscribe(newOrders => {
      setOrders(newOrders);
    });
    return () => unsubscribe();
  }, []);

  const ongoingOrders = orders.filter(o => o.type === 'ongoing');
  const historyOrders = orders.filter(o => o.type === 'history');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = () => {
    setEditMode(false);
    toast.success('Profile updated successfully!');
  };

  const handleSubmitComplaint = () => {
    if (!complaint.trim()) return;
    toast.success('Your complaint has been submitted. We\'ll get back to you soon!');
    setComplaint('');
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    orderService.updateOrderStatus(orderId, status);
    toast.success(`Order status updated to ${status.replace('_', ' ')}`);
  };

  const navItems = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
    { id: 'orders' as Tab, label: 'Orders', icon: Package },
    { id: 'history' as Tab, label: 'History', icon: History },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ];

  // Mock data
  const stats = {
    totalEarnings: 45680,
    thisMonth: 12450,
    daysWorking: 234,
    rating: 4.8,
    totalDeliveries: 1456,
    todayDeliveries: 8,
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-border">
        <Logo size="sm" />
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Logo size="sm" />
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
                <p className="font-medium truncate">{profileData.name}</p>
                <p className="text-xs text-muted-foreground">Delivery Partner</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                activeTab === item.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", activeTab === item.id && "text-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome back, {profileData.name.split(' ')[0]}!</h1>
              <p className="text-muted-foreground text-sm">Here's your delivery performance overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Earnings"
                value={`₹${stats.totalEarnings.toLocaleString()}`}
                change={`+₹${(stats.thisMonth * 0.1).toFixed(0)} today`}
                changeType="positive"
                icon="dollar"
              />
              <StatCard
                title="Deliveries"
                value={stats.totalDeliveries.toString()}
                change={`${stats.todayDeliveries} today`}
                changeType="neutral"
                icon="package"
              />
              <StatCard
                title="Service Rating"
                value={stats.rating.toString()}
                change="Top 5% partner"
                changeType="positive"
                icon="star"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Active Tasks
                </h3>
                {ongoingOrders.length > 0 ? (
                  <div className="space-y-4">
                    {ongoingOrders.slice(0, 2).map(order => (
                      <div key={order.id} className="p-3 rounded-lg bg-secondary/30 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.deliveryAddress.split(',')[0]}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No active tasks. Take a break!</p>
                  </div>
                )}
              </div>

              <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> Recent Activity
                </h3>
                {historyOrders.length > 0 ? (
                  <div className="space-y-4">
                    {historyOrders.slice(0, 2).map(order => (
                      <div key={order.id} className="p-3 rounded-lg bg-secondary/30 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Delivered {order.id}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.timestamp).toLocaleDateString()}</p>
                        </div>
                        <p className="text-sm font-bold text-primary">₹{order.total}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No recent activity found.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">Ongoing Orders</h1>
              <p className="text-muted-foreground">Manage your current deliveries</p>
            </div>

            {ongoingOrders.length === 0 ? (
              <div className="bg-card rounded-xl p-12 border border-border text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No ongoing orders</h3>
                <p className="text-muted-foreground">You don't have any active deliveries at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {ongoingOrders.map(order => (
                  <div key={order.id} className="bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6 border-b border-border bg-secondary/20">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{order.id}</h3>
                            <p className="text-sm text-muted-foreground">{new Date(order.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                            order.status === 'pending' && "bg-yellow-500/10 text-yellow-500",
                            order.status === 'packing' && "bg-blue-500/10 text-blue-500",
                            order.status === 'on_way' && "bg-purple-500/10 text-purple-500",
                            order.status === 'delivered' && "bg-green-500/10 text-green-500"
                          )}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                            <User className="w-3 h-3" /> Customer Details
                          </h4>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Delivery Address
                          </h4>
                          <p className="text-sm">{order.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Truck className="w-3 h-3" /> Order Status Actions
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          <Button
                            variant={order.status === 'packing' ? "default" : "outline"}
                            className="justify-start gap-2 h-11"
                            onClick={() => handleUpdateStatus(order.id, 'packing')}
                          >
                            <Package className="w-4 h-4" /> Order is packing
                          </Button>
                          <Button
                            variant={order.status === 'on_way' ? "default" : "outline"}
                            className="justify-start gap-2 h-11"
                            onClick={() => handleUpdateStatus(order.id, 'on_way')}
                          >
                            <Truck className="w-4 h-4" /> Order is on way
                          </Button>
                          <Button
                            variant={order.status === 'delivered' ? "default" : "outline"}
                            className="justify-start gap-2 h-11 border-green-500/50 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400"
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          >
                            <CheckCircle2 className="w-4 h-4" /> Order is placed
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-secondary/10 border-t border-border flex justify-between items-center">
                      <div className="flex gap-4">
                        <span className="text-sm text-muted-foreground">Items: <span className="text-foreground font-medium">{order.items.length}</span></span>
                      </div>
                      <div className="text-lg font-bold text-primary">₹{order.total}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">Delivery History</h1>
              <p className="text-muted-foreground">Track your completed assignments</p>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Order ID</th>
                      <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Customer</th>
                      <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Date</th>
                      <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Amount</th>
                      <th className="text-left p-4 font-bold text-xs uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-muted-foreground">
                          No history found
                        </td>
                      </tr>
                    ) : (
                      historyOrders.map(order => (
                        <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                          <td className="p-4 font-medium">{order.id}</td>
                          <td className="p-4 text-sm">
                            <p className="font-medium">{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerPhone}</p>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(order.timestamp).toLocaleDateString()}
                          </td>
                          <td className="p-4 font-bold text-primary">₹{order.total}</td>
                          <td className="p-4">
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter",
                              order.status === 'delivered' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            )}>
                              {order.status === 'delivered' ? 'Success' : 'Failed'}
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

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            {/* Account Settings */}
            <div className="bg-card rounded-xl p-6 border border-border space-y-4">
              <h2 className="text-lg font-semibold">Account Settings</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="s-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="s-phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="s-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="s-email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="s-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="s-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button onClick={() => toast.success('Settings saved!')}>Save Changes</Button>
              </div>
            </div>

            {/* Appearance */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Appearance</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </div>

            {/* Support */}
            <div className="bg-card rounded-xl p-6 border border-border space-y-4">
              <h2 className="text-lg font-semibold">Customer Support</h2>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MessageSquare className="w-5 h-5" />
                <span>Have an issue or complaint? Let us know.</span>
              </div>
              <Textarea
                placeholder="Describe your issue..."
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                rows={4}
              />
              <Button onClick={handleSubmitComplaint} disabled={!complaint.trim()}>
                Submit Complaint
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in max-w-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Your Profile</h1>
                <p className="text-muted-foreground">Manage your public information</p>
              </div>
              <Button
                variant={editMode ? 'default' : 'outline'}
                onClick={() => editMode ? handleSaveProfile() : setEditMode(true)}
              >
                {editMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-10 h-10 text-primary" />
                  </div>
                  {editMode && (
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Camera className="w-4 h-4 text-primary-foreground" />
                    </button>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{profileData.name}</h3>
                  <p className="text-muted-foreground">Delivery Partner</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-warning fill-warning" />
                    <span className="font-medium">{stats.rating}</span>
                    <span className="text-muted-foreground text-sm">({stats.totalDeliveries} deliveries)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="p-name">Full Name</Label>
                  <Input
                    id="p-name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    disabled={!editMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="p-bio">Bio</Label>
                  <Textarea
                    id="p-bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!editMode}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Languages Spoken
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {profileData.languages.map(lang => (
                      <span key={lang} className="px-3 py-1 rounded-full bg-secondary text-sm">
                        {lang}
                      </span>
                    ))}
                    {editMode && (
                      <button className="px-3 py-1 rounded-full border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                        + Add
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium mb-3">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      <span>{profileData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{profileData.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PartnerDashboard;
