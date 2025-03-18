import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Props = {
  contactId: number;
  canEdit?: boolean;
};

export default function ConversationList({ contactId, canEdit }: Props) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const { toast } = useToast();

  const { data: conversations = [] } = useQuery<Note[]>({ 
    queryKey: [`/api/contacts/${contactId}/notes`]
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Note>) => {
      return apiRequest("PATCH", `/api/notes/${data.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Conversation updated successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/contacts/${contactId}/notes`] });
      setEditingNote(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating conversation",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    },
  });

  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = new Date(a.meetingDate);
    const dateB = new Date(b.meetingDate);
    return dateB.getTime() - dateA.getTime();
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const handleUpdate = (note: Note) => {
    updateMutation.mutate({
      id: note.id,
      title: note.title,
      meetingDate: note.meetingDate
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Conversations</h3>
      </div>

      <div className="space-y-2">
        {sortedConversations.map((conversation) => (
          <div key={conversation.id} className="flex items-center gap-2">
            <Button
              variant="outline"
              className="w-full justify-start text-left"
              onClick={() => setSelectedNote(conversation)}
            >
              <div className="flex flex-col gap-1">
                <div className="text-sm text-muted-foreground">
                  {formatDate(conversation.meetingDate)} - {conversation.title || "Conversation"}
                </div>
              </div>
            </Button>
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingNote(conversation)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedNote?.title || formatDate(selectedNote?.meetingDate || '')}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] mt-4 pr-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {selectedNote?.content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editingNote?.title || ''}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={editingNote?.meetingDate.split('T')[0] || ''}
                onChange={(e) => setEditingNote(prev => prev ? { ...prev, meetingDate: e.target.value } : null)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => editingNote && handleUpdate(editingNote)}
              disabled={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}