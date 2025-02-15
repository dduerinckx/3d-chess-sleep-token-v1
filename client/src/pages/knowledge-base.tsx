import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Document } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: documents, isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
  });

  const createDocumentMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/documents", {
        title,
        content,
        metadata: {},
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsCreating(false);
      setTitle("");
      setContent("");
      toast({
        title: "Document created",
        description: "Your document has been added to the knowledge base.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create document",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Document deleted",
        description: "The document has been removed from your knowledge base.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete document",
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
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          {!isCreating && (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Button>
          )}
        </div>

        {isCreating && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Document</CardTitle>
              <CardDescription>
                Add a new document to your knowledge base
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Document content"
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setTitle("");
                  setContent("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => createDocumentMutation.mutate()}
                disabled={createDocumentMutation.isPending}
              >
                {createDocumentMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save
              </Button>
            </CardFooter>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : documents?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Your knowledge base is empty. Add documents to get started!
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {documents?.map((document) => (
              <Card key={document.id}>
                <CardHeader>
                  <CardTitle>{document.title}</CardTitle>
                  <CardDescription>
                    Added: {new Date(document.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {document.content}
                  </p>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteDocumentMutation.mutate(document.id)}
                    disabled={deleteDocumentMutation.isPending}
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
