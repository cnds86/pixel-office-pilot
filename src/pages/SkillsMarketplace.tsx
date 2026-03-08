import { useState, useMemo } from "react";
import { Search, Download, Star, Package, Filter, Check, X, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { skills as initialSkills, skillCategories, getAgentById, type Skill, type SkillCategory } from "@/data/missionControlData";
import { agents } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

export default function SkillsMarketplace() {
  const [skillList, setSkillList] = useState<Skill[]>(initialSkills);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<SkillCategory | "all">("all");
  const [filterInstalled, setFilterInstalled] = useState<"all" | "installed" | "available">("all");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    let list = skillList;
    if (filterCategory !== "all") list = list.filter(s => s.category === filterCategory);
    if (filterInstalled === "installed") list = list.filter(s => s.installed);
    if (filterInstalled === "available") list = list.filter(s => !s.installed);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.tags.some(t => t.includes(q)));
    }
    return list;
  }, [skillList, filterCategory, filterInstalled, search]);

  const stats = useMemo(() => ({
    total: skillList.length,
    installed: skillList.filter(s => s.installed).length,
    totalDownloads: skillList.reduce((s, sk) => s + sk.downloads, 0),
  }), [skillList]);

  const toggleInstall = (skill: Skill) => {
    setSkillList(prev => prev.map(s =>
      s.id === skill.id ? { ...s, installed: !s.installed, downloads: s.installed ? s.downloads : s.downloads + 1 } : s
    ));
    toast({
      title: skill.installed ? "Skill uninstalled" : "Skill installed",
      description: `${skill.name} has been ${skill.installed ? "removed" : "added"}`,
    });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-pixel text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Skills Marketplace
          </h1>
          <p className="text-muted-foreground font-pixel-body text-sm mt-1">
            Browse and install skills for your agents
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-pixel text-foreground">{stats.total}</div>
              <div className="text-xs text-muted-foreground font-pixel-body">Available</div>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-pixel text-primary">{stats.installed}</div>
              <div className="text-xs text-muted-foreground font-pixel-body">Installed</div>
            </CardContent>
          </Card>
          <Card className="pixel-border">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-pixel text-foreground">{(stats.totalDownloads / 1000).toFixed(1)}k</div>
              <div className="text-xs text-muted-foreground font-pixel-body">Downloads</div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills..."
              className="pl-9 font-pixel-body"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "installed", "available"] as const).map(f => (
              <Button
                key={f}
                variant={filterInstalled === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterInstalled(f)}
                className="font-pixel text-[10px] h-8"
              >
                {f === "all" ? "All" : f === "installed" ? "Installed" : "Available"}
              </Button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filterCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCategory("all")}
            className="font-pixel text-[10px] h-7"
          >
            All Categories
          </Button>
          {(Object.entries(skillCategories) as [SkillCategory, { icon: string; label: string }][]).map(([cat, cfg]) => (
            <Button
              key={cat}
              variant={filterCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat)}
              className="font-pixel text-[10px] h-7 gap-1"
            >
              {cfg.icon} {cfg.label}
            </Button>
          ))}
        </div>

        {/* Skills Grid */}
        <ScrollArea className="h-[50vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(skill => (
              <Card
                key={skill.id}
                className="pixel-border cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedSkill(skill)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{skill.icon}</span>
                      <div>
                        <div className="font-pixel text-sm text-foreground">{skill.name}</div>
                        <div className="text-[10px] text-muted-foreground font-pixel">v{skill.version} · {skill.author}</div>
                      </div>
                    </div>
                    {skill.installed && (
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] font-pixel">
                        <Check className="h-3 w-3 mr-1" /> Installed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-pixel-body line-clamp-2">{skill.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-pixel">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" />{(skill.downloads / 1000).toFixed(1)}k</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-400" />{skill.rating}</span>
                    </div>
                    <div className="flex gap-1">
                      {skill.tags.slice(0, 2).map(t => (
                        <Badge key={t} variant="outline" className="text-[8px] font-pixel">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Detail Dialog */}
        <Dialog open={!!selectedSkill} onOpenChange={() => setSelectedSkill(null)}>
          <DialogContent className="max-w-md">
            {selectedSkill && (
              <>
                <DialogHeader>
                  <DialogTitle className="font-pixel flex items-center gap-2">
                    <span className="text-2xl">{selectedSkill.icon}</span>
                    {selectedSkill.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground font-pixel-body">{selectedSkill.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm font-pixel-body">
                    <div><span className="text-muted-foreground">Version:</span> <span className="text-foreground">v{selectedSkill.version}</span></div>
                    <div><span className="text-muted-foreground">Author:</span> <span className="text-foreground">{selectedSkill.author}</span></div>
                    <div><span className="text-muted-foreground">Downloads:</span> <span className="text-foreground">{selectedSkill.downloads.toLocaleString()}</span></div>
                    <div><span className="text-muted-foreground">Rating:</span> <span className="text-foreground flex items-center gap-1"><Star className="h-3 w-3 text-amber-400 inline" />{selectedSkill.rating}</span></div>
                    <div><span className="text-muted-foreground">Category:</span> <span className="text-foreground">{skillCategories[selectedSkill.category].icon} {skillCategories[selectedSkill.category].label}</span></div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedSkill.tags.map(t => <Badge key={t} variant="outline" className="text-xs font-pixel">{t}</Badge>)}
                  </div>
                  {selectedSkill.installedByAgentIds.length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground font-pixel mb-2">Used by agents:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSkill.installedByAgentIds.map(id => {
                          const agent = getAgentById(id);
                          return agent ? (
                            <Badge key={id} variant="secondary" className="text-xs font-pixel-body">
                              {agent.avatar} {agent.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant={selectedSkill.installed ? "destructive" : "default"}
                    onClick={() => { toggleInstall(selectedSkill); setSelectedSkill(null); }}
                    className="font-pixel text-xs gap-2"
                  >
                    {selectedSkill.installed ? <><X className="h-3 w-3" /> Uninstall</> : <><Download className="h-3 w-3" /> Install</>}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
