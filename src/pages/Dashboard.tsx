import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Gift, Users, LogOut, Plus } from "lucide-react";

interface Group {
  id: string;
  name: string;
  description: string;
  assignment_completed: boolean;
  created_by: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchGroups();
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("groups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading groups",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Secret Santa</h1>
          </div>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Manage your Secret Santa groups and wishlists</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-2 border-dashed border-primary" onClick={() => navigate("/create-group")}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Plus className="h-5 w-5" />
                Create New Group
              </CardTitle>
              <CardDescription>Start a new Secret Santa exchange</CardDescription>
            </CardHeader>
          </Card>

          {groups.map((group) => (
            <Card 
              key={group.id} 
              className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => navigate(`/group/${group.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-secondary" />
                  {group.name}
                </CardTitle>
                <CardDescription>{group.description || "No description"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {group.assignment_completed ? (
                    <span className="text-secondary font-medium">✓ Assignments complete</span>
                  ) : (
                    <span className="text-muted-foreground">Pending assignments</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground mb-4">Create your first Secret Santa group to get started!</p>
            <Button onClick={() => navigate("/create-group")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
