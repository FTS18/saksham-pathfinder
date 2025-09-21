const successStories = [
  "🎉 RAHUL FROM DELHI GOT PLACED AT GOOGLE WITH ₹1.2L/MONTH STIPEND!",
  "🚀 PRIYA FROM MUMBAI SECURED MICROSOFT INTERNSHIP THROUGH OUR AI RECOMMENDATIONS!",
  "💼 AMIT FROM BANGALORE LANDED AMAZON INTERNSHIP WITH PERFECT SKILL MATCH!",
  "🌟 SNEHA FROM PUNE GOT SELECTED FOR GOLDMAN SACHS FINANCE INTERNSHIP!",
  "🎯 VIKASH FROM HYDERABAD FOUND HIS DREAM AI/ML ROLE AT META!",
  "📈 ANANYA FROM CHENNAI SECURED NETFLIX UI/UX INTERNSHIP!",
  "🔥 ROHAN FROM KOLKATA GOT APPLE HARDWARE ENGINEERING POSITION!",
  "✨ KAVYA FROM JAIPUR LANDED ADOBE DESIGN INTERNSHIP!",
  "🏆 ARJUN FROM CHANDIGARH SECURED INTEL VLSI INTERNSHIP!",
  "💡 RIYA FROM AHMEDABAD GOT SELECTED FOR MICROSOFT RESEARCH!"
];

export const SuccessStoriesMarquee = () => {
  return (
    <div className="bg-white dark:bg-black py-4 overflow-hidden transition-colors duration-300">
      <div className="whitespace-nowrap animate-marquee-fast">
        {successStories.map((story, index) => (
          <span key={index} className="text-xs font-grotesk font-medium text-black dark:text-white px-16 italic transition-colors duration-300">
            {story}
          </span>
        ))}
      </div>
    </div>
  );
};