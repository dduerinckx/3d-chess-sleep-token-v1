import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Manuscript } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function HomePage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: manuscripts, isLoading } = useQuery<Manuscript[]>({
    queryKey: ["/api/manuscripts"],
  });

  const createManuscriptMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/manuscripts", {
        title: "Untitled Manuscript",
        content: " ",  // Add a space to satisfy non-empty requirement
        isPublic: false,
      });
      const data = await res.json();
      if (!data.id) {
        throw new Error("Failed to create manuscript");
      }
      return data;
    },
    onSuccess: (manuscript: Manuscript) => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });
      navigate(`/manuscripts/${manuscript.id}`);
      toast({
        title: "Manuscript created",
        description: "You can now start editing your manuscript.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create manuscript",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteManuscriptMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/manuscripts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manuscripts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete manuscript",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Manuscripts</h1>
          <Button
            onClick={() => createManuscriptMutation.mutate()}
            disabled={createManuscriptMutation.isPending}
          >
            {createManuscriptMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Manuscript
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : manuscripts?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              You don't have any manuscripts yet. Create one to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {manuscripts?.map((manuscript) => (
              <Card key={manuscript.id}>
                <CardHeader>
                  <CardTitle>{manuscript.title}</CardTitle>
                  <CardDescription>
                    Last modified:{" "}
                    {new Date(manuscript.lastModified).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {manuscript.content || "No content yet"}
                  </p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/manuscripts/${manuscript.id}`)}
                  >
                    Open
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteManuscriptMutation.mutate(manuscript.id)}
                    disabled={deleteManuscriptMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}