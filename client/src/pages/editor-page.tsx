import { Navigation } from "@/components/navigation";
import { ManuscriptEditor } from "@/components/manuscript-editor";
import { ReviewPanel } from "@/components/review-panel";
import { useQuery } from "@tanstack/react-query";
import type { Manuscript } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { useParams } from "wouter";

export default function EditorPage() {
  const { id } = useParams();
  const manuscriptId = id ? parseInt(id) : undefined;

  if (!manuscriptId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Invalid manuscript ID</p>
      </div>
    );
  }

  const { data: manuscript, isLoading } = useQuery<Manuscript>({
    queryKey: [`/api/manuscripts/${manuscriptId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!manuscript) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Manuscript not found</p>
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