import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

const translations = {
  en: {
    title: 'Get in Touch',
    subtitle: 'Have questions? We\'d love to hear from you.',
    form: {
      name: 'Name',
      namePlaceholder: 'Your full name',
      email: 'Email',
      emailPlaceholder: 'your.email@example.com',
      subject: 'Subject',
      subjectPlaceholder: 'What is this about?',
      message: 'Message',
      messagePlaceholder: 'Tell us how we can help you...',
      submit: 'Send Message'
    },
    contact: {
      title: 'Contact Information',
      email: 'team@sakshamai.com',
      phone: '+91 98765 43210',
      address: 'Mumbai, Maharashtra, India'
    },
    success: 'Message sent successfully!',
    successDesc: 'We\'ll get back to you as soon as possible.'
  },
  hi: {
    title: 'संपर्क में रहें',
    subtitle: 'कोई प्रश्न है? हम आपसे सुनना पसंद करेंगे।',
    form: {
      name: 'नाम',
      namePlaceholder: 'आपका पूरा नाम',
      email: 'ईमेल',
      emailPlaceholder: 'your.email@example.com',
      subject: 'विषय',
      subjectPlaceholder: 'यह किस बारे में है?',
      message: 'संदेश',
      messagePlaceholder: 'हमें बताएं कि हम आपकी कैसे मदद कर सकते हैं...',
      submit: 'संदेश भेजें'
    },
    contact: {
      title: 'संपर्क जानकारी',
      email: 'team@sakshamai.com',
      phone: '+91 98765 43210',
      address: 'मुंबई, महाराष्ट्र, भारत'
    },
    success: 'संदेश सफलतापूर्वक भेजा गया!',
    successDesc: 'हम जल्द से जल्द आपसे संपर्क करेंगे।'
  }
};

export default function Contact() {
  const { language } = useTheme();
  const { toast } = useToast();
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Store message locally for demo
    const message = {
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    existingMessages.push(message);
    localStorage.setItem('contactMessages', JSON.stringify(existingMessages));

    toast({
      title: t.success,
      description: t.successDesc,
    });

    setIsSubmitting(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: t.contact.email,
      href: `mailto:${t.contact.email}`
    },
    {
      icon: Phone,
      label: 'Phone',
      value: t.contact.phone,
      href: `tel:${t.contact.phone}`
    },
    {
      icon: MapPin,
      label: 'Location',
      value: t.contact.address,
      href: '#'
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-racing font-bold text-foreground mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-2xl font-racing">
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.form.name}</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder={t.form.namePlaceholder}
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">{t.form.email}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t.form.emailPlaceholder}
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{t.form.subject}</Label>
                    <Input
                      id="subject"
                      type="text"
                      placeholder={t.form.subjectPlaceholder}
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{t.form.message}</Label>
                    <Textarea
                      id="message"
                      placeholder={t.form.messagePlaceholder}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="min-h-[120px] resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 text-lg font-semibold rounded-lg shadow-button hover-lift"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>{t.form.submit}</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-xl font-racing">
                  {t.contact.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      {item.href && item.href !== '#' ? (
                        <a
                          href={item.href}
                          className="text-foreground hover:text-primary transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-foreground">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Quick Support</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="mailto:support@sakshamai.com">
                      <Mail className="w-4 h-4 mr-2" />
                      Technical Support
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="mailto:feedback@sakshamai.com">
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
