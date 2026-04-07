import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { CreateClubInput, SysAdminClub } from "../types/sysAdminTypes";
import { createClub, getSystemAdminClubs } from "../api/sysAdminApi";

type SysAdminContextType = {
  clubs: SysAdminClub[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  addClub: (input: CreateClubInput) => Promise<void>;
};

const SysAdminContext = createContext<SysAdminContextType | null>(null);

export function SysAdminProvider({ children }: { children: ReactNode }) {
  const [clubs, setClubs] = useState<SysAdminClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const clubsData = await getSystemAdminClubs();
      setClubs(clubsData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load clubs.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addClub(input: CreateClubInput) {
    await createClub(input);
    await refresh();
  }

  return (
    <SysAdminContext.Provider
      value={{
        clubs,
        loading,
        error,
        refresh,
        addClub,
      }}
    >
      {children}
    </SysAdminContext.Provider>
  );
}

export function useSysAdmin() {
  const context = useContext(SysAdminContext);

  if (!context) {
    throw new Error("useSysAdmin must be used inside SysAdminProvider");
  }

  return context;
}
