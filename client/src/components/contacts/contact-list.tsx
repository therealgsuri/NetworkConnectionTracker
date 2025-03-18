import { useState } from "react";
import { Link } from "wouter";
import { Contact, ContactTier } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

type Props = {
  contacts: Contact[];
};

type SortField = "name" | "company" | "role" | "lastContactDate";
type SortOrder = "asc" | "desc";

export default function ContactList({ contacts }: Props) {
  const [sortField, setSortField] = useState<SortField>("lastContactDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const sortedContacts = [...contacts].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (sortField === "lastContactDate") {
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);
      return sortOrder === "asc" 
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-4 border-b bg-muted/50 px-4 py-2">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => toggleSort("name")}>
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => toggleSort("company")}>
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => toggleSort("role")}>
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => toggleSort("lastContactDate")}>
            Last Contact
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      <div>
        {sortedContacts.map((contact) => (
          <Link key={contact.id} href={`/contacts/${contact.id}`}>
            <a className="grid grid-cols-4 px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0">
              <div className="font-medium">{contact.name}</div>
              <div className="text-muted-foreground">{contact.company}</div>
              <div className="text-muted-foreground">{contact.role}</div>
              <div className="text-muted-foreground">
                {new Date(contact.lastContactDate).toLocaleDateString()}
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}