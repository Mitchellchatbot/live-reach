import { useState, useEffect } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const effectOptions = [
  { id: 'none', label: 'None', description: 'No animation' },
  { id: 'pulse', label: 'Pulse', description: 'Gentle glow pulse' },
  { id: 'bounce', label: 'Bounce', description: 'Playful bounce' },
  { id: 'wiggle', label: 'Wiggle', description: 'Side-to-side shake' },
  { id: 'ring', label: 'Ring', description: 'Ripple ring effect' },
  { id: 'heartbeat', label: 'Heartbeat', description: 'Double-beat pulse' },
] as const;

const intensityOptions = [
  { id: 'subtle', label: 'Subtle' },
  { id: 'medium', label: 'Medium' },
  { id: 'strong', label: 'Strong' },
] as const;

interface WidgetEffectsCardProps {
  propertyId: string | undefined;
  effectType: string;
  effectInterval: number;
  effectIntensity: string;
  onEffectTypeChange: (type: string) => void;
  onEffectIntervalChange: (interval: number) => void;
  onEffectIntensityChange: (intensity: string) => void;
}

export const WidgetEffectsCard = ({
  propertyId,
  effectType,
  effectInterval,
  effectIntensity,
  onEffectTypeChange,
  onEffectIntervalChange,
  onEffectIntensityChange,
}: WidgetEffectsCardProps) => {
  const [localType, setLocalType] = useState(effectType);
  const [localInterval, setLocalInterval] = useState(effectInterval);
  const [localIntensity, setLocalIntensity] = useState(effectIntensity);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalType(effectType);
    setLocalInterval(effectInterval);
    setLocalIntensity(effectIntensity);
    setHasChanges(false);
  }, [effectType, effectInterval, effectIntensity]);

  const updateLocal = (type: string, interval: number, intensity: string) => {
    setHasChanges(
      type !== effectType || interval !== effectInterval || intensity !== effectIntensity
    );
    // Live preview
    onEffectTypeChange(type);
    onEffectIntervalChange(interval);
    onEffectIntensityChange(intensity);
  };

  const handleSave = async () => {
    if (!propertyId) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('properties')
      .update({
        widget_effect_type: localType,
        widget_effect_interval_seconds: localInterval,
        widget_effect_intensity: localIntensity,
      })
      .eq('id', propertyId);
    setIsSaving(false);
    if (error) {
      toast.error('Failed to save effects');
      return;
    }
    setHasChanges(false);
    toast.success('Widget effects saved!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Launcher Effects
        </CardTitle>
        <CardDescription>
          Periodic animations on the chat button to grab attention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Effect Type */}
        <div className="space-y-2">
          <Label>Effect Style</Label>
          <div className="grid grid-cols-3 gap-2">
            {effectOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  setLocalType(opt.id);
                  updateLocal(opt.id, localInterval, localIntensity);
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all duration-200 gap-1",
                  localType === opt.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <span className="text-xs font-medium">{opt.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interval */}
        {localType !== 'none' && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Repeat Every</Label>
                <span className="text-sm text-muted-foreground font-mono">{localInterval}s</span>
              </div>
              <Slider
                value={[localInterval]}
                onValueChange={([v]) => {
                  setLocalInterval(v);
                  updateLocal(localType, v, localIntensity);
                }}
                min={3}
                max={30}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>3s (frequent)</span>
                <span>30s (rare)</span>
              </div>
            </div>

            {/* Intensity */}
            <div className="space-y-2">
              <Label>Intensity</Label>
              <div className="flex gap-2">
                {intensityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setLocalIntensity(opt.id);
                      updateLocal(localType, localInterval, opt.id);
                    }}
                    className={cn(
                      "flex-1 py-2 rounded-lg border-2 text-xs font-medium transition-all duration-200",
                      localIntensity === opt.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving || !propertyId}
          className="w-full"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Effects
        </Button>
      </CardContent>
    </Card>
  );
};
