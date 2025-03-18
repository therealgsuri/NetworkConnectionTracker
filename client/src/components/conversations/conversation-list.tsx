import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

type Props = {
  contactId: number;
};

export default function ConversationList({ contactId }: Props) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const { data: conversations = [] } = useQuery<Note[]>({ 
    queryKey: [`/api/contacts/${contactId}/notes`]
  });

  const sortedConversations = [...conversations].sort((a, b) => {
    const dateA = new Date(a.meetingDate);
    const dateB = new Date(b.meetingDate);
    return isNaN(dateB.getTime()) || isNaN(dateA.getTime()) 
      ? 0 
      : dateB.getTime() - dateA.getTime();
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Conversations</h3>
      </div>

      <div className="space-y-2">
        {sortedConversations.map((conversation) => (
          <Button
            key={conversation.id}
            variant="outline"
            className="w-full justify-start text-left"
            onClick={() => setSelectedNote(conversation)}
          >
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">
                {formatDate(conversation.meetingDate)} - {conversation.summary || "Conversation"}
              </div>
            </div>
          </Button>
        ))}
      </div>

      <Dialog open={!!selectedNote} onOpenChange={() => setSelectedNote(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {selectedNote?.title || (selectedNote?.meetingDate && formatDate(selectedNote.meetingDate))}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-4">
            <div className="whitespace-pre-wrap">
              {selectedNote?.content}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}