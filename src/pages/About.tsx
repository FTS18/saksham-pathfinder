import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Zap, Heart } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const translations = {
  en: {
    title: 'About Saksham AI',
    subtitle: 'Empowering students with intelligent career guidance',
    mission: 'Our Mission',
    missionText: 'To democratize access to quality internship opportunities by leveraging AI technology to match students with roles that align with their skills, interests, and career aspirations.',
    vision: 'Our Vision',
    visionText: 'A world where every student, regardless of their background, has equal access to meaningful career opportunities that help them grow and succeed.',
    values: 'Our Values',
    valuesData: [
      {
        icon: Target,
        title: 'Precision',
        description: 'AI-powered matching that understands your unique profile and career goals.'
      },
      {
        icon: Users,
        title: 'Inclusivity',
        description: 'Designed for all students, especially first-generation learners entering the workforce.'
      },
      {
        icon: Zap,
        title: 'Innovation',
        description: 'Cutting-edge technology that evolves with your needs and market trends.'
      },
      {
        icon: Heart,
        title: 'Empathy',
        description: 'Understanding the challenges students face and providing supportive guidance.'
      }
    ],
    team: 'Meet Our Team',
    teamText: 'HexaCoders is a passionate team of developers and designers committed to creating technology that makes a difference in students\' lives.',
    members: 'Ananay, Aditya, Vansham, Aniket, Riya, Bhavya'
  },
  hi: {
    title: 'सक्षम AI के बारे में',
    subtitle: 'बुद्धिमान करियर मार्गदर्शन के साथ छात्रों को सशक्त बनाना',
    mission: 'हमारा मिशन',
    missionText: 'AI तकनीक का लाभ उठाकर गुणवत्तापूर्ण इंटर्नशिप अवसरों तक पहुंच को लोकतांत्रिक बनाना, छात्रों को उनके कौशल, रुचियों और करियर आकांक्षाओं के अनुरूप भूमिकाओं से मिलाना।',
    vision: 'हमारी दृष्टि',
    visionText: 'एक ऐसी दुनिया जहां हर छात्र, उनकी पृष्ठभूमि की परवाह किए बिना, सार्थक करियर अवसरों तक समान पहुंच रखता है जो उन्हें बढ़ने और सफल होने में मदद करते हैं।',
    values: 'हमारे मूल्य',
    valuesData: [
      {
        icon: Target,
        title: 'सटीकता',
        description: 'AI-संचालित मैचिंग जो आपकी अनूठी प्रोफाइल और करियर लक्ष्यों को समझती है।'
      },
      {
        icon: Users,
        title: 'समावेशिता',
        description: 'सभी छात्रों के लिए डिज़ाइन किया गया, विशेष रूप से पहली पीढ़ी के शिक्षार्थियों के लिए।'
      },
      {
        icon: Zap,
        title: 'नवाचार',
        description: 'अत्याधुनिक तकनीक जो आपकी जरूरतों और बाजार के रुझानों के साथ विकसित होती है।'
      },
      {
        icon: Heart,
        title: 'सहानुभूति',
        description: 'छात्रों की चुनौतियों को समझना और सहायक मार्गदर्शन प्रदान करना।'
      }
    ],
    team: 'हमारी टीम से मिलें',
    teamText: 'HexaCoders डेवलपर्स और डिज़ाइनरों की एक भावुक टीम है जो छात्रों के जीवन में बदलाव लाने वाली तकनीक बनाने के लिए प्रतिबद्ध है।',
    members: 'अनन्य, आदित्य, वंशम, अनिकेत, रिया, भाव्या'
  }
};

export default function About() {
  const { language } = useTheme();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-poppins font-bold text-foreground mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <h2 className="text-2xl font-poppins font-semibold text-foreground mb-4">
                {t.mission}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.missionText}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift">
            <CardContent className="p-6">
              <h2 className="text-2xl font-poppins font-semibold text-foreground mb-4">
                {t.vision}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.visionText}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-poppins font-bold text-foreground text-center mb-12">
            {t.values}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {t.valuesData.map((value, index) => (
              <Card key={index} className="glass-card hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Team */}
        <Card className="glass-card">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-poppins font-bold text-foreground mb-4">
              {t.team}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              {t.teamText}
            </p>
            <div className="inline-block">
              <div className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full font-semibold">
                {t.members}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}