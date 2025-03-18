import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Home, Bell, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import NoteUploadForm from "@/components/notes/note-upload-form";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Users, label: "Contacts", href: "/contacts" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="w-64 border-r bg-sidebar">
      <ScrollArea className="h-screen py-6">
        <div className="px-3 py-2">
          <h2 className="mb-6 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground">
            Networking Tracker
          </h2>
          <div className="space-y-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      location === item.href
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>

            <div className="px-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Add Conversation Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <NoteUploadForm onSuccess={() => setIsDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}