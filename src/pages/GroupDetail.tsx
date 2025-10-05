import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, UserPlus, Shuffle, List, User } from "lucide-react";
import AddMemberDialog from "@/components/AddMemberDialog";
import MembersList from "@/components/MembersList";
import AssignmentView from "@/components/AssignmentView";

interface Group {
  id: string;
  name: string;
  description: string;
  assignment_completed: boolean;
  created_by: string;
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
      fetchGroupData();
    };
    checkUser();
  }, [id, navigate]);

  const fetchGroupData = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("*")
        .eq("id", id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      fetchMembers();
    } catch (error: any) {
      toast({
        title: "Error loading group",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("group_members")
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          is_child
        ),
        assigned_profiles:assigned_to (
          id,
          full_name
        )
      `)
      .eq("group_id", id);

    if (!error && data) {
      setMembers(data);
    }
  };

  const handleAssignments = async () => {
    if (members.length < 2) {
      toast({
        title: "Not enough members",
        description: "You need at least 2 members to create assignments.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get all non-child members who can give gifts
      const givers = members.filter(m => !m.profiles.is_child);
      // Get all members who can receive gifts
      const receivers = [...members];

      if (givers.length === 0) {
        toast({
          title: "No gift givers",
          description: "At least one non-child member is required.",
          variant: "destructive",
        });
        return;
      }

      // Shuffle receivers
      const shuffledReceivers = [...receivers].sort(() => Math.random() - 0.5);
      
      // Assign each giver to a receiver (ensuring no self-assignment)
      const assignments = givers.map((giver, index) => {
        let receiverIndex = index % shuffledReceivers.length;
        let receiver = shuffledReceivers[receiverIndex];
        
        // If assigned to self, swap with next person
        if (receiver.user_id === giver.user_id) {
          const nextIndex = (receiverIndex + 1) % shuffledReceivers.length;
          [shuffledReceivers[receiverIndex], shuffledReceivers[nextIndex]] = 
          [shuffledReceivers[nextIndex], shuffledReceivers[receiverIndex]];
          receiver = shuffledReceivers[receiverIndex];
        }
        
        return {
          id: giver.id,
          assigned_to: receiver.user_id,
        };
      });

      // Update assignments in database
      for (const assignment of assignments) {
        const { error } = await supabase
          .from("group_members")
          .update({ assigned_to: assignment.assigned_to })
          .eq("id", assignment.id);

        if (error) throw error;
      }

      // Mark group as assignment completed
      const { error: groupError } = await supabase
        .from("groups")
        .update({ assignment_completed: true })
        .eq("id", id);

      if (groupError) throw groupError;

      toast({
        title: "Assignments complete!",
        description: "Secret Santa assignments have been made.",
      });

      fetchGroupData();
    } catch (error: any) {
      toast({
        title: "Error creating assignments",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!group) return null;

  const isCreator = userId === group.created_by;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
          <p className="text-muted-foreground">{group.description}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Group Members
              </CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? "s" : ""} in this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MembersList members={members} />
              {isCreator && (
                <div className="mt-4 space-y-2">
                  <Button onClick={() => setShowAddMember(true)} className="w-full" variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                  {!group.assignment_completed && members.length >= 2 && (
                    <Button onClick={handleAssignments} className="w-full">
                      <Shuffle className="h-4 w-4 mr-2" />
                      Create Assignments
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5 text-secondary" />
                Your Assignment
              </CardTitle>
              <CardDescription>
                {group.assignment_completed
                  ? "See who you're buying for"
                  : "Waiting for assignments"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssignmentView
                groupId={group.id}
                userId={userId}
                assignmentCompleted={group.assignment_completed}
                onViewWishlist={(memberId) => navigate(`/wishlist/${group.id}/${memberId}`)}
              />
              <Button
                onClick={() => navigate(`/wishlist/${group.id}/${userId}`)}
                variant="outline"
                className="w-full mt-4"
              >
                <List className="h-4 w-4 mr-2" />
                Manage My Wishlist
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <AddMemberDialog
        open={showAddMember}
        onOpenChange={setShowAddMember}
        groupId={group.id}
        onMemberAdded={fetchMembers}
      />
    </div>
  );
};

export default GroupDetail;
