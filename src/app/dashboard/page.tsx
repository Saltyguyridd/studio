
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
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
  LogOut,
  CheckCircle,
  Trash2,
  Building,
  Briefcase,
  Calendar as CalendarIcon,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
import { 
  useUser, 
  useFirestore, 
  useDoc, 
  useCollection, 
  useMemoFirebase, 
  setDocumentNonBlocking, 
  addDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking,
  useAuth, 
  initiateSignOut 
} from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

type TabType = 'overview' | 'invoices' | 'expenses' | 'staff' | 'settings';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isInitializing, setIsInitializing] = useState(false);
  
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const [newInvoice, setNewInvoice] = useState({ customerName: '', amount: '', status: 'Pending', method: 'Credit Card' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', category: 'General' });

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);
  const orgId = profile?.organizationId;

  const memberRef = useMemoFirebase(() => {
    if (!user || !orgId) return null;
    return doc(db, 'organizations', orgId, 'members', user.uid);
  }, [db, user, orgId]);

  const { data: membership, isLoading: isMembershipLoading } = useDoc(memberRef);
  const userRole = membership?.role || 'cashier';

  const orgRef = useMemoFirebase(() => {
    if (!orgId) return null;
    return doc(db, 'organizations', orgId);
  }, [db, orgId]);
  const { data: organization } = useDoc(orgRef);

  const canManageStaff = userRole === 'admin';
  const canViewProfit = userRole === 'admin' || userRole === 'manager';
  const canCreateInvoice = ['admin', 'manager', 'cashier'].includes(userRole);
  const canManageExpenses = ['admin', 'manager'].includes(userRole);

  useEffect(() => {
    if (!isUserLoading && user && !isProfileLoading && !profile && !isInitializing) {
      setIsInitializing(true);
      const generatedOrgId = `org_${user.uid}`;
      const orgRef = doc(db, 'organizations', generatedOrgId);
      const userRef = doc(db, 'users', user.uid);
      const memberRef = doc(db, 'organizations', generatedOrgId, 'members', user.uid);

      const init = async () => {
        try {
          setDocumentNonBlocking(orgRef, {
            id: generatedOrgId,
            name: `${user.email?.split('@')[0]}'s Business`,
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
          setTimeout(() => setIsInitializing(false), 1500);
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

  const stats = useMemo(() => {
    const revenue = invoices?.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0) || 0;
    const pending = invoices?.filter(i => i.status !== 'Paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0) || 0;
    const totalExpenses = expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
    return { revenue, pending, totalExpenses, profit: revenue - totalExpenses };
  }, [invoices, expenses]);

  const chartData = useMemo(() => {
    if (!invoices) return [];
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleString('default', { month: 'short' });
    }).reverse();

    return last6Months.map(month => {
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.createdAt);
        return invDate.toLocaleString('default', { month: 'short' }) === month && inv.status === 'Paid';
      });
      const monthExpenses = (expenses || []).filter(exp => {
        const expDate = new Date(exp.createdAt);
        return expDate.toLocaleString('default', { month: 'short' }) === month;
      });

      return {
        name: month,
        Revenue: monthInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        Expenses: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      };
    });
  }, [invoices, expenses]);

  const handleLogout = () => {
    initiateSignOut(auth).then(() => router.push('/login'));
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
    toast({ title: "Invoice Created" });
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
    toast({ title: "Expense Added" });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isUserLoading || !user || isProfileLoading || isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Preparing your financial workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-accent/5 overflow-hidden">
      <aside className="w-64 border-r bg-card hidden lg:flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">LedgerStream</span>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={FileText} label="Invoices" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
          {canManageExpenses && <NavItem icon={CreditCard} label="Expenses" active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />}
          {canManageStaff && <NavItem icon={Users} label="Team" active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />}
          <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-accent/30 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold truncate">{profile?.firstName} {profile?.lastName}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{userRole}</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-card flex items-center justify-between px-6 z-10">
          <h2 className="text-lg font-semibold capitalize">{activeTab}</h2>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex flex-col items-end mr-2">
               <span className="text-xs font-bold text-primary">{organization?.name}</span>
               <span className="text-[10px] text-muted-foreground">ID: {orgId?.slice(0, 8)}...</span>
             </div>
             <Button variant="outline" size="icon" className="relative h-9 w-9">
               <Bell className="h-4 w-4" />
               <span className="absolute top-0 right-0 h-2 w-2 bg-destructive rounded-full border-2 border-background"></span>
             </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard title="Total Revenue" value={formatCurrency(stats.revenue)} sub={`+${formatCurrency(stats.pending)} pending`} trend="up" icon={DollarSign} />
                <SummaryCard title="Total Expenses" value={formatCurrency(stats.totalExpenses)} sub="Life-to-date" trend="down" icon={CreditCard} />
                <SummaryCard title="Net Profit" value={formatCurrency(stats.profit)} sub="Revenue - Expenses" trend={stats.profit >= 0 ? 'up' : 'down'} icon={TrendingUp} />
                <SummaryCard title="Active Invoices" value={(invoices?.filter(i => i.status !== 'Paid').length || 0).toString()} sub="Requiring action" trend="up" icon={FileText} />
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                       <Briefcase className="h-4 w-4 text-primary" /> Monthly Growth
                    </CardTitle>
                    <CardDescription>Revenue vs Expenses for the last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <RechartsTooltip 
                          cursor={{fill: 'hsl(var(--accent))', opacity: 0.1}} 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        />
                        <Bar dataKey="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="Expenses" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm h-full">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
                    <CardDescription>Common business tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {canCreateInvoice && (
                      <Button className="w-full justify-start gap-2 h-11" onClick={() => setIsInvoiceDialogOpen(true)}>
                        <Plus className="h-4 w-4" /> Create New Invoice
                      </Button>
                    )}
                    {canManageExpenses && (
                      <Button variant="outline" className="w-full justify-start gap-2 h-11" onClick={() => setIsExpenseDialogOpen(true)}>
                        <CreditCard className="h-4 w-4" /> Record Expense
                      </Button>
                    )}
                    <Button variant="ghost" className="w-full justify-start gap-2 h-11" onClick={() => setActiveTab('invoices')}>
                      <FileText className="h-4 w-4" /> View All History
                    </Button>
                  </CardContent>
                  <CardFooter className="pt-0 border-t mt-4">
                    <div className="pt-4 w-full">
                       <div className="flex items-center justify-between text-xs mb-2">
                         <span className="text-muted-foreground font-medium">Monthly Goal</span>
                         <span className="font-bold">75%</span>
                       </div>
                       <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                         <div className="h-full bg-primary w-3/4"></div>
                       </div>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2"><Filter className="h-4 w-4" /> Filter</Button>
                  </div>
                  {canCreateInvoice && (
                    <Button onClick={() => setIsInvoiceDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" /> New Invoice
                    </Button>
                  )}
               </div>
               <Card className="border-none shadow-sm overflow-hidden">
                 <Table>
                   <TableHeader>
                     <TableRow className="bg-accent/10">
                       <TableHead>Customer</TableHead>
                       <TableHead>Date</TableHead>
                       <TableHead>Status</TableHead>
                       <TableHead className="text-right">Amount</TableHead>
                       <TableHead className="text-right">Actions</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                     {invoices?.map(inv => (
                       <TableRow key={inv.id}>
                         <TableCell className="font-medium">{inv.customerName}</TableCell>
                         <TableCell className="text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                         <TableCell>
                           <Badge variant={inv.status === 'Paid' ? 'secondary' : (inv.status === 'Pending' ? 'outline' : 'destructive')}>
                             {inv.status}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-right font-bold">{formatCurrency(inv.amount)}</TableCell>
                         <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                             {inv.status !== 'Paid' && (
                               <Button variant="ghost" size="sm" onClick={() => updateDocumentNonBlocking(doc(db, 'organizations', orgId!, 'invoices', inv.id), { status: 'Paid' })}>
                                 <CheckCircle className="h-4 w-4" />
                               </Button>
                             )}
                             <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => deleteDocumentNonBlocking(doc(db, 'organizations', orgId!, 'invoices', inv.id))}>
                               <Trash2 className="h-4 w-4" />
                             </Button>
                           </div>
                         </TableCell>
                       </TableRow>
                     ))}
                     {!invoices?.length && (
                       <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No invoices found. Create your first one to get started.</TableCell></TableRow>
                     )}
                   </TableBody>
                 </Table>
               </Card>
            </div>
          )}

          {activeTab === 'expenses' && (
             <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <Badge variant="outline" className="px-3 py-1 cursor-pointer">All Categories</Badge>
                      <Badge variant="ghost" className="px-3 py-1 cursor-pointer">Fixed</Badge>
                      <Badge variant="ghost" className="px-3 py-1 cursor-pointer">Variable</Badge>
                   </div>
                   {canManageExpenses && (
                      <Button onClick={() => setIsExpenseDialogOpen(true)} variant="outline" className="gap-2">
                        <CreditCard className="h-4 w-4" /> Add Expense
                      </Button>
                   )}
                </div>
                <Card className="border-none shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-accent/10">
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses?.map(exp => (
                        <TableRow key={exp.id}>
                          <TableCell className="font-medium">{exp.description}</TableCell>
                          <TableCell><Badge variant="secondary" className="capitalize">{exp.category}</Badge></TableCell>
                          <TableCell className="text-muted-foreground">{new Date(exp.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right font-bold text-destructive">-{formatCurrency(exp.amount)}</TableCell>
                          <TableCell className="text-right">
                             <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => deleteDocumentNonBlocking(doc(db, 'organizations', orgId!, 'expenses', exp.id))}>
                               <Trash2 className="h-4 w-4" />
                             </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!expenses?.length && (
                        <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">No expenses recorded yet.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Card>
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Business Information</CardTitle>
                  <CardDescription>Manage how your company appears on invoices and reports.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Business Name</label>
                    <div className="flex gap-2">
                      <Input defaultValue={organization?.name} id="org-name-field" />
                      <Button onClick={() => {
                        const val = (document.getElementById('org-name-field') as HTMLInputElement).value;
                        if (orgId) updateDocumentNonBlocking(doc(db, 'organizations', orgId), { name: val });
                        toast({ title: "Business Updated", description: "Your changes have been saved." });
                      }}>Update</Button>
                    </div>
                  </div>
                  <div className="pt-4 border-t space-y-4">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Contact Person</label>
                    <div className="flex items-center gap-4 bg-accent/20 p-4 rounded-xl">
                       <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                         <AvatarImage src={user.photoURL || ''} />
                         <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                       </Avatar>
                       <div className="flex flex-col">
                         <span className="font-bold">{profile?.firstName} {profile?.lastName}</span>
                         <span className="text-xs text-muted-foreground">{user.email}</span>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm border-destructive/20 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-lg text-destructive">Account Termination</CardTitle>
                  <CardDescription>Permanently remove your organization and all financial data.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" size="sm">Deactivate LedgerStream Instance</Button>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>

      {/* MODALS */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Invoice</DialogTitle>
            <DialogDescription>Enter the customer and amount details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer Name</label>
              <Input placeholder="Client name..." value={newInvoice.customerName} onChange={e => setNewInvoice({...newInvoice, customerName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount ($)</label>
                <Input type="number" placeholder="0.00" value={newInvoice.amount} onChange={e => setNewInvoice({...newInvoice, amount: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Status</label>
                <Select value={newInvoice.status} onValueChange={val => setNewInvoice({...newInvoice, status: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsInvoiceDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateInvoice} disabled={!newInvoice.customerName || !newInvoice.amount}>Generate Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
            <DialogDescription>Track business spending for tax and reporting purposes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Office supplies, lunch, etc." value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
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
                    <SelectItem value="Dining">Dining</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateExpense} disabled={!newExpense.description || !newExpense.amount}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer group ${active ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-accent hover:text-primary'}`}>
      <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${active ? 'text-primary-foreground' : 'text-primary'}`} />
      {label}
    </div>
  );
}

function SummaryCard({ title, value, sub, trend, icon: Icon }: { title: string, value: string, sub: string, trend: 'up' | 'down', icon: any }) {
  return (
    <Card className="border-none shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
        <div className="p-2 bg-accent/50 rounded-lg group-hover:bg-primary/10 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black text-primary">{value}</div>
        <div className="flex items-center gap-1.5 mt-1">
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3 text-secondary" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
          <span className="text-[10px] font-bold text-muted-foreground">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}
