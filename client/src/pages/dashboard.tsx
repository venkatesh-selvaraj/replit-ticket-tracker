import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";
import { type Ticket, type User } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, LogOut, User as UserIcon } from "lucide-react";

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

const statusColors = {
  open: "bg-green-500",
  closed: "bg-gray-500",
  "in-progress": "bg-purple-500",
};

export default function Dashboard() {
  const { user, logoutMutation } = useAuth();
  const [search, setSearch] = useState("");

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/tickets"],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const isLoading = ticketsLoading || usersLoading;

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase())
  );

  const getAssignedUsername = (userId: number | null) => {
    if (!userId) return "Unassigned";
    const assignedUser = users.find(u => u.id === userId);
    return assignedUser ? assignedUser.username : "Unknown User";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ticket Tracker</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <Input
            placeholder="Search tickets..."
            className="max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Link href="/create">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Ticket
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-40" />
              </Card>
            ))
          ) : (
            filteredTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{ticket.title}</span>
                    <div className="flex gap-2">
                      <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                        {ticket.priority}
                      </Badge>
                      <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                        {ticket.status}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{ticket.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <UserIcon className="w-4 h-4 mr-2" />
                    <span>Assigned to: {getAssignedUsername(ticket.assignedTo)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}