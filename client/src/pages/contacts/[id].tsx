import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Contact, Note, Reminder } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Link as LinkIcon, Mail, Phone } from "lucide-react";
import { format } from "date-fns";
import NoteForm from "@/components/notes/note-form";
import ReminderForm from "@/components/reminders/reminder-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ContactDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const contactId = Number(id);

  const { data: contact, isLoading: loadingContact } = useQuery<Contact>({
    queryKey: [`/api/contacts/${contactId}`],
  });

  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: [`/api/contacts/${contactId}/notes`],
  });

  const { data: reminders = [] } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
    select: (data) => data.filter((r) => r.contactId === contactId),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/contacts/${contactId}`);
    },
    onSuccess: () => {
      toast({ title: "Contact deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setLocation("/contacts");
    },
    onError: (error) => {
      toast({
        title: "Error deleting contact",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (loadingContact) {
    return <div>Loading...</div>;
  }

  if (!contact) {
    return <div>Contact not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{contact.name}</h1>
          <p className="text-lg text-muted-foreground">
            {contact.role} at {contact.company}
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Contact
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {contact.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${contact.phone}`}
                  className="text-sm hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            )}
            {contact.linkedinUrl && (
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Last Contact:{" "}
                {format(new Date(contact.lastContactDate), "MMM d, yyyy")}
              </p>
              {contact.nextContactDate && (
                <p className="text-sm text-muted-foreground">
                  Next Contact:{" "}
                  {format(new Date(contact.nextContactDate), "MMM d, yyyy")}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-xl px-8 py-4">
              {contact.company}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notes" className="w-full">
        <TabsList>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <NoteForm contactId={contactId} />
              </DialogContent>
            </Dialog>
          </div>

          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-6">
                <p className="whitespace-pre-wrap">{note.content}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {format(new Date(note.meetingDate), "MMM d, yyyy")}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <div className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reminder
                </Button>
              </DialogTrigger>
              <DialogContent>
                <ReminderForm contactId={contactId} />
              </DialogContent>
            </Dialog>
          </div>

          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p>{reminder.description}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {format(new Date(reminder.dueDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant={reminder.completed ? "secondary" : "default"}>
                    {reminder.completed ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
