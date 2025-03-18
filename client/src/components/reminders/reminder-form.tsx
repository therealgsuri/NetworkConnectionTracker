import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertReminderSchema, type InsertReminder } from "@shared/schema";
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

export default function ReminderForm({ contactId, onSuccess }: Props) {
  const { toast } = useToast();
  const form = useForm<InsertReminder>({
    resolver: zodResolver(insertReminderSchema),
    defaultValues: {
      contactId,
      description: "",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 1 week from now
      completed: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertReminder) => {
      await apiRequest("POST", "/api/reminders", {
        ...data,
        dueDate: data.dueDate.toISOString(),
      });
    },
    onSuccess: () => {
      toast({ title: "Reminder created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error creating reminder",
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  value={field.value ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create Reminder"}
        </Button>
      </form>
    </Form>
  );
}