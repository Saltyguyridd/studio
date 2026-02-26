
"use client";

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
  Plus
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

export default function DashboardPage() {
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
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
            </Button>
            <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
              <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
                <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your finances today.</p>
            </div>
            <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Invoice
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard 
                title="Total Revenue" 
                value="$45,231.89" 
                change="+20.1% from last month" 
                trend="up" 
                icon={DollarSign}
            />
            <SummaryCard 
                title="Active Invoices" 
                value="24" 
                change="+12 since last week" 
                trend="up" 
                icon={FileText}
            />
            <SummaryCard 
                title="Expenses" 
                value="$12,403.00" 
                change="-4% from last month" 
                trend="down" 
                icon={CreditCard}
            />
            <SummaryCard 
                title="Net Profit" 
                value="$32,828.89" 
                change="+10.1% from last month" 
                trend="up" 
                icon={TrendingUp}
            />
          </div>

          <div className="grid lg:grid-cols-7 gap-6">
            {/* Cash Flow Chart Mockup */}
            <Card className="lg:col-span-4 border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Cash Flow</CardTitle>
                    <CardDescription>Monthly revenue vs expenses</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full bg-accent/20 rounded-lg flex items-end justify-between px-6 pb-2 gap-2">
                        {[40, 65, 45, 80, 55, 90, 75, 85, 60, 95, 80, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-primary rounded-t-sm" style={{ height: `${h}%` }}></div>
                                <span className="text-[10px] text-muted-foreground uppercase">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="lg:col-span-3 border-none shadow-sm">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <ActivityItem 
                            name="Acme Corp" 
                            desc="Paid Invoice #INV-001" 
                            amount="+$1,200.00" 
                            time="2h ago"
                        />
                        <ActivityItem 
                            name="Amazon Web Services" 
                            desc="Monthly subscription" 
                            amount="-$240.00" 
                            time="5h ago"
                            isExpense
                        />
                        <ActivityItem 
                            name="Sarah Johnson" 
                            desc="Sent Invoice #INV-002" 
                            amount="$450.00" 
                            time="1d ago"
                        />
                        <ActivityItem 
                            name="Office Supplies Inc" 
                            desc="Hardware purchase" 
                            amount="-$1,100.00" 
                            time="2d ago"
                            isExpense
                        />
                    </div>
                    <Button variant="link" className="w-full mt-6 text-primary h-auto p-0">
                        View All Activity
                    </Button>
                </CardContent>
            </Card>
          </div>

          {/* Recent Invoices Table */}
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
                        <TableHead>Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[
                        { id: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
                        { id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
                        { id: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
                        { id: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00" },
                        { id: "INV005", status: "Paid", method: "Bank Transfer", amount: "$550.00" },
                    ].map((invoice) => (
                        <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>
                                <Badge variant={invoice.status === "Paid" ? "secondary" : "outline"} className={invoice.status === "Unpaid" ? "text-destructive border-destructive" : ""}>
                                    {invoice.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{invoice.method}</TableCell>
                            <TableCell className="text-right font-medium">{invoice.amount}</TableCell>
                        </TableRow>
                    ))}
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

function SummaryCard({ title, value, change, trend, icon: Icon }: { title: string, value: string, change: string, trend: 'up' | 'down', icon: any }) {
    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className={`text-xs mt-1 flex items-center gap-1 ${trend === 'up' ? 'text-secondary font-semibold' : 'text-muted-foreground'}`}>
                    {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {change}
                </div>
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
                    <p className="text-sm font-bold leading-none">{name}</p>
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
