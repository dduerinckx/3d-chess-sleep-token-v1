import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Manuscript } from "@shared/schema";
import { Save, Loader2 } from "lucide-react";
import { FileUpload } from "./file-upload";

export function ManuscriptEditor({ manuscript }: { manuscript: Manuscript }) {
  const [title, setTitle] = useState(manuscript.title);
  const { toast } = useToast();

  const editor = useEditor({
    extensions: [StarterKit],
    content: manuscript.content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none",
      },
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", `/api/manuscripts/${manuscript.id}`, {
        title,
        content: editor?.getHTML() || "",
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/manuscripts/${manuscript.id}`],
      });
      toast({
        title: "Saved",
        description: "Your manuscript has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (content: string) => {
    if (editor) {
      editor.commands.setContent(content);
      saveMutation.mutate();
    }
  };

  return (
    <Card className="min-h-[600px] flex flex-col">
      <CardHeader className="flex-none space-y-4">
        <div className="flex items-center gap-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold"
            placeholder="Manuscript Title"
          />
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
        <FileUpload onUploadComplete={handleFileUpload} />
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <EditorContent editor={editor} className="h-full" />
      </CardContent>
    </Card>
  );
}