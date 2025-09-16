import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

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
    }
  ]

  return (
    <section className="bg-secondary/50 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-12">Success Stories</h2>
            <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-xl mx-auto">
            <CarouselContent>
                {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                    <div className="p-1">
                    <Card className="minimal-card">
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
                </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            </Carousel>
        </div>
    </section>
  )
}
