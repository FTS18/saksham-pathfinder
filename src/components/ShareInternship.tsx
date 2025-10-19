import { Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { FaTwitter, FaLinkedin, FaWhatsapp, FaFacebook } from "react-icons/fa";
import { copyToClipboard } from "@/utils/clipboardUtils";

interface ShareInternshipProps {
  internship: {
    id: string;
    title: string;
    company: string;
  };
}

export const ShareInternship = ({ internship }: ShareInternshipProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/internship/${internship.id}`;
  const shareText = `Check out this internship: ${internship.title} at ${internship.company}`;

  const copyLink = async () => {
    try {
      const success = await copyToClipboard(shareUrl);
      if (success) {
        setCopied(true);
        toast({ title: "Link copied to clipboard!" });
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast({ title: "Failed to copy link", description: "Please try using a different method", variant: "destructive" });
      }
    } catch (error) {
      console.error('Copy error:', error);
      toast({ title: "Failed to copy link", description: "Please try using a different method", variant: "destructive" });
    }
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="h-8 w-8 p-0 bg-muted hover:bg-muted/80 text-muted-foreground rounded-full shadow-md hover:shadow-lg transition-all active:scale-95">
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={copyLink}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToWhatsApp}>
          <FaWhatsapp className="h-4 w-4 mr-2" />
          WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter}>
          <FaTwitter className="h-4 w-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToLinkedIn}>
          <FaLinkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <FaFacebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaEmail}>
          <span className="h-4 w-4 mr-2">✉️</span>
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
