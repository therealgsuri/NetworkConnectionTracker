import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNoteSchema, type InsertNote } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileUpload } from "@/components/ui/file-upload";

type Props = {
  onSuccess?: () => void;
};

export default function NoteUploadForm({ onSuccess }: Props) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedContact, setExtractedContact] = useState<Record<string, string> | null>(null);

  const form = useForm<InsertNote>({
    resolver: zodResolver(insertNoteSchema),
    defaultValues: {
      content: "",
      meetingDate: new Date().toISOString().split("T")[0],
      documentUrl: null,
    },
  });

  const processDocument = async (file: File) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("document", file);

      console.log('Uploading file:', file.name, file.size, file.type);

      const response = await fetch("/api/documents/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process document");
      }

      const data = await response.json();
      form.setValue("content", data.text);
      setExtractedContact(data.extractedContact);

      toast({
        title: "Document processed successfully",
        description: data.extractedContact.name 
          ? `Found contact: ${data.extractedContact.name}` 
          : "No contact information found",
      });
    } catch (error) {
      console.error('Document processing error:', error);
      toast({
        title: "Error processing document",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (data: InsertNote) => {
    try {
      // First create or update the contact if we have extracted information
      let contactId: number | undefined;

      if (extractedContact?.name && extractedContact?.company) {
        const contactResponse = await apiRequest("POST", "/api/contacts", {
          name: extractedContact.name,
          company: extractedContact.company,
          role: extractedContact.role || "Unknown",
          email: extractedContact.email || null,
          lastContactDate: new Date().toISOString(),
          nextContactDate: null,
        });
        const contactData = await contactResponse.json();
        contactId = contactData.id;
      }

      if (!contactId) {
        throw new Error("Could not create contact from document");
      }

      // Then create the note
      await apiRequest("POST", "/api/notes", {
        ...data,
        contactId,
      });

      toast({ title: "Note added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      queryClient.invalidateQueries({ queryKey: [`/api/contacts/${contactId}/notes`] });
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error adding note",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Upload Conversation Notes</h2>

      <FileUpload
        onUpload={processDocument}
        label="Upload Conversation Document"
      />

      {extractedContact && (
        <div className="rounded-lg border p-3 mt-4">
          <h3 className="font-medium mb-2">Extracted Contact Information</h3>
          {extractedContact.name && <p>Name: {extractedContact.name}</p>}
          {extractedContact.company && <p>Company: {extractedContact.company}</p>}
          {extractedContact.role && <p>Role: {extractedContact.role}</p>}
          {extractedContact.email && <p>Email: {extractedContact.email}</p>}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !extractedContact}
          >
            Save Note & Create Contact
          </Button>
        </form>
      </Form>
    </div>
  );
}