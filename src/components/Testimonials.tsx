import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useEffect, useState } from 'react';

export function Testimonials() {
  const testimonials = [
    {
      name: "Ravi Kumar",
      location: "Delhi",
      story: "Saksham AI helped me find my first internship at a startup. The personalized recommendations were spot on!",
      avatar: "https://i.pravatar.cc/150?u=ravi"
    },
    {
      name: "Priya Singh",
      location: "Mumbai",
      story: "As a first-generation college student, I was lost. Saksham AI guided me through the process and I landed a great finance internship.",
      avatar: "https://i.pravatar.cc/150?u=priya"
    },
    {
      name: "Amit Patel",
      location: "Bangalore",
      story: "The platform is so easy to use. I found and applied to my dream tech internship in just a few clicks.",
      avatar: "https://i.pravatar.cc/150?u=amit"
    },
    {
      name: "Sneha Sharma",
      location: "Pune",
      story: "Got my dream design internship through Saksham AI. The AI matching was incredibly accurate!",
      avatar: "https://i.pravatar.cc/150?u=sneha"
    },
    {
      name: "Vikash Gupta",
      location: "Hyderabad",
      story: "From profile creation to landing my ML internship - everything was seamless and intuitive.",
      avatar: "https://i.pravatar.cc/150?u=vikash"
    }
  ]

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="bg-secondary/50 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-12">Success Stories</h2>
            <div className="relative overflow-hidden">
                <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="w-full flex-shrink-0">
                            <Card className="minimal-card mx-4">
                                <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                                    <Avatar>
                                        <AvatarImage src={testimonial.avatar} />
                                        <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <p className="text-muted-foreground italic">"{testimonial.story}"</p>
                                    <span className="font-semibold text-foreground">{testimonial.name}, {testimonial.location}</span>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center mt-6 space-x-2">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentIndex ? 'bg-primary' : 'bg-primary/30'
                            }`}
                            onClick={() => setCurrentIndex(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    </section>
  )
}
