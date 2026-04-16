import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SettingsState } from '../types';

type SettingsModalProps = {
  open: boolean;
  settings: SettingsState;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: SettingsState) => void;
};

export function SettingsModal({ open, settings, onOpenChange, onSave }: SettingsModalProps) {
  const setNumber = (key: keyof SettingsState, value: string) => {
    const parsed = Number(value);
    onSave({
      ...settings,
      [key]: Number.isFinite(parsed) ? parsed : 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border-border/60 bg-card text-foreground sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">CleanScope AI v5.0 Settings</DialogTitle>
          <DialogDescription>
            Configure labor, direct costs, and margin controls used by pricing and quick quotes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
            <Input
              id="laborRate"
              type="number"
              value={settings.laborRate}
              onChange={(e) => setNumber('laborRate', e.target.value)}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherDirect">Other Direct Costs ($ per visit)</Label>
            <Input
              id="otherDirect"
              type="number"
              value={settings.otherDirect}
              onChange={(e) => setNumber('otherDirect', e.target.value)}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="suppliesPercent">Supplies %</Label>
            <Input
              id="suppliesPercent"
              type="number"
              value={settings.suppliesPercent}
              onChange={(e) => setNumber('suppliesPercent', e.target.value)}
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overheadPercent">Overhead %</Label>
            <Input
              id="overheadPercent"
              type="number"
              value={settings.overheadPercent}
              onChange={(e) => setNumber('overheadPercent', e.target.value)}
              className="rounded-2xl"
            />
            <p className="text-xs text-muted-foreground">
              Covers insurance, vehicles, admin, training, compliance, and bad debt allowances.
            </p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profitPercent">Profit %</Label>
            <Input
              id="profitPercent"
              type="number"
              value={settings.profitPercent}
              onChange={(e) => setNumber('profitPercent', e.target.value)}
              className="rounded-2xl"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-2xl" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
