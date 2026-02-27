
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { 
  BarChart3, 
  CreditCard, 
  FileText, 
  PieChart, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-dashboard');
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in-up">
                <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-primary">
                  Master Your Finances with <span className="text-secondary">LedgerStream</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  The intuitive accounting platform designed for growing businesses. 
                  Easy invoicing, automated expense tracking, and robust reporting in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="px-8 h-12" asChild>
                    <Link href="/signup">Start Free Trial</Link>
                  </Button>
                  <Button variant="outline" size="lg" className="px-8 h-12" asChild>
                    <Link href="#demo">Watch Demo</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-secondary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    <span>Secure & Compliant</span>
                  </div>
                </div>
              </div>
              
              <div className="relative animate-in zoom-in-95 duration-700">
                <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-primary rounded-2xl blur opacity-25"></div>
                <div className="relative bg-card rounded-2xl border shadow-2xl overflow-hidden">
                  <Image 
                    src={heroImage?.imageUrl || "https://picsum.photos/seed/ledger1/1200/800"} 
                    alt="LedgerStream Dashboard" 
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    data-ai-hint="accounting dashboard"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-accent/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                Everything you need to run your business finances
              </h2>
              <p className="text-lg text-muted-foreground">
                Ditch the spreadsheets. LedgerStream brings all your financial data together for a clear view of your growth.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Smart Invoicing",
                  description: "Create and send professional invoices in seconds. Track when they are viewed and paid.",
                  icon: FileText
                },
                {
                  title: "Expense Tracking",
                  description: "Automatically categorize transactions from synced bank accounts. Never lose a receipt again.",
                  icon: CreditCard
                },
                {
                  title: "Real-time Reports",
                  description: "P&L, Balance Sheet, and Cash Flow statements updated in real-time as you work.",
                  icon: BarChart3
                },
                {
                  title: "Tax Compliance",
                  description: "Prepared tax reports make filing a breeze. Export everything your accountant needs.",
                  icon: PieChart
                }
              ].map((feature, idx) => (
                <Card key={idx} className="border-none shadow-md hover:shadow-xl transition-all duration-300 group">
                  <CardContent className="pt-8 pb-6 px-6 space-y-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="space-y-2">
                <p className="text-5xl font-extrabold">$2.4B+</p>
                <p className="text-primary-foreground/70 font-medium">Transactions Managed</p>
              </div>
              <div className="space-y-2">
                <p className="text-5xl font-extrabold">15k+</p>
                <p className="text-primary-foreground/70 font-medium">Global Businesses</p>
              </div>
              <div className="space-y-2">
                <p className="text-5xl font-extrabold">99.9%</p>
                <p className="text-primary-foreground/70 font-medium">Platform Uptime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-secondary/10 rounded-3xl p-8 md:p-16 border border-secondary/20 relative overflow-hidden">
              <div className="max-w-2xl relative z-10 space-y-6">
                <h2 className="text-4xl font-bold tracking-tight text-primary">
                  Ready to stream your success?
                </h2>
                <p className="text-lg text-muted-foreground">
                  Join thousands of small business owners and freelancers who have simplified their accounting with LedgerStream.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button size="lg" className="px-8" asChild>
                    <Link href="/signup">Start Your Free Trial</Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="px-8 group" asChild>
                    <Link href="/pricing">
                      View Pricing <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4">
                <div className="bg-card w-80 h-80 rounded-full border shadow-lg flex items-center justify-center">
                   <div className="bg-primary/5 w-64 h-64 rounded-full flex items-center justify-center animate-pulse">
                      <LayoutDashboard className="h-24 w-24 text-primary opacity-20" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
