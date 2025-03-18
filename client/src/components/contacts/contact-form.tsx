import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";

type Props = {
  onSuccess?: () => void;
  defaultValues?: Partial<InsertContact>;
};

export default function ContactForm({ onSuccess, defaultValues }: Props) {
  const { toast } = useToast();

  // Initialize form with schema validation
  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      company: "",
      role: "",
      email: null,
      phone: null,
      linkedinUrl: null,
      lastContactDate: new Date().toISOString().split('T')[0],
      nextContactDate: null,
      notes: null,
      ...defaultValues
    }
  });

  // Handle form submission
  const onSubmit = async (data: InsertContact) => {
    try {
      console.log('Submitting form data:', data);

      await apiRequest("POST", "/api/contacts", {
        ...data,
        lastContactDate: data.lastContactDate,
        nextContactDate: data.nextContactDate,
      });

      toast({ title: "Contact created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error creating contact",
        description: error instanceof Error ? error.message : "Failed to create contact",
        variant: "destructive"
      });
    }
  };

  return (
    <ScrollArea className="max-h-[80vh]">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Contact</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field: { value, onChange, ...field }}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="email" 
                      value={value || ''} 
                      onChange={(e) => onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field: { value, onChange, ...field }}) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="tel" 
                      value={value || ''} 
                      onChange={(e) => onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedinUrl"
              render={({ field: { value, onChange, ...field }}) => (
                <FormItem>
                  <FormLabel>LinkedIn URL</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="url" 
                      value={value || ''} 
                      onChange={(e) => onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastContactDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Contact Date</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="date" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              onClick={() => {
                console.log('Form state:', form.getValues());
                console.log('Form errors:', form.formState.errors);
              }}
            >
              Create Contact
            </Button>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}