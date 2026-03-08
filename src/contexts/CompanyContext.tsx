import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { companies, type Company } from "@/data/paperclipData";

interface CompanyContextType {
  currentCompany: Company;
  setCurrentCompany: (company: Company) => void;
  companyId: string;
}

const CompanyContext = createContext<CompanyContextType>({
  currentCompany: companies[0],
  setCurrentCompany: () => {},
  companyId: companies[0].id,
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [currentCompany, setCurrentCompany] = useState<Company>(companies[0]);

  return (
    <CompanyContext.Provider value={{ currentCompany, setCurrentCompany, companyId: currentCompany.id }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  return useContext(CompanyContext);
}
