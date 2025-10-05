import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

interface AssignmentViewProps {
  groupId: string;
  userId: string | null;
  assignmentCompleted: boolean;
  onViewWishlist: (userId: string) => void;
}

const AssignmentView = ({
  groupId,
  userId,
  assignmentCompleted,
  onViewWishlist,
}: AssignmentViewProps) => {
  const [assignedPerson, setAssignedPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (assignmentCompleted && userId) {
      fetchAssignment();
    } else {
      setLoading(false);
    }
  }, [assignmentCompleted, userId, groupId]);

  const fetchAssignment = async () => {
    try {
      const { data, error } = await supabase
        .from("group_members")
        .select(`
          assigned_to,
          assigned_profiles:assigned_to (
            id,
            full_name
          )
        `)
        .eq("group_id", groupId)
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      
      if (data?.assigned_profiles) {
        setAssignedPerson(data.assigned_profiles);
      }
    } catch (error) {
      console.error("Error fetching assignment:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading assignment...</div>;
  }

  if (!assignmentCompleted) {
    return (
      <div className="text-center py-8">
        <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">
          Assignments haven't been made yet. Check back soon!
        </p>
      </div>
    );
  }

  if (!assignedPerson) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          You're not assigned to give a gift in this group.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <div className="mb-4 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
        <p className="text-sm text-muted-foreground mb-2">You're buying for:</p>
        <p className="text-2xl font-bold text-primary mb-4">{assignedPerson.full_name}</p>
        <Button onClick={() => onViewWishlist(assignedPerson.id)} className="w-full">
          <Gift className="h-4 w-4 mr-2" />
          View Their Wishlist
        </Button>
      </div>
    </div>
  );
};

export default AssignmentView;
