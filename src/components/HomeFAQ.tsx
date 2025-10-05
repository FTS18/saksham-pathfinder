import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const topFaqs = [
  { q: "How do I create an account?", a: "Click 'Sign Up' in the top right, choose Google or email signup, and complete our quick 4-step onboarding." },
  { q: "How does AI matching work?", a: "Our AI analyzes your skills, preferences, and profile to match you with relevant internships. Skills account for 50% of the match score." },
  { q: "Is Saksham AI free?", a: "Yes! Completely free for students. Browse, apply, and use all features at no cost." },
  { q: "How do I apply for internships?", a: "Click any internship card, review details, and click 'Apply Now'. Track all applications in the Applications page." },
  { q: "Can I save internships for later?", a: "Yes! Click the bookmark icon on any internship card to add it to your Wishlist." }
];

export const HomeFAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-racing font-bold mb-2">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Quick answers to common questions</p>
        </div>

        <div className="space-y-3 mb-8">
          {topFaqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
              >
                <span className="font-medium pr-4">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 flex-shrink-0 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === index && (
                <div className="px-4 pb-4">
                  <p className="text-muted-foreground">{faq.a}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button onClick={() => navigate('/faq')} variant="outline" size="lg">
            View All FAQs
          </Button>
        </div>
      </div>
    </section>
  );
};
