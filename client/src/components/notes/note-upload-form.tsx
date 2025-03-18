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
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  onSuccess?: () => void;
};

type ProcessingStatus = {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
};

export default function NoteUploadForm({ onSuccess }: Props) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [extractedContacts, setExtractedContacts] = useState<Record<string, any>[]>([]);

  const processDocuments = async (files: File[]) => {
    setIsProcessing(true);
    setStatus({ total: files.length, processed: 0, succeeded: 0, failed: 0 });
    setExtractedContacts([]);

    try {
      for (const file of files) {
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
          console.log('Processed document data:', data);

          if (data.extractedContact) {
            setExtractedContacts(prev => [...prev, data.extractedContact]);

            // Create contact and note
            const contactResponse = await apiRequest("POST", "/api/contacts", {
              name: data.extractedContact.name,
              company: data.extractedContact.company || "Unknown Company",
              role: data.extractedContact.role || "Unknown Role",
              email: data.extractedContact.email || null,
              phone: null,
              linkedinUrl: null,
              lastContactDate: data.extractedContact.meetingDate || new Date().toISOString().split('T')[0],
              nextContactDate: null,
              notes: null,
            });

            const contactData = await contactResponse.json();

            await apiRequest("POST", "/api/notes", {
              contactId: contactData.id,
              content: data.text,
              meetingDate: data.extractedContact.meetingDate || new Date().toISOString().split('T')[0],
              documentUrl: null,
            });

            setStatus(prev => prev ? {
              ...prev,
              processed: prev.processed + 1,
              succeeded: prev.succeeded + 1
            } : null);
          }
        } catch (error) {
          console.error('Error processing document:', error);
          setStatus(prev => prev ? {
            ...prev,
            processed: prev.processed + 1,
            failed: prev.failed + 1
          } : null);
        }
      }

      // Refresh contacts list
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });

      toast({ 
        title: "Documents processed",
        description: `Successfully processed ${status?.succeeded || 0} out of ${status?.total || 0} documents.`
      });

      onSuccess?.();
    } catch (error) {
      console.error('Batch processing error:', error);
      toast({
        title: "Error processing documents",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const form = useForm<InsertNote>({
    resolver: zodResolver(insertNoteSchema),
    defaultValues: {
      contactId: 0,
      content: "",
      meetingDate: new Date().toISOString().split("T")[0],
      documentUrl: null,
    },
  });


  return (
    <ScrollArea className="h-[80vh] pr-4">
      <div className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">Upload Conversation Notes</h2>

        <FileUpload
          onUpload={processDocuments}
          label="Upload Conversation Documents"
          multiple={true}
          maxFiles={100}
        />

        {status && (
          <div className="rounded-lg border p-4 mt-4">
            <h3 className="font-medium mb-2">Processing Status</h3>
            <div className="space-y-2">
              <p>Total files: {status.total}</p>
              <p>Processed: {status.processed} / {status.total}</p>
              <p className="text-green-600">Succeeded: {status.succeeded}</p>
              {status.failed > 0 && (
                <p className="text-red-600">Failed: {status.failed}</p>
              )}
            </div>
          </div>
        )}

        {extractedContacts.length > 0 && (
          <div className="rounded-lg border p-4 mt-4">
            <h3 className="font-medium mb-2">Processed Contacts</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {extractedContacts.map((contact, index) => (
                <div key={index} className="border-b pb-2 last:border-0">
                  <p>Name: {contact.name}</p>
                  <p>Company: {contact.company || "Unknown Company"}</p>
                  {contact.role && <p>Role: {contact.role}</p>}
                  {contact.email && <p>Email: {contact.email}</p>}
                  {contact.meetingDate && <p>Meeting Date: {contact.meetingDate}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}