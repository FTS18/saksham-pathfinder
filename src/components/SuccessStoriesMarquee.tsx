import { useEffect, useState } from 'react';

const successStories = [
  "🎉 Rahul from Delhi got placed at Google with ₹1.2L/month stipend!",
  "🚀 Priya from Mumbai secured Microsoft internship through our AI recommendations!",
  "💼 Amit from Bangalore landed Amazon internship with perfect skill match!",
  "🌟 Sneha from Pune got selected for Goldman Sachs finance internship!",
  "🎯 Vikash from Hyderabad found his dream AI/ML role at Meta!",
  "📈 Ananya from Chennai secured Netflix UI/UX internship!",
  "🔥 Rohan from Kolkata got Apple hardware engineering position!",
  "✨ Kavya from Jaipur landed Adobe design internship!",
  "🏆 Arjun from Chandigarh secured Intel VLSI internship!",
  "💡 Riya from Ahmedabad got selected for Microsoft Research!"
];

export const SuccessStoriesMarquee = () => {
  const [currentStory, setCurrentStory] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % successStories.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 py-4 overflow-hidden">
      <div className="animate-pulse">
        <div className="whitespace-nowrap animate-marquee">
          <span className="text-sm font-medium text-primary px-8">
            {successStories[currentStory]}
          </span>
        </div>
      </div>
    </div>
  );
};