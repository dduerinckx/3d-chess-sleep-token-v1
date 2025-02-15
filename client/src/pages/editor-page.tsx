import { Navigation } from "@/components/navigation";
import { ManuscriptEditor } from "@/components/manuscript-editor";
import { ReviewPanel } from "@/components/review-panel";
import { useQuery } from "@tanstack/react-query";
import type { Manuscript } from "@shared/schema";
import { Loader2, AlertCircle } from "lucide-react";
import { useParams, useLocation } from "wouter";

export default function EditorPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const manuscriptId = id ? parseInt(id) : null;

  // Redirect to home if ID is invalid
  if (!manuscriptId || isNaN(manuscriptId)) {
    navigate("/");
    return null;
  }

  const { data: manuscript, isLoading, error } = useQuery<Manuscript>({
    queryKey: [`/api/manuscripts/${manuscriptId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !manuscript) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <p className="text-lg text-muted-foreground">
            {error?.message || "Manuscript not found"}
          </p>
          <button 
            onClick={() => navigate("/")}
            className="text-primary hover:underline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="grid lg:grid-cols-[2fr,1fr] gap-8">
          <ManuscriptEditor manuscript={manuscript} />
          <ReviewPanel manuscriptId={manuscript.id} />
        </div>
      </div>
    </div>
  );
}