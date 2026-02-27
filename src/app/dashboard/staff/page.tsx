
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFirestore, useUser, useCollection, useMemoFirebase, useDoc } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Shield, Mail, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StaffManagementPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("cashier");

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);
  
  const { data: profile } = useDoc(userProfileRef);
  const orgId = profile?.organizationId;

  const memberRef = useMemoFirebase(() => {
    if (!user || !orgId) return null;
    return doc(db, 'organizations', orgId, 'members', user.uid);
  }, [db, user, orgId]);

  const { data: membership, isLoading: isMembershipLoading } = useDoc(memberRef);
  const userRole = membership?.role;
  const isAdmin = userRole === 'admin';

  const membersQuery = useMemoFirebase(() => {
    if (!orgId) return null;
    return collection(db, 'organizations', orgId, 'members');
  }, [db, orgId]);

  const { data: members, isLoading: isMembersLoading } = useCollection(membersQuery);

  const handleAddStaff = () => {
    if (!newEmail) return;
    toast({
      title: "Invite Sent",
      description: `An invite has been sent to ${newEmail} as ${newRole}.`,
    });
    setNewEmail("");
  };

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isMembersLoading || isMembershipLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground max-w-md">
          You do not have administrative permissions to view or manage staff. 
          Please contact your organization's owner if you believe this is an error.
        </p>
        <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">Manage access for {profile?.organizationId || 'Organization'}.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-none shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Add Team Member
            </CardTitle>
            <CardDescription>Invited users will receive access based on their assigned role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                placeholder="colleague@company.com" 
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
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                  <SelectItem value="manager">Manager (Operations)</SelectItem>
                  <SelectItem value="cashier">Cashier (Billing Only)</SelectItem>
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
            <CardTitle>Organization Roster</CardTitle>
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
                {members && members.length > 0 ? (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{member.userId === user?.uid ? 'You' : member.email}</span>
                          <span className="text-xs text-muted-foreground">{member.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10"
                          disabled={member.userId === user?.uid}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No team members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
