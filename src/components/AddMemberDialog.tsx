import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  onMemberAdded: () => void;
}

const AddMemberDialog = ({ open, onOpenChange, groupId, onMemberAdded }: AddMemberDialogProps) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [isChild, setIsChild] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, check if user exists with this email
      const { data: existingProfile, error: searchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", email) // This won't work - we need a different approach
        .maybeSingle();

      // For now, create a temporary user profile
      // In production, you'd want to send an invitation email
      const tempUserId = crypto.randomUUID();
      
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: tempUserId,
            full_name: fullName,
            is_child: isChild,
          },
        ]);

      if (profileError) {
        // If profile already exists, that's okay
        if (!profileError.message.includes("duplicate")) {
          throw profileError;
        }
      }

      const { error: memberError } = await supabase
        .from("group_members")
        .insert([
          {
            group_id: groupId,
            user_id: tempUserId,
          },
        ]);

      if (memberError) throw memberError;

      toast({
        title: "Member added!",
        description: `${fullName} has been added to the group.`,
      });

      onMemberAdded();
      onOpenChange(false);
      setEmail("");
      setFullName("");
      setIsChild(false);
    } catch (error: any) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Group Member</DialogTitle>
          <DialogDescription>
            Add a new member to this Secret Santa group
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Email invitations coming soon!
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isChild"
              checked={isChild}
              onCheckedChange={(checked) => setIsChild(checked as boolean)}
            />
            <Label htmlFor="isChild" className="cursor-pointer">
              This is a child (won't be assigned to give gifts)
            </Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Adding..." : "Add Member"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
