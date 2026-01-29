import { useState } from 'react';
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
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type Tab = 'home' | 'settings' | 'profile';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Rahul Kumar',
    phone: user?.phone || '+91 98765 12345',
    email: user?.email || 'rahul@example.com',
    languages: user?.languages || ['Hindi', 'English'],
    bio: 'Experienced delivery partner with 2+ years in logistics.',
  });
  const [complaint, setComplaint] = useState('');

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

  const navItems = [
    { id: 'home' as Tab, label: 'Home', icon: Home },
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
              <h1 className="text-2xl font-bold">Hello, {profileData.name.split(' ')[0]}!</h1>
              <p className="text-muted-foreground">Here's your performance overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                title="Total Earnings"
                value={`₹${stats.totalEarnings.toLocaleString()}`}
                icon="dollar"
              />
              <StatCard
                title="This Month"
                value={`₹${stats.thisMonth.toLocaleString()}`}
                change="+15% from last month"
                changeType="positive"
                icon="trending"
              />
              <StatCard
                title="Days with QuilBox"
                value={stats.daysWorking}
                icon="clock"
              />
              <StatCard
                title="Your Rating"
                value={stats.rating}
                change="Top 10% performers"
                changeType="positive"
                icon="star"
              />
              <StatCard
                title="Total Deliveries"
                value={stats.totalDeliveries.toLocaleString()}
                icon="truck"
              />
              <StatCard
                title="Today's Deliveries"
                value={stats.todayDeliveries}
                change="2 pending"
                changeType="neutral"
                icon="package"
              />
            </div>

            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">Performance Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-5 h-5 text-warning fill-warning" />
                    <span className="text-2xl font-bold">{stats.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Customer Rating</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="text-2xl font-bold">{stats.daysWorking}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Truck className="w-5 h-5 text-success" />
                    <span className="text-2xl font-bold">{stats.totalDeliveries}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Deliveries Completed</p>
                </div>
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
