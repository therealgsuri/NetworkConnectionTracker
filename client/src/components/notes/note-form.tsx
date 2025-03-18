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
import { FileUpload } from "@/components/ui/file-upload";
import { useState } from "react";

type Props = {
  contactId: number;
  onSuccess?: () => void;
};

export default function NoteForm({ contactId, onSuccess }: Props) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<InsertNote>({
    resolver: zodResolver(insertNoteSchema),
    defaultValues: {
      contactId,
      content: "",
      meetingDate: new Date().toISOString().split("T")[0],
      documentUrl: "",
    },
  });

  const processDocument = async (files: File[]) => {
    if (!files.length) return;

    const file = files[0];
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("document", file);

      const response = await fetch("/api/documents/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process document");
      }

      const data = await response.json();
      form.setValue("content", data.text);

      toast({
        title: "Document processed successfully",
        description: data.extractedContact.name 
          ? `Found contact: ${data.extractedContact.name}` 
          : "No contact information found",
      });
    } catch (error) {
      toast({
        title: "Error processing document",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
        <FileUpload
          onUpload={processDocument}
          label="Upload Conversation Document"
        />

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

        <Button type="submit" className="w-full" disabled={mutation.isPending || isProcessing}>
          {mutation.isPending ? "Adding..." : "Add Note"}
        </Button>
      </form>
    </Form>
  );
}