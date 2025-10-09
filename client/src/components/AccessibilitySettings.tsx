
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility } from '@/components/AccessibilityProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Volume2, 
  Mic, 
  Eye, 
  Type, 
  Palette, 
  Zap, 
  Languages,
  RotateCcw 
} from 'lucide-react';

export function AccessibilitySettings() {
  const { t, i18n } = useTranslation();
  const { preferences, updatePreference, resetPreferences } = useAccessibility();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Language & Localization
          </CardTitle>
          <CardDescription>
            Choose your preferred language and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select
              value={i18n.language}
              onValueChange={(value) => i18n.changeLanguage(value)}
            >
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Preferences
          </CardTitle>
          <CardDescription>
            Customize the visual appearance for better readability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduce-motion"
              checked={preferences.reduceMotion}
              onCheckedChange={(checked) => updatePreference('reduceMotion', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="simplified-visuals">Simplified Visuals</Label>
              <p className="text-sm text-muted-foreground">
                Reduce visual complexity for clearer focus
              </p>
            </div>
            <Switch
              id="simplified-visuals"
              checked={preferences.simplifiedVisuals}
              onCheckedChange={(checked) => updatePreference('simplifiedVisuals', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast</Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => updatePreference('highContrast', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <Select
              value={preferences.fontSize}
              onValueChange={(value: 'default' | 'large' | 'xlarge') => 
                updatePreference('fontSize', value)
              }
            >
              <SelectTrigger id="font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="xlarge">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Reading & Comprehension
          </CardTitle>
          <CardDescription>
            Adjust content presentation for better understanding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dyslexic-font">Dyslexia-Friendly Font</Label>
              <p className="text-sm text-muted-foreground">
                Use OpenDyslexic font for easier reading
              </p>
            </div>
            <Switch
              id="dyslexic-font"
              checked={preferences.dyslexicFont}
              onCheckedChange={(checked) => updatePreference('dyslexicFont', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="literal-language">Literal Language</Label>
              <p className="text-sm text-muted-foreground">
                Reduce metaphors and use clear, direct language
              </p>
            </div>
            <Switch
              id="literal-language"
              checked={preferences.literalLanguage}
              onCheckedChange={(checked) => updatePreference('literalLanguage', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio Features
          </CardTitle>
          <CardDescription>
            Enable audio input and output options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="text-to-speech">Text-to-Speech</Label>
              <p className="text-sm text-muted-foreground">
                Read AI responses aloud
              </p>
            </div>
            <Switch
              id="text-to-speech"
              checked={preferences.textToSpeech}
              onCheckedChange={(checked) => updatePreference('textToSpeech', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="voice-input">Voice Input</Label>
              <p className="text-sm text-muted-foreground">
                Use voice to chat with Bliss
              </p>
            </div>
            <Switch
              id="voice-input"
              checked={preferences.voiceInput}
              onCheckedChange={(checked) => updatePreference('voiceInput', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={resetPreferences}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
