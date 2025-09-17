import { useState, useEffect } from 'react';
import { useWishlist } from "@/contexts/WishlistContext";
import { InternshipCard } from "@/components/InternshipCard";
import { Frown } from "lucide-react";
import { useTheme } from '@/contexts/ThemeContext';

const translations = {
    en: {
        title: "Your Wishlist",
        empty: "Your wishlist is empty. Start adding internships!"
    },
    hi: {
        title: "आपकी इच्छा-सूची",
        empty: "आपकी इच्छा-सूची खाली है। इंटर्नशिप जोड़ना शुरू करें!"
    }
}

export default function Wishlist() {
    const { wishlist } = useWishlist();
    const { language } = useTheme();
    const t = translations[language];
    const [wishlistedItems, setWishlistedItems] = useState<any[]>([]);
    const [allInternships, setAllInternships] = useState<any[]>([]);

    useEffect(() => {
        fetch('/internships.json')
          .then(response => response.json())
          .then(data => setAllInternships(data))
          .catch(error => console.error("Failed to load internships:", error));
    }, []);

    useEffect(() => {
        if (allInternships.length > 0) {
            setWishlistedItems(allInternships.filter(internship => wishlist.includes(internship.id)));
        }
    }, [wishlist, allInternships]);

    return (
        <div className="min-h-screen bg-background pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-racing mb-8 text-center sm:text-left">{t.title}</h1>
                {wishlistedItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistedItems.map(internship => (
                            <InternshipCard key={internship.id} internship={internship} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <Frown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">{t.empty}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
