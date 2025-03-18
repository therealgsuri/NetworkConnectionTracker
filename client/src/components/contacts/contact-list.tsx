import { Link } from "wouter";
import { Contact, ContactTier } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Props = {
  contacts: Contact[];
};

const tierColors: Record<ContactTier, string> = {
  GOLD: "bg-yellow-500",
  SILVER: "bg-gray-400",
  STANDARD: "bg-blue-500"
};

export default function ContactList({ contacts }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <Link key={contact.id} href={`/contacts/${contact.id}`}>
          <a className="block">
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.role}</p>
                    <p className="text-sm text-muted-foreground">{contact.company}</p>
                  </div>
                  <Badge variant="secondary">
                    {contact.lastContactDate && format(new Date(contact.lastContactDate), "MMM d")}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </a>
        </Link>
      ))}
    </div>
  );
}
