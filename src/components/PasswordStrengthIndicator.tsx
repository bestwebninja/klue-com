import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const requirements = useMemo(() => {
    return [
      { label: '8+ characters', met: password.length >= 8 },
      { label: 'Uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'Number', met: /[0-9]/.test(password) },
      { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((r) => r.met).length;
    if (metCount === 0) return { label: '', color: '', width: '0%' };
    if (metCount === 1) return { label: 'Weak', color: 'bg-destructive', width: '25%' };
    if (metCount === 2) return { label: 'Fair', color: 'bg-orange-500', width: '50%' };
    if (metCount === 3) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  }, [requirements]);

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Password strength</span>
        <span className={`font-medium ${
          strength.label === 'Weak' ? 'text-destructive' :
          strength.label === 'Fair' ? 'text-orange-500' :
          strength.label === 'Good' ? 'text-yellow-600' :
          strength.label === 'Strong' ? 'text-green-600' : ''
        }`}>
          {strength.label}
        </span>
      </div>
      
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${strength.color}`}
          style={{ width: strength.width }}
        />
      </div>

      <div className="grid grid-cols-2 gap-1.5 mt-2">
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-1.5 text-xs">
            {req.met ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <X className="w-3 h-3 text-muted-foreground" />
            )}
            <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
