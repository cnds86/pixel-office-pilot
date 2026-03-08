import { useState } from "react";
import { companies, type Company } from "@/data/paperclipData";
import { useCompany } from "@/contexts/CompanyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Building2, Users, Ticket, DollarSign } from "lucide-react";

interface CompanySwitcherProps {
  collapsed?: boolean;
}

export function CompanySwitcher({ collapsed }: CompanySwitcherProps) {
  const { currentCompany, setCurrentCompany } = useCompany();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-full flex items-center gap-2 p-2 hover:bg-sidebar-accent rounded transition-colors">
          <span className="text-2xl">{currentCompany.logo}</span>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="font-pixel text-[8px] text-foreground truncate">{currentCompany.name}</p>
                <p className="font-pixel text-[6px] text-muted-foreground truncate">{currentCompany.mission}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 pixel-border">
        <DropdownMenuLabel className="font-pixel text-[8px] text-muted-foreground">
          SWITCH COMPANY
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map(company => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => setCurrentCompany(company)}
            className={`cursor-pointer ${currentCompany.id === company.id ? "bg-primary/10" : ""}`}
          >
            <div className="flex items-start gap-3 w-full">
              <span className="text-2xl">{company.logo}</span>
              <div className="flex-1 min-w-0">
                <p className="font-pixel text-[8px] text-foreground">{company.name}</p>
                <p className="font-pixel-body text-xs text-muted-foreground truncate">{company.mission}</p>
                <div className="flex items-center gap-3 mt-1 font-pixel text-[6px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Users className="h-3 w-3" /> {company.agentCount}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Ticket className="h-3 w-3" /> {company.activeTickets}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <DollarSign className="h-3 w-3" /> ${company.monthlyBudget}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Building2 className="h-4 w-4 mr-2" />
          <span className="font-pixel text-[8px]">Add New Company</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
