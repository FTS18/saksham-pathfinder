import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      { q: "How do I create an account?", a: "Click on 'Sign Up' in the top right corner, then choose to sign up with Google or email. Complete the 4-step onboarding process to set up your profile." },
      { q: "What is the onboarding process?", a: "Our simplified onboarding has 4 steps: Basic Info, Education & Skills, Preferences, and Profile Photo. It takes just 2-3 minutes to complete." },
      { q: "Is Saksham AI free to use?", a: "Yes! Saksham AI is completely free for students. You can browse internships, apply, and use all features at no cost." },
      { q: "What makes Saksham AI different?", a: "Saksham AI uses advanced AI algorithms to match you with internships based on your skills, preferences, and career goals. We provide personalized recommendations, skill gap analysis, and career guidance." }
    ]
  },
  {
    category: "Internship Applications",
    questions: [
      { q: "How do I apply for an internship?", a: "Click on any internship card, review the details, and click 'Apply Now'. You can track all your applications in the Applications page." },
      { q: "Can I withdraw my application?", a: "Yes, go to the Applications page, find your application, and click 'Withdraw'. Note that this action cannot be undone." },
      { q: "How does the AI matching work?", a: "Our AI analyzes your skills, preferences, and profile to match you with relevant internships. Skills account for 50% of the match score, with additional bonuses for tier 1 companies like Google, Microsoft, and Amazon." },
      { q: "Can I apply to multiple internships?", a: "Yes! You can apply to as many internships as you want. We recommend applying to 10-15 positions to increase your chances of success." },
      { q: "How long does the application process take?", a: "Application timelines vary by company. Most companies respond within 2-4 weeks. You can track your application status in real-time on the Applications page." }
    ]
  },
  {
    category: "About Us & Our Mission",
    questions: [
      { q: "Who is behind Saksham AI?", a: "Saksham AI is developed by Team HexaForces, a group of passionate developers and educators committed to empowering students in India with AI-driven career guidance and internship opportunities." },
      { q: "What is your mission?", a: "Our mission is to democratize access to quality internship opportunities for all students in India, regardless of their background, location, or institution. We believe every student deserves a fair chance to launch their career." },
      { q: "How do you select internship opportunities?", a: "We aggregate internships from verified companies, government programs (like PM Internship Scheme), and trusted job portals. Each listing is reviewed to ensure legitimacy and quality." },
      { q: "Do you work with companies directly?", a: "Yes, we partner with companies across various sectors to bring exclusive internship opportunities to our platform. We also integrate with government initiatives and established job platforms." }
    ]
  },
  {
    category: "Privacy & Data Security",
    questions: [
      { q: "How do you protect my personal data?", a: "We use industry-standard encryption (Firebase Authentication) to protect your data. Your information is stored securely on Google Cloud servers with enterprise-grade security measures including XSS prevention, input sanitization, and SSRF protection." },
      { q: "What data do you collect?", a: "We collect only essential information: name, email, education details, skills, and preferences. We also track your application history and wishlist to provide personalized recommendations. We never sell your data to third parties." },
      { q: "Can I delete my account and data?", a: "Yes! You have full control over your data. Go to Settings > Account > Delete Account to permanently remove all your data from our servers. This action is irreversible." },
      { q: "Do you share my data with companies?", a: "We only share your application details (resume, profile) with companies you explicitly apply to. We never share your data with third parties for marketing purposes without your consent." },
      { q: "Is my data synced across devices?", a: "Yes, when you're logged in, your preferences, wishlist, applications, and settings are automatically synced across all your devices using secure cloud storage." },
      { q: "How long do you retain my data?", a: "We retain your data as long as your account is active. If you delete your account, all data is permanently removed within 30 days. Application history may be retained for legal compliance purposes." }
    ]
  },
  {
    category: "Platform Features",
    questions: [
      { q: "What is the AI Score?", a: "The AI Score (1-100) indicates how well an internship matches your profile. Scores above 80 are excellent matches, 70-80 are great, 60-70 are good, and below 60 are fair matches." },
      { q: "How do I use the wishlist?", a: "Click the bookmark icon on any internship card to save it to your wishlist. Access your saved internships anytime from the Wishlist page in the sidebar." },
      { q: "Can I compare internships?", a: "Yes! Click the compare icon on internship cards to add them to comparison. You can compare up to 3 internships side-by-side to make informed decisions." },
      { q: "What are the theme options?", a: "Saksham AI offers 5 color themes (Blue, Grey, Red, Yellow, Green) and light/dark modes. Your theme preference syncs across all your devices automatically." },
      { q: "Is there a mobile app?", a: "Saksham AI is a Progressive Web App (PWA). You can install it on your mobile device for an app-like experience with offline capabilities and push notifications." },
      { q: "What languages are supported?", a: "Currently, we support English and Hindi with Google Translate integration. We're working on adding more Indian languages including Tamil, Telugu, Bengali, and more." }
    ]
  },
  {
    category: "Policies & Guidelines",
    questions: [
      { q: "What is your refund policy?", a: "Saksham AI is completely free for students, so there are no refunds applicable. All features and services are provided at no cost." },
      { q: "What are the terms of service?", a: "By using Saksham AI, you agree to use the platform responsibly, provide accurate information, and not engage in fraudulent activities. Full terms are available in our Terms of Service page." },
      { q: "How do you handle inappropriate content?", a: "We have a zero-tolerance policy for spam, harassment, or fraudulent listings. Users can report issues using the 'Report Issue' feature. Our team reviews and takes action within 24-48 hours." },
      { q: "Can recruiters post internships?", a: "Yes! Recruiters can create an account, verify their company, and post internship opportunities. We review all postings to ensure quality and legitimacy." },
      { q: "What is your content moderation policy?", a: "All user-generated content (reviews, feedback) is moderated to ensure it's respectful and relevant. We remove spam, offensive language, and misleading information promptly." }
    ]
  },
  {
    category: "Technical Support",
    questions: [
      { q: "I'm having trouble logging in. What should I do?", a: "Try clearing your browser cache and cookies. If using Google Sign-In, ensure you're using the correct Google account. For persistent issues, contact us via the Report Issue page." },
      { q: "The website is loading slowly. How can I fix this?", a: "Slow loading can be due to internet connection or browser cache. Try refreshing the page, clearing cache, or using a different browser. We recommend Chrome or Firefox for best performance." },
      { q: "Can I use Saksham AI on my phone?", a: "Yes! Saksham AI is fully responsive and works on all devices. For the best mobile experience, install it as a PWA by clicking 'Add to Home Screen' in your browser menu." },
      { q: "How do I report a bug or issue?", a: "Click on 'Report Issue' in the sidebar, select the issue category (Bug, Feature Request, Feedback), describe the problem, and submit. Our team will respond within 24-48 hours." },
      { q: "Do you offer customer support?", a: "Yes! We provide support through the Report Issue feature, email, and our community forums. For urgent issues, use the Report Issue page with 'Bug' category for fastest response." }
    ]
  }
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
           q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-racing font-bold mb-2">Frequently Asked Questions</h1>
        <p className="text-muted-foreground">Find answers to common questions about Saksham AI - Platform, Privacy, Policies & More</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredFaqs.map((category, catIndex) => (
          <div key={catIndex}>
            <h2 className="text-2xl font-racing font-semibold mb-4">{category.category}</h2>
            <div className="space-y-2">
              {category.questions.map((faq, qIndex) => {
                const id = `${catIndex}-${qIndex}`;
                return (
                  <Card key={id} className="overflow-hidden">
                    <button
                      onClick={() => toggleItem(id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className="font-medium">{faq.q}</span>
                      <ChevronDown className={`h-5 w-5 transition-transform flex-shrink-0 ml-2 ${openItems.includes(id) ? 'rotate-180' : ''}`} />
                    </button>
                    {openItems.includes(id) && (
                      <div className="px-4 pb-4">
                        <p className="text-muted-foreground">{faq.a}</p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {filteredFaqs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No questions found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
