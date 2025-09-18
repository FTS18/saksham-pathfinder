import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, Phone } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  id: string;
  branch: string;
  email: string;
  phone: string;
}

interface TeamCardProps {
  member: TeamMember;
}

export const TeamCard = ({ member }: TeamCardProps) => {
  return (
    <Card className="glass-card hover:scale-105 transition-all duration-300 w-full max-w-sm mx-auto">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold text-primary">
              {member.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          
          {/* Name & Role */}
          <div>
            <h3 className="text-xl font-bold text-foreground">{member.name}</h3>
            <p className="text-primary font-medium">{member.role}</p>
          </div>
          
          {/* Details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="outline" className="text-xs">
                ID: {member.id}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {member.branch}
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="text-xs break-all truncate max-w-full">{member.email}</span>
            </div>
            
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span className="text-xs">{member.phone}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};