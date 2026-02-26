
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
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isInitializing, setIsInitializing] = useState(false);

  // Fetch the user's profile to get their organizationId
  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  // Profile/Org Initialization logic for new users
  useEffect(() => {
    if (!isUserLoading && user && !isProfileLoading && !profile && !isInitializing) {
      setIsInitializing(true);
      
      const orgId = `org_${user.uid}`;
      const orgRef = doc(db, 'organizations', orgId);
      const userRef = doc(db, 'users', user.uid);
      const memberRef = doc(db, 'organizations', orgId, 'members', user.uid);

      // Create Org
      setDocumentNonBlocking(orgRef, {
        id: orgId,
        name: `${user.email?.split('@')[0]}'s Organization`,
        ownerId: user.uid,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Create User Profile
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        firstName: user.displayName?.split(' ')[0] || 'New',
        lastName: user.displayName?.split(' ')[1] || 'User',
        organizationId: orgId,
        createdAt: new Date().toISOString()
      }, { merge: true });

      // Create Membership as Admin
      setDocumentNonBlocking(memberRef, {
        id: user.uid,
        userId: user.uid,
        organizationId: orgId,
        role: 'admin',
        email: user.email
      }, { merge: true });
    }
  }, [isUserLoading, user, isProfileLoading, profile, isInitializing, db]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const orgId = profile?.organizationId;

  // Fetch invoices for the organization
  const invoicesQuery = useMemoFirebase(() => {
    if (!orgId) return null;
    return query(collection(db, 'organizations', orgId, 'invoices'), orderBy('createdAt', 'desc'), limit(10));
  }, [db, orgId]);

  const { data: invoices, isLoading: isInvoicesLoading } = useCollection(invoicesQuery);

  // Fetch expenses for the organization
  const expensesQuery = useMemoFirebase(() => {
    if (!orgId) return null;
    return query(collection(db, 'organizations', orgId, 'expenses'), orderBy('createdAt', 'desc'), limit(10));
  }, [db, orgId]);

  const { data: expenses, isLoading: isExpensesLoading } = useCollection(expensesQuery);

  // Calculate Summary Statistics
  const revenue = invoices?.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0) || 0;
  const activeInvoicesCount = invoices?.filter(i => i.status !== 'Paid').length || 0;
  const totalExpenses = expenses?.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
  const netProfit = revenue - totalExpenses;

  // Formatting helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  if (isUserLoading || !user || (!profile && !isInitializing)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-accent/20 overflow-hidden">
      {/* Sidebar - Desktop */}
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
          <NavItem icon={LayoutDashboard} label="Dashboard" active />
          <NavItem icon={FileText} label="Invoices" />
          <NavItem icon={CreditCard} label="Expenses" />
          <NavItem icon={BarChart} label="Reports" />
          <NavItem icon={Users} label="Customers" />
          <NavItem icon={DollarSign} label="Payments" />
        </nav>
        <div className="p-4 border-t">
          <div className="bg-primary/5 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Account Role</p>
            <div className="flex items-center gap-2">
                <Badge variant="secondary">Admin</Badge>
                <span className="text-xs text-muted-foreground">Full Access</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-background flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10 h-9 bg-accent/30 border-none focus-visible:ring-1" placeholder="Search transactions..." />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
              <AvatarImage src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100`} />
              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isInitializing && !profile && (
            <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-center gap-3 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm font-medium text-primary">Setting up your secure organization workspace...</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                <p className="text-sm text-muted-foreground">Real-time financial performance for {profile?.firstName || 'your business'}.</p>
            </div>
            <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Invoice
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard 
                title="Total Revenue" 
                value={formatCurrency(revenue)} 
                change="Lifetime paid" 
                trend="up" 
                icon={DollarSign}
                isLoading={isInvoicesLoading || isProfileLoading}
            />
            <SummaryCard 
                title="Active Invoices" 
                value={activeInvoicesCount.toString()} 
                change="Awaiting payment" 
                trend="up" 
                icon={FileText}
                isLoading={isInvoicesLoading || isProfileLoading}
            />
            <SummaryCard 
                title="Expenses" 
                value={formatCurrency(totalExpenses)} 
                change="All tracked costs" 
                trend="down" 
                icon={CreditCard}
                isLoading={isExpensesLoading || isProfileLoading}
            />
            <SummaryCard 
                title="Net Profit" 
                value={formatCurrency(netProfit)} 
                change="Revenue - Expenses" 
                trend="up" 
                icon={TrendingUp}
                isLoading={isInvoicesLoading || isExpensesLoading || isProfileLoading}
            />
          </div>

          <div className="grid lg:grid-cols-7 gap-6">
            <Card className="lg:col-span-4 border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Cash Flow Trend</CardTitle>
                    <CardDescription>Monthly visualization of financial health</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full bg-accent/20 rounded-lg flex items-end justify-between px-6 pb-2 gap-2">
                        {[40, 65, 45, 80, 55, 90, 75, 85, 60, 95, 80, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-primary/40 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                <span className="text-[10px] text-muted-foreground uppercase">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {(!invoices?.length && !expenses?.length) ? (
                          <p className="text-sm text-muted-foreground text-center py-8">No recent activity found.</p>
                        ) : (
                          <>
                            {invoices?.slice(0, 3).map((inv) => (
                              <ActivityItem 
                                  key={inv.id}
                                  name={inv.customerName || 'Unknown Customer'} 
                                  desc={`Invoice ${inv.status}`} 
                                  amount={`${inv.status === 'Paid' ? '+' : ''}${formatCurrency(inv.amount)}`} 
                                  time={inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'Just now'}
                              />
                            ))}
                            {expenses?.slice(0, 2).map((exp) => (
                              <ActivityItem 
                                  key={exp.id}
                                  name={exp.description} 
                                  desc={exp.category} 
                                  amount={`-${formatCurrency(exp.amount)}`} 
                                  time={exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : 'Just now'}
                                  isExpense
                              />
                            ))}
                          </>
                        )}
                    </div>
                </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Invoices</CardTitle>
                    <CardDescription>A list of your most recent billing transactions.</CardDescription>
                </div>
                <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <Table>
                <TableHeader>
                    <TableRow className="bg-accent/10">
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices && invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.customerName || 'Guest'}</TableCell>
                            <TableCell>
                                <Badge variant={invoice.status === "Paid" ? "secondary" : "outline"} className={invoice.status === "Unpaid" ? "text-destructive border-destructive" : ""}>
                                    {invoice.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{invoice.method || 'N/A'}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(invoice.amount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          {isInvoicesLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'No invoices found.'}
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
    return (
        <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-primary'}`}>
            <Icon className="h-4 w-4" />
            {label}
        </button>
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

function ActivityItem({ name, desc, amount, time, isExpense = false }: { name: string, desc: string, amount: string, time: string, isExpense?: boolean }) {
    return (
        <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${isExpense ? 'bg-accent/10 border-accent' : 'bg-primary/5 border-primary/20'}`}>
                    {isExpense ? <CreditCard className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-secondary" />}
                </div>
                <div>
                    <p className="text-sm font-bold leading-none truncate max-w-[120px]">{name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`text-sm font-bold ${isExpense ? 'text-foreground' : 'text-secondary'}`}>{amount}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{time}</p>
            </div>
        </div>
    );
}
