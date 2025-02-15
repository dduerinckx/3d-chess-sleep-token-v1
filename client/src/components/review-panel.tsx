import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@shared/schema";
import { Wand2, Star, Loader2 } from "lucide-react";

interface ReviewAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  overallRating: number;
  confidenceScore: number;
}

export function ReviewPanel({ manuscriptId }: { manuscriptId: number }) {
  const { toast } = useToast();
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: [`/api/manuscripts/${manuscriptId}/reviews`],
  });

  const generateReviewMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/manuscripts/${manuscriptId}/review`,
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/manuscripts/${manuscriptId}/reviews`],
      });
      toast({
        title: "Review Generated",
        description: "AI analysis has been completed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate review",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectedReview = reviews?.find(
    (review) => review.id === selectedReviewId,
  );
  const analysis = selectedReview?.analysis as ReviewAnalysis | undefined;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-none">
        <div className="flex justify-between items-center">
          <CardTitle>AI Review</CardTitle>
          <Button
            onClick={() => generateReviewMutation.mutate()}
            disabled={generateReviewMutation.isPending}
          >
            {generateReviewMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Review
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {isLoadingReviews ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews?.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
            <Wand2 className="h-12 w-12" />
            <p>No reviews yet. Generate one to get AI-powered feedback!</p>
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {!selectedReview ? (
                <div className="grid gap-4">
                  {reviews?.map((review) => (
                    <Card
                      key={review.id}
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => setSelectedReviewId(review.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {new Date(
                                review.createdAt,
                              ).toLocaleDateString()}
                            </Badge>
                            <div className="flex">
                              {Array.from(
                                { length: (review.analysis as ReviewAnalysis)
                                  .overallRating },
                                (_, i) => (
                                  <Star
                                    key={i}
                                    className="h-4 w-4 text-yellow-400 fill-current"
                                  />
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedReviewId(null)}
                  >
                    ← Back to all reviews
                  </Button>

                  <div className="prose prose-sm">
                    <h3>Summary</h3>
                    <p>{analysis?.summary}</p>

                    <Accordion type="single" collapsible>
                      <AccordionItem value="strengths">
                        <AccordionTrigger>Strengths</AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            {analysis?.strengths.map((strength, i) => (
                              <li key={i}>{strength}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="weaknesses">
                        <AccordionTrigger>Areas for Improvement</AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            {analysis?.weaknesses.map((weakness, i) => (
                              <li key={i}>{weakness}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>

                      <AccordionItem value="suggestions">
                        <AccordionTrigger>Suggestions</AccordionTrigger>
                        <AccordionContent>
                          <ul>
                            {analysis?.suggestions.map((suggestion, i) => (
                              <li key={i}>{suggestion}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
                      <div>
                        Overall Rating:{" "}
                        <span className="font-medium">
                          {analysis?.overallRating || 0}/5
                        </span>
                      </div>
                      <div>
                        Confidence Score:{" "}
                        <span className="font-medium">
                          {analysis?.confidenceScore !== undefined
                            ? Math.round(analysis.confidenceScore * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}