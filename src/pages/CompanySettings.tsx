import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Save, Building2, User, Bot, Palette, MessageSquare, Zap, AlertTriangle } from "lucide-react";
import { defaultSettings, type CompanySettings as CompanySettingsType, type ProviderModel, type MessengerType } from "@/data/clawEmpireData";
import { useToast } from "@/hooks/use-toast";

export default function CompanySettings() {
  const [settings, setSettings] = useState<CompanySettingsType>(defaultSettings);
  const { toast } = useToast();

  const update = <K extends keyof CompanySettingsType>(key: K, value: CompanySettingsType[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const save = () => {
    toast({ title: "Settings Saved", description: "Company configuration updated successfully" });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-pixel text-lg text-primary">⚙️ Company Settings</h1>
            <p className="font-pixel-body text-lg text-muted-foreground">
              Configure company, providers, and integrations
            </p>
          </div>
          <Button className="font-pixel text-[9px]" onClick={save}>
            <Save className="h-4 w-4 mr-1" /> Save Changes
          </Button>
        </div>

        <ScrollArea className="h-[72vh]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Company Info */}
            <Card className="pixel-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="font-pixel text-[10px] flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Company Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div>
                  <Label className="font-pixel text-[8px]">Company Name</Label>
                  <Input
                    className="font-pixel-body mt-1"
                    value={settings.companyName}
                    onChange={e => update("companyName", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-pixel text-[8px]">CEO Name</Label>
                    <Input
                      className="font-pixel-body mt-1"
                      value={settings.ceoName}
                      onChange={e => update("ceoName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="font-pixel text-[8px]">CEO Avatar</Label>
                    <Input
                      className="font-pixel-body mt-1"
                      value={settings.ceoAvatar}
                      onChange={e => update("ceoAvatar", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Automation */}
            <Card className="pixel-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="font-pixel text-[10px] flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" /> Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-pixel text-[9px]">Auto-Assign Tasks</p>
                    <p className="font-pixel-body text-xs text-muted-foreground">Automatically route tasks to available agents</p>
                  </div>
                  <Switch checked={settings.autoAssign} onCheckedChange={v => update("autoAssign", v)} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-pixel text-[9px] flex items-center gap-1">
                      YOLO Mode <AlertTriangle className="h-3 w-3 text-destructive" />
                    </p>
                    <p className="font-pixel-body text-xs text-muted-foreground">Skip approvals — agents execute immediately</p>
                  </div>
                  <Switch checked={settings.yoloMode} onCheckedChange={v => update("yoloMode", v)} />
                </div>
                <Separator />
                <div>
                  <Label className="font-pixel text-[8px]">Max Concurrent Agents</Label>
                  <Input
                    type="number"
                    className="font-pixel-body mt-1"
                    value={settings.maxConcurrentAgents}
                    onChange={e => update("maxConcurrentAgents", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label className="font-pixel text-[8px]">Daily Budget Limit ($)</Label>
                  <Input
                    type="number"
                    className="font-pixel-body mt-1"
                    value={settings.dailyBudgetLimit}
                    onChange={e => update("dailyBudgetLimit", parseInt(e.target.value) || 0)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Provider Config */}
            <Card className="pixel-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="font-pixel text-[10px] flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" /> Provider Config
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div>
                  <Label className="font-pixel text-[8px]">Primary Provider</Label>
                  <Select value={settings.primaryProvider} onValueChange={v => update("primaryProvider", v as ProviderModel)}>
                    <SelectTrigger className="font-pixel-body mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-4">Claude 4</SelectItem>
                      <SelectItem value="gemini-2">Gemini 2</SelectItem>
                      <SelectItem value="gpt-5">GPT-5</SelectItem>
                      <SelectItem value="opencode">OpenCode</SelectItem>
                      <SelectItem value="local-llm">Local LLM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-pixel text-[8px]">Fallback Provider</Label>
                  <Select value={settings.fallbackProvider} onValueChange={v => update("fallbackProvider", v as ProviderModel)}>
                    <SelectTrigger className="font-pixel-body mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="claude-4">Claude 4</SelectItem>
                      <SelectItem value="gemini-2">Gemini 2</SelectItem>
                      <SelectItem value="gpt-5">GPT-5</SelectItem>
                      <SelectItem value="opencode">OpenCode</SelectItem>
                      <SelectItem value="local-llm">Local LLM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="font-pixel text-[8px]">Auto-Report Frequency</Label>
                  <Select value={settings.autoReportFrequency} onValueChange={v => update("autoReportFrequency", v as CompanySettingsType["autoReportFrequency"])}>
                    <SelectTrigger className="font-pixel-body mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Messenger & Theme */}
            <Card className="pixel-border">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="font-pixel text-[10px] flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-secondary" /> Messenger & Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div>
                  <Label className="font-pixel text-[8px]">Messenger Integration</Label>
                  <Select value={settings.messenger} onValueChange={v => update("messenger", v as MessengerType)}>
                    <SelectTrigger className="font-pixel-body mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {settings.messenger !== "none" && (
                  <div>
                    <Label className="font-pixel text-[8px]">Session ID / Channel</Label>
                    <Input
                      className="font-pixel-body mt-1"
                      value={settings.messengerSessionId || ""}
                      onChange={e => update("messengerSessionId", e.target.value)}
                      placeholder="e.g. openclaw-hq"
                    />
                  </div>
                )}
                <Separator />
                <div>
                  <Label className="font-pixel text-[8px]">Theme</Label>
                  <Select value={settings.theme} onValueChange={v => update("theme", v as CompanySettingsType["theme"])}>
                    <SelectTrigger className="font-pixel-body mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pixel">Pixel (Default)</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>
    </AppLayout>
  );
}
