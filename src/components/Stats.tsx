import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Briefcase, Users, CheckCircle } from "lucide-react";

export const Stats = () => {
  const stats = [
    { icon: Briefcase, value: "1,000+", label: "Internships Posted" },
    { icon: Users, value: "500+", label: "Companies Hiring" },
    { icon: CheckCircle, value: "10,000+", label: "Students Connected" },
  ];

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center minimal-card">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-4xl font-bold text-foreground">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
