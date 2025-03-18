import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertNoteSchema, type InsertNote } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

type Props = {
  contactId: number;
  onSuccess?: () => void;
};

export default function NoteForm({ contactId, onSuccess }: Props) {
  const { toast } = useToast();
  const form = useForm<InsertNote>({
    resolver: zodResolver(insertNoteSchema),
    defaultValues: {
      contactId,
      content: "",
      meetingDate: new Date().toISOString().split("T")[0],
      documentUrl: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertNote) => {
      await apiRequest("POST", "/api/notes", data);
    },
    onSuccess: () => {
      toast({ title: "Note added successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/contacts/${contactId}/notes`] });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error adding note",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Content</FormLabel>
              <FormControl>
                <Textarea {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meetingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Date</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="documentUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} type="url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Adding..." : "Add Note"}
        </Button>
      </form>
    </Form>
  );
}
