
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, 
  CreditCard, 
  DollarSign, 
  FileText, 
  LayoutDashboard, 
  TrendingUp, 
  Users,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronRight,
  UserPlus,
  Trash2,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking, useAuth, initiateSignOut } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type TabType = 'overview' | 'invoices' | 'expenses' | 'staff' | 'settings';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Dialog States
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // New Data State
  const [newInvoice, setNewInvoice] = useState({ customerName: '', amount: '', status: 'Pending', method: 'Credit Card' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'General' });
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('cashier');

  // Fetch user profile
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  const orgId = profile?.organizationId;

  // Fetch organization membership
  const memberRef = useMemoFirebase(() => {
    if (!user || !orgId) return null;
    return doc(db, 'organizations', orgId, 'members', user.uid);
  }, [db, user, orgId]);

  const { data: membership, isLoading: isMembershipLoading } = useDoc(memberRef);
  const userRole = membership?.role || 'cashier';

  // Fetch Organization details
  const orgRef = useMemoFirebase(() => {
    if (!orgId) return null;
    return doc(db, 'organizations', orgId);
  }, [db, orgId]);
  const { data: organization } = useDoc(orgRef);

  // Permissions logic
  const canManageStaff = userRole === 'admin';
  const canViewProfit = userRole === 'admin';
  const canCreateInvoice = ['admin', 'manager', 'cashier'].includes(userRole);
  const canManageExpenses = ['admin', 'manager'].includes(userRole);

  // Initialization logic for new users (Google or Email)
  useEffect(() => {
    if (!isUserLoading && user && !isProfileLoading && !profile && !isInitializing) {
      setIsInitializing(true);
      const generatedOrgId = `org_${user.uid}`;
      const orgRef = doc(db, 'organizations', generatedOrgId);
      const userRef = doc(db, 'users', user.uid);
      const memberRef = doc(db, 'organizations', generatedOrgId, 'members', user.uid);

      // We perform these in a specific order to help security rules
      const init = async () => {
        try {
          setDocumentNonBlocking(orgRef, {
            id: generatedOrgId,
            name: `${user.email?.split('@')[0]}'s Organization`,
            ownerId: user.uid,
            createdAt: new Date().toISOString()
          }, { merge: true });

          setDocumentNonBlocking(userRef, {
            id: user.uid,
            email: user.email,
            firstName: user.displayName?.split(' ')[0] || 'New',
            lastName: user.displayName?.split(' ')[1] || 'User',
            organizationId: generatedOrgId,
            createdAt: new Date().toISOString()
          }, { merge: true });

          setDocumentNonBlocking(memberRef, {
            id: user.uid,
            userId: user.uid,
            organizationId: generatedOrgId,
            role: 'admin',
            email: user.email
          }, { merge: true });
        } catch (e) {
          console.error("Initialization failed", e);
        } finally {
          setTimeout(() => setIsInitializing(false), 1000);
        }
      };

      init();
    }
  }, [isUserLoading, user, isProfileLoading, profile, isInitializing, db]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Data fetching - gated by initialization and existence of profile
  const invoicesQuery = useMemoFirebase(() => {
    if (!orgId || isMembershipLoading || !membership || isInitializing) return null;
    return query(collection(db, 'organizations', orgId, 'invoices'), orderBy('createdAt', 'desc'));
  }, [db, orgId, isMembershipLoading, membership, isInitializing]);

  const { data: invoices, isLoading: isInvoicesLoading } = useCollection(invoicesQuery);

  const expensesQuery = useMemoFirebase(() => {
    if (!orgId || isMembershipLoading || !membership || isInitializing) return null;
    return query(collection(db, 'organizations', orgId, 'expenses'), orderBy('createdAt', 'desc'));
  }, [db, orgId, isMembershipLoading, membership, isInitializing]);

  const { data: expenses, isLoading: isExpensesLoading } = useCollection(expensesQuery);

  const membersQuery = useMemoFirebase(() => {
    if (!orgId || isMembershipLoading || !membership || isInitializing) return null;
    return collection(db, 'organizations', orgId, 'members');
  }, [db, orgId, isMembershipLoading, membership, isInitializing]);

  const { data: members, isLoading: isMembersLoading } = useCollection(membersQuery);

  // Statistics
  const revenue = invoices?.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0) || 0;
  const activeInvoicesCount = invoices?.filter(i => i.status !== 'Paid').length || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
  const netProfit = revenue - totalExpenses;

  const handleLogout = () => {
    initiateSignOut(auth).then(() => {
      router.push('/login');
    });
  };

  const handleCreateInvoice = () => {
    if (!orgId || !newInvoice.customerName || !newInvoice.amount) return;
    const invoicesRef = collection(db, 'organizations', orgId, 'invoices');
    addDocumentNonBlocking(invoicesRef, {
      ...newInvoice,
      amount: parseFloat(newInvoice.amount),
      createdAt: new Date().toISOString()
    });
    setIsInvoiceDialogOpen(false);
    setNewInvoice({ customerName: '', amount: '', status: 'Pending', method: 'Credit Card' });
    toast({ title: "Invoice Created", description: `Invoice for ${newInvoice.customerName} added.` });
  };

  const handleCreateExpense = () => {
    if (!orgId || !newExpense.description || !newExpense.amount) return;
    const expensesRef = collection(db, 'organizations', orgId, 'expenses');
    addDocumentNonBlocking(expensesRef, {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      createdAt: new Date().toISOString()
    });
    setIsExpenseDialogOpen(false);
    setNewExpense({ description: '', amount: '', category: 'General' });
    toast({ title: "Expense Tracked", description: `Added expense for ${newExpense.description}.` });
  };

  const handleUpdateOrgName = (newName: string) => {
    if (!orgId || !newName) return;
    updateDocumentNonBlocking(doc(db, 'organizations', orgId), { name: newName });
    toast({ title: "Organization Updated", description: "Business name saved successfully." });
  };

  const handleInviteStaff = () => {
    if (!newStaffEmail) return;
    toast({ title: "Invite Sent", description: `Invitation sent to ${newStaffEmail} as ${newStaffRole}.` });
    setNewStaffEmail('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isUserLoading || !user || (isProfileLoading && !profile) || isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            {isInitializing ? "Setting up your organization..." : "Loading dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-accent/20 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1 rounded-md">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-primary">LedgerStream</span>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={FileText} label="Invoices" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
          {canManageExpenses && <NavItem icon={CreditCard} label="Expenses" active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />}
          {canManageStaff && <NavItem icon={Users} label="Staff Management" active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />}
          <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        <div className="p-4 border-t">
          <div className="bg-primary/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Access Level</p>
            </div>
            <div className="flex items-center gap-2">
                <Badge variant="secondary" className="capitalize">{userRole}</Badge>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-background flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1 max-w-md text-sm text-muted-foreground font-medium">
             {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 ml-2 border-l pl-4">
              <div className="flex flex-col items-end hidden sm:flex">
                 <span className="text-xs font-bold">{profile?.firstName} {profile?.lastName}</span>
                 <span className="text-[10px] text-muted-foreground capitalize">{userRole}</span>
              </div>
              <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
                <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                    <p className="text-sm text-muted-foreground">Welcome back, {profile?.firstName || 'User'}. Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                  {canManageExpenses && (
                    <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <CreditCard className="h-4 w-4" /> Add Expense
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Track Expense</DialogTitle>
                          <DialogDescription>Record a new business expense.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input placeholder="Office supplies..." value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Amount ($)</label>
                              <Input type="number" placeholder="0.00" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Category</label>
                              <Select value={newExpense.category} onValueChange={val => setNewExpense({...newExpense, category: val})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Software">Software</SelectItem>
                                  <SelectItem value="Marketing">Marketing</SelectItem>
                                  <SelectItem value="Rent">Rent</SelectItem>
                                  <SelectItem value="Travel">Travel</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateExpense} disabled={!newExpense.description || !newExpense.amount}>Record Expense</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  {canCreateInvoice && (
                    <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" /> New Invoice
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>New Invoice</DialogTitle>
                          <DialogDescription>Create a professional invoice for your customer.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Customer Name</label>
                            <Input placeholder="Acme Corp" value={newInvoice.customerName} onChange={e => setNewInvoice({...newInvoice, customerName: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Amount ($)</label>
                              <Input type="number" placeholder="0.00" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Status</label>
                              <Select value={newInvoice.status} onValueChange={val => setNewInvoice({...newInvoice, status: val})}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Paid">Paid</SelectItem>
                                  <SelectItem value="Pending">Pending</SelectItem>
                                  <SelectItem value="Unpaid">Unpaid</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleCreateInvoice} disabled={!newInvoice.customerName || !newInvoice.amount}>Create Invoice</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="Total Revenue" value={formatCurrency(revenue)} change="Lifetime paid" trend="up" icon={DollarSign} isLoading={isInvoicesLoading} />
                <SummaryCard title="Active Invoices" value={activeInvoicesCount.toString()} change="Pending items" trend="up" icon={FileText} isLoading={isInvoicesLoading} />
                {canManageExpenses && <SummaryCard title="Expenses" value={formatCurrency(totalExpenses)} change="Total tracked" trend="down" icon={CreditCard} isLoading={isExpensesLoading} />}
                {canViewProfit && <SummaryCard title="Net Profit" value={formatCurrency(netProfit)} change="Revenue - Expenses" trend={netProfit >= 0 ? "up" : "down"} icon={TrendingUp} isLoading={isInvoicesLoading || isExpensesLoading} />}
              </div>

              <div className="grid lg:grid-cols-7 gap-6">
                <Card className="lg:col-span-4 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Business Performance</CardTitle>
                        <CardDescription>Activity trends based on current records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full bg-accent/20 rounded-lg flex items-end justify-between px-6 pb-2 gap-2 overflow-hidden">
                            {[40, 65, 45, 80, 55, 90, 75, 85, 60, 95, 80, 100].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <div className="w-full bg-primary/40 rounded-t-sm animate-in slide-in-from-bottom duration-1000" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}></div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="space-y-1">
                            {(!invoices?.length && !expenses?.length) ? (
                              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <FileText className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No recent activity found.</p>
                              </div>
                            ) : (
                              <div className="max-h-[300px] overflow-y-auto px-6 space-y-4">
                                {[...(invoices || []), ...(expenses || [])]
                                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                  .slice(0, 10)
                                  .map((item) => (
                                    <ActivityItem 
                                        key={item.id}
                                        name={('customerName' in item ? item.customerName : item.description) || 'Transaction'} 
                                        desc={'status' in item ? `Invoice ${item.status}` : item.category} 
                                        amount={formatCurrency(item.amount)} 
                                        time={item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Now'}
                                        isExpense={!('status' in item)}
                                    />
                                  ))}
                              </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* TAB: INVOICES */}
          {activeTab === 'invoices' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Invoice Management</h1>
                    <p className="text-sm text-muted-foreground">Detailed history of all client billings.</p>
                  </div>
                  {canCreateInvoice && (
                    <Button className="gap-2" onClick={() => setIsInvoiceDialogOpen(true)}>
                      <Plus className="h-4 w-4" /> New Invoice
                    </Button>
                  )}
               </div>

               <Card className="border-none shadow-sm">
                 <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Method</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices?.map(inv => (
                          <TableRow key={inv.id}>
                            <TableCell className="font-medium">{inv.customerName}</TableCell>
                            <TableCell className="text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="font-bold">{formatCurrency(inv.amount)}</TableCell>
                            <TableCell>
                              <Badge variant={inv.status === 'Paid' ? 'secondary' : (inv.status === 'Pending' ? 'outline' : 'destructive')}>
                                {inv.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{inv.method}</TableCell>
                          </TableRow>
                        ))}
                        {!invoices?.length && (
                          <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No invoices found.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                 </CardContent>
               </Card>
            </div>
          )}

          {/* TAB: EXPENSES */}
          {activeTab === 'expenses' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Expense Tracking</h1>
                    <p className="text-sm text-muted-foreground">Manage your organization's operational costs.</p>
                  </div>
                  {canManageExpenses && (
                    <Button className="gap-2" variant="outline" onClick={() => setIsExpenseDialogOpen(true)}>
                      <CreditCard className="h-4 w-4" /> Add Expense
                    </Button>
                  )}
               </div>

               <Card className="border-none shadow-sm">
                 <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {expenses?.map(exp => (
                          <TableRow key={exp.id}>
                            <TableCell className="font-medium">{exp.description}</TableCell>
                            <TableCell className="text-muted-foreground">{new Date(exp.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell><Badge variant="outline">{exp.category}</Badge></TableCell>
                            <TableCell className="text-right font-bold text-destructive">-{formatCurrency(exp.amount)}</TableCell>
                          </TableRow>
                        ))}
                        {!expenses?.length && (
                          <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No expenses recorded yet.</TableCell></TableRow>
                        )}
                      </TableBody>
                    </Table>
                 </CardContent>
               </Card>
            </div>
          )}

          {/* TAB: STAFF */}
          {activeTab === 'staff' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
                    <p className="text-sm text-muted-foreground">Control access and roles for your team members.</p>
                  </div>
               </div>

               <div className="grid lg:grid-cols-3 gap-6">
                 <Card className="lg:col-span-1 border-none shadow-sm">
                   <CardHeader>
                     <CardTitle className="text-lg">Invite Member</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Email Address</label>
                        <Input placeholder="colleague@example.com" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-muted-foreground uppercase">Role</label>
                        <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full gap-2" onClick={handleInviteStaff} disabled={!newStaffEmail}>
                        <UserPlus className="h-4 w-4" /> Send Invitation
                      </Button>
                   </CardContent>
                 </Card>

                 <Card className="lg:col-span-2 border-none shadow-sm">
                   <CardHeader>
                     <CardTitle className="text-lg">Team Roster</CardTitle>
                   </CardHeader>
                   <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {members?.map(m => (
                            <TableRow key={m.id}>
                              <TableCell className="font-medium">{m.email}</TableCell>
                              <TableCell className="capitalize">{m.role}</TableCell>
                              <TableCell><Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">Active</Badge></TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" disabled={m.userId === user.uid}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   </CardContent>
                 </Card>
               </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
               <div className="space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
                  <p className="text-sm text-muted-foreground">Manage your profile and business preferences.</p>
               </div>

               <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                       <Building className="h-5 w-5 text-primary" /> Business Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Organization Name</label>
                       <div className="flex gap-2">
                         <Input defaultValue={organization?.name} id="org-name-input" />
                         <Button onClick={() => handleUpdateOrgName((document.getElementById('org-name-input') as HTMLInputElement).value)}>Save</Button>
                       </div>
                    </div>
                    <div className="pt-4 border-t space-y-4">
                       <h3 className="text-sm font-bold">Personal Profile</h3>
                       <div className="flex items-center gap-4 p-4 bg-accent/30 rounded-lg">
                          <Avatar className="h-12 w-12">
                             <AvatarImage src={user.photoURL || ''} />
                             <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                             <p className="font-bold">{profile?.firstName} {profile?.lastName}</p>
                             <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                       </div>
                    </div>
                  </CardContent>
               </Card>

               <Card className="border-none shadow-sm border-destructive/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Actions here cannot be undone.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <Button variant="destructive" className="gap-2">
                        Deactivate Organization
                     </Button>
                  </CardContent>
               </Card>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <div 
          onClick={onClick}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-primary'}`}>
            <Icon className="h-4 w-4" />
            {label}
        </div>
    );
}

function SummaryCard({ title, value, change, trend, icon: Icon, isLoading }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: any, isLoading?: boolean }) {
    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                  <div className="h-8 w-24 bg-accent animate-pulse rounded"></div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{value}</div>
                    <div className={`text-xs mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-secondary font-semibold' : 'text-muted-foreground'}`}>
                        {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {change}
                    </div>
                  </>
                )}
            </CardContent>
        </Card>
    );
}

function ActivityItem({ name, desc, amount, time, isExpense }: { name: string, desc: string, amount: string, time: string, isExpense?: boolean }) {
    return (
        <div className="flex items-center justify-between group py-2 border-b last:border-0">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${isExpense ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
                    {isExpense ? <CreditCard className="h-4 w-4 text-destructive" /> : <FileText className="h-4 w-4 text-primary" />}
                </div>
                <div>
                    <p className="text-sm font-bold leading-none">{name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-bold ${isExpense ? 'text-destructive' : 'text-primary'}`}>{isExpense ? `-${amount}` : amount}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{time}</p>
            </div>
        </div>
    );
}
