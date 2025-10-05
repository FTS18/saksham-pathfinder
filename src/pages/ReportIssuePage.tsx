import { useState } from "react";
import { Bug, MessageSquare, Lightbulb, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ReportIssuePage() {
  const [category, setCategory] = useState("bug");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const categories = [
    { value: "bug", label: "Bug Report", icon: Bug },
    { value: "feature", label: "Feature Request", icon: Lightbulb },
    { value: "feedback", label: "General Feedback", icon: MessageSquare },
    { value: "other", label: "Other", icon: AlertCircle },
  ];

  const submitReport = async () => {
    if (!description.trim()) {
      toast({ title: "Please describe the issue", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "feedback"), {
        userId: currentUser?.uid || "anonymous",
        userEmail: currentUser?.email || "anonymous",
        category,
        description,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date(),
        status: "open",
      });

      toast({ title: "Thank you for your feedback!", description: "We'll review it soon." });
      setDescription("");
    } catch (error) {
      toast({ title: "Failed to submit feedback", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Report an Issue</CardTitle>
          <p className="text-muted-foreground">Help us improve by reporting bugs or suggesting features</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Please describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={8}
            />
          </div>
          <Button onClick={submitReport} disabled={loading} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Submitting..." : "Submit Feedback"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
