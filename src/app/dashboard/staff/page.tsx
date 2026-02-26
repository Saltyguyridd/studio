
"use client";

import { useState } from "react";
import { useFirestore, useUser, useCollection, useMemoFirebase, setDocumentNonBlocking } from "@/firebase";
import { collection, doc, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Shield, Mail, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StaffManagementPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("cashier");

  // For this prototype, we assume the user is part of one organization.
  // In a real app, you'd fetch the active organization.
  const membersQuery = useMemoFirebase(() => {
    if (!user) return null;
    // We fetch all members for organizations where this user is an admin
    // For simplicity, we query a collection group or specific org if known.
    // Here we'll just query the specific user's memberships to find their org.
    return null; // This would be replaced by actual org member fetching logic
  }, [user]);

  const handleAddStaff = () => {
    if (!newEmail) return;
    
    // Logic: Create a placeholder membership or invite.
    // In this MVP, we just show a toast as real 'invites' require cloud functions.
    toast({
      title: "Invite Sent",
      description: `An invite has been sent to ${newEmail} as ${newRole}.`,
    });
    setNewEmail("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage your team and their access levels.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add New Staff
            </CardTitle>
            <CardDescription>Assign a role and invite a new member.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                placeholder="staff@company.com" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-2" onClick={handleAddStaff}>
              Send Invitation
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mock data for the MVP view */}
                <TableRow>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">You (Admin)</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge>Admin</Badge></TableCell>
                  <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" disabled><Shield className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">Sarah Manager</span>
                      <span className="text-xs text-muted-foreground">sarah@ledgerstream.io</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">Manager</Badge></TableCell>
                  <TableCell><Badge variant="secondary">Active</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
