import { useState } from "react";
import { Tag as TagIcon, Plus, Trash2, Edit, Hash, Type, Calendar, Link, CheckSquare, List, Settings2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { tags as initialTags, customFields as initialFields, type Tag, type CustomField, type CustomFieldType } from "@/data/missionControlData";
import { useToast } from "@/hooks/use-toast";

const fieldTypeConfig: Record<CustomFieldType, { icon: typeof Type; label: string }> = {
  text: { icon: Type, label: "Text" },
  number: { icon: Hash, label: "Number" },
  select: { icon: List, label: "Select" },
  date: { icon: Calendar, label: "Date" },
  checkbox: { icon: CheckSquare, label: "Checkbox" },
  url: { icon: Link, label: "URL" },
};

export default function TagsCustomFields() {
  const [tagList, setTagList] = useState<Tag[]>(initialTags);
  const [fieldList, setFieldList] = useState<CustomField[]>(initialFields);
  const [tagFormOpen, setTagFormOpen] = useState(false);
  const [fieldFormOpen, setFieldFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  // Tag form state
  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("hsl(210 70% 50%)");

  // Field form state
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<CustomFieldType>("text");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [fieldDesc, setFieldDesc] = useState("");
  const [fieldOptions, setFieldOptions] = useState("");

  const { toast } = useToast();

  const colorPresets = [
    "hsl(0 70% 50%)", "hsl(30 90% 50%)", "hsl(50 70% 45%)", "hsl(120 60% 45%)",
    "hsl(180 50% 45%)", "hsl(210 70% 50%)", "hsl(270 60% 55%)", "hsl(320 70% 55%)",
  ];

  // Tag CRUD
  const openNewTag = () => { setEditingTag(null); setTagName(""); setTagColor("hsl(210 70% 50%)"); setTagFormOpen(true); };
  const openEditTag = (tag: Tag) => { setEditingTag(tag); setTagName(tag.name); setTagColor(tag.color); setTagFormOpen(true); };
  const saveTag = () => {
    if (!tagName) return;
    if (editingTag) {
      setTagList(prev => prev.map(t => t.id === editingTag.id ? { ...t, name: tagName, color: tagColor } : t));
    } else {
      setTagList(prev => [...prev, { id: `tag-${Date.now()}`, name: tagName, color: tagColor, usageCount: 0, createdAt: new Date().toISOString() }]);
    }
    setTagFormOpen(false);
    toast({ title: editingTag ? "Tag updated" : "Tag created" });
  };
  const deleteTag = (id: string) => { setTagList(prev => prev.filter(t => t.id !== id)); toast({ title: "Tag deleted" }); };

  // Field CRUD
  const openNewField = () => { setEditingField(null); setFieldName(""); setFieldType("text"); setFieldRequired(false); setFieldDesc(""); setFieldOptions(""); setFieldFormOpen(true); };
  const openEditField = (f: CustomField) => { setEditingField(f); setFieldName(f.name); setFieldType(f.type); setFieldRequired(f.required); setFieldDesc(f.description); setFieldOptions(f.options?.join(", ") || ""); setFieldFormOpen(true); };
  const saveField = () => {
    if (!fieldName) return;
    const opts = fieldType === "select" ? fieldOptions.split(",").map(s => s.trim()).filter(Boolean) : undefined;
    if (editingField) {
      setFieldList(prev => prev.map(f => f.id === editingField.id ? { ...f, name: fieldName, type: fieldType, required: fieldRequired, description: fieldDesc, options: opts } : f));
    } else {
      setFieldList(prev => [...prev, { id: `cf-${Date.now()}`, name: fieldName, type: fieldType, required: fieldRequired, description: fieldDesc, options: opts, createdAt: new Date().toISOString(), usageCount: 0 }]);
    }
    setFieldFormOpen(false);
    toast({ title: editingField ? "Field updated" : "Field created" });
  };
  const deleteField = (id: string) => { setFieldList(prev => prev.filter(f => f.id !== id)); toast({ title: "Field deleted" }); };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-pixel text-foreground flex items-center gap-2">
            <Settings2 className="h-6 w-6 text-primary" />
            Tags & Custom Fields
          </h1>
          <p className="text-muted-foreground font-pixel-body text-sm mt-1">
            Organize tasks with tags and extend them with custom fields
          </p>
        </div>

        <Tabs defaultValue="tags">
          <TabsList className="font-pixel">
            <TabsTrigger value="tags" className="text-xs gap-1"><TagIcon className="h-3 w-3" /> Tags ({tagList.length})</TabsTrigger>
            <TabsTrigger value="fields" className="text-xs gap-1"><Hash className="h-3 w-3" /> Custom Fields ({fieldList.length})</TabsTrigger>
          </TabsList>

          {/* Tags Tab */}
          <TabsContent value="tags" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openNewTag} size="sm" className="font-pixel text-xs gap-1">
                <Plus className="h-3 w-3" /> New Tag
              </Button>
            </div>
            <ScrollArea className="h-[55vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {tagList.map(tag => (
                  <Card key={tag.id} className="pixel-border hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-sm border border-border" style={{ backgroundColor: tag.color }} />
                          <div>
                            <div className="font-pixel text-sm text-foreground">{tag.name}</div>
                            <div className="text-[10px] text-muted-foreground font-pixel">{tag.usageCount} tasks</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditTag(tag)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteTag(tag.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Custom Fields Tab */}
          <TabsContent value="fields" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openNewField} size="sm" className="font-pixel text-xs gap-1">
                <Plus className="h-3 w-3" /> New Field
              </Button>
            </div>
            <ScrollArea className="h-[55vh]">
              <div className="space-y-3">
                {fieldList.map(field => {
                  const cfg = fieldTypeConfig[field.type];
                  const Icon = cfg.icon;
                  return (
                    <Card key={field.id} className="pixel-border hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg border-2 border-border bg-accent/30">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-pixel text-sm text-foreground flex items-center gap-2">
                                {field.name}
                                {field.required && <Badge variant="outline" className="text-[8px] font-pixel text-amber-400">Required</Badge>}
                              </div>
                              <div className="text-xs text-muted-foreground font-pixel-body">{field.description}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-[9px] font-pixel">{cfg.label}</Badge>
                                <span className="text-[10px] text-muted-foreground font-pixel">{field.usageCount} tasks</span>
                                {field.options && <span className="text-[10px] text-muted-foreground font-pixel">{field.options.length} options</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditField(field)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteField(field.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Tag Form Dialog */}
        <Dialog open={tagFormOpen} onOpenChange={setTagFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-pixel">{editingTag ? "Edit Tag" : "New Tag"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-pixel text-xs">Name</Label>
                <Input value={tagName} onChange={e => setTagName(e.target.value)} placeholder="bug, feature, urgent..." />
              </div>
              <div>
                <Label className="font-pixel text-xs">Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorPresets.map(c => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded-md border-2 transition-all ${tagColor === c ? "border-primary scale-110" : "border-border"}`}
                      style={{ backgroundColor: c }}
                      onClick={() => setTagColor(c)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: tagColor }} />
                <Badge style={{ backgroundColor: tagColor, color: "white" }} className="font-pixel text-xs">{tagName || "preview"}</Badge>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveTag} className="font-pixel text-xs">Save Tag</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Field Form Dialog */}
        <Dialog open={fieldFormOpen} onOpenChange={setFieldFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-pixel">{editingField ? "Edit Field" : "New Custom Field"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-pixel text-xs">Name</Label>
                <Input value={fieldName} onChange={e => setFieldName(e.target.value)} placeholder="Story Points, Sprint..." />
              </div>
              <div>
                <Label className="font-pixel text-xs">Type</Label>
                <Select value={fieldType} onValueChange={v => setFieldType(v as CustomFieldType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.entries(fieldTypeConfig) as [CustomFieldType, { icon: typeof Type; label: string }][]).map(([type, cfg]) => (
                      <SelectItem key={type} value={type}>
                        <span className="flex items-center gap-2"><cfg.icon className="h-3 w-3" /> {cfg.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {fieldType === "select" && (
                <div>
                  <Label className="font-pixel text-xs">Options (comma separated)</Label>
                  <Input value={fieldOptions} onChange={e => setFieldOptions(e.target.value)} placeholder="Option 1, Option 2, Option 3" />
                </div>
              )}
              <div>
                <Label className="font-pixel text-xs">Description</Label>
                <Input value={fieldDesc} onChange={e => setFieldDesc(e.target.value)} placeholder="What this field is for" />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={fieldRequired} onCheckedChange={setFieldRequired} />
                <Label className="font-pixel text-xs">Required field</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveField} className="font-pixel text-xs">Save Field</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
