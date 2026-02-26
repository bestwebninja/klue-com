import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { Phone, CheckCircle, Loader2, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhoneVerificationProps {
  onVerified: (phone: string) => void;
  userType: 'provider' | 'homeowner';
}

const PhoneVerification = ({ onVerified, userType }: PhoneVerificationProps) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState<'input' | 'verify' | 'verified'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  // Format phone: user enters without +44, we prepend it
  const getFullPhone = () => {
    let cleaned = phoneNumber.replace(/\s/g, '').replace(/^0/, '');
    return `+44${cleaned}`;
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    const fullPhone = getFullPhone();
    if (!/^\+44\d{10}$/.test(fullPhone)) {
      toast({
        title: 'Invalid phone number',
        description: 'Please enter a valid UK mobile number (10 digits after 0).',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms-verification', {
        body: { phone: fullPhone },
      });

      if (error) throw error;
      if (data?.error) {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      setStep('verify');
      setCountdown(60);
      toast({
        title: 'Code sent!',
        description: 'Check your phone for the verification code.',
      });
    } catch (err: any) {
      toast({
        title: 'Failed to send code',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (otpCode.length !== 6) return;

    setIsLoading(true);
    try {
      const fullPhone = getFullPhone();
      const { data, error } = await supabase.functions.invoke('verify-sms-code', {
        body: { phone: fullPhone, code: otpCode },
      });

      if (error) throw error;
      if (data?.error) {
        toast({
          title: 'Verification failed',
          description: data.error,
          variant: 'destructive',
        });
        return;
      }

      if (data?.verified) {
        setStep('verified');
        onVerified(fullPhone);
        toast({
          title: 'Phone verified!',
          description: 'Your mobile number has been verified successfully.',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Verification failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'verified') {
    return (
      <div className="space-y-2">
        <Label>Mobile Number</Label>
        <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {getFullPhone()} — Verified
            </p>
          </div>
        </div>
        {userType === 'homeowner' && (
          <div className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your mobile number will only be shared with a service provider when you accept their quote request.
            </p>
          </div>
        )}
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="space-y-3">
        <Label>Enter verification code</Label>
        <p className="text-xs text-muted-foreground">
          We sent a 6-digit code to <span className="font-medium text-foreground">{getFullPhone()}</span>
        </p>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={setOtpCode}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button
          type="button"
          onClick={handleVerifyCode}
          disabled={otpCode.length !== 6 || isLoading}
          className="w-full"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Code'
          )}
        </Button>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => { setStep('input'); setOtpCode(''); }}
            className="text-xs text-primary hover:underline"
          >
            Change number
          </button>
          <button
            type="button"
            onClick={handleSendCode}
            disabled={countdown > 0 || isLoading}
            className="text-xs text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
          >
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Mobile Number <span className="text-destructive">*</span></Label>
      <div className="flex gap-2">
        <div className="flex items-center px-3 bg-muted border border-input rounded-md text-sm text-muted-foreground">
          +44
        </div>
        <Input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9\s]/g, ''))}
          placeholder="7911 123456"
          className="flex-1"
        />
      </div>
      <Button
        type="button"
        onClick={handleSendCode}
        disabled={isLoading || !phoneNumber.trim()}
        variant="outline"
        size="sm"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending code...
          </>
        ) : (
          <>
            <Phone className="w-4 h-4 mr-2" />
            Send verification code
          </>
        )}
      </Button>
      {userType === 'homeowner' && (
        <div className="flex items-start gap-2 p-2.5 bg-muted/50 rounded-lg">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your mobile number will only be shared with a service provider when you accept their quote request.
          </p>
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;
