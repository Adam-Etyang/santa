import { User, Baby } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Member {
  id: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
    is_child: boolean;
  };
}

interface MembersListProps {
  members: Member[];
}

const MembersList = ({ members }: MembersListProps) => {
  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            {member.profiles.is_child ? (
              <Baby className="h-5 w-5 text-accent" />
            ) : (
              <User className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{member.profiles.full_name}</p>
          </div>
          {member.profiles.is_child && (
            <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
              Child
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
};

export default MembersList;
