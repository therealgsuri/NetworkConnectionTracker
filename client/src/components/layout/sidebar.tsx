import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, Home, Bell } from "lucide-react";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/" },
  { icon: Users, label: "Contacts", href: "/contacts" },
  { icon: Bell, label: "Reminders", href: "/reminders" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-r bg-sidebar">
      <ScrollArea className="h-screen py-6">
        <div className="px-3 py-2">
          <h2 className="mb-6 px-4 text-lg font-semibold tracking-tight text-sidebar-foreground">
            Networking Tracker
          </h2>
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
        </div>
      </ScrollArea>
    </div>
  );
}
