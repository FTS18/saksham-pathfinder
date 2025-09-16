import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProfileForm } from '@/components/ProfileForm';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ProfileForm />
      <Footer />
    </div>
  );
};

export default Index;
