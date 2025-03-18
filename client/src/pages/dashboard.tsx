import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Contact, Reminder } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: contacts } = useQuery<Contact[]>({ 
    queryKey: ["/api/contacts"]
  });
  
  const { data: reminders } = useQuery<Reminder[]>({ 
    queryKey: ["/api/reminders"]
  });

  const upcomingReminders = reminders?.filter(r => !r.completed) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{contacts?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reminders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{upcomingReminders.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingReminders.slice(0, 5).map((reminder) => (
              <div key={reminder.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{reminder.description}</p>
                  <p className="text-sm text-muted-foreground">
                    Due: {format(new Date(reminder.dueDate), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
