import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { Container } from "../Container";
import { ClubSearch } from "./ClubSearch";
import { UserMenu } from "./UserMenu";
import { Button } from "../../ui/Button";
import { useAuth } from "../../../features/auth/components/AuthContext";

type Props = {
  search?: string;
  setSearch?: (v: string) => void;
};

export function Navbar({ search, setSearch }: Props) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 36);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showSearch = location.pathname === "/home";
  const navbarShellClass = isScrolled
    ? "bg-white/92 shadow-lg ring-1 ring-slate-900/10 backdrop-blur-xl"
    : "bg-white/10 ring-1 ring-white/15 backdrop-blur-md";
  const brandTitleClass = isScrolled ? "text-slate-950" : "text-white";
  const brandSubtitleClass = isScrolled ? "text-slate-500" : "text-white/70";
  const ghostButtonClass = isScrolled
    ? "!text-slate-700 hover:!text-slate-950"
    : "";
  const searchTone = isScrolled ? "light" : "dark";

  return (
    <header className="fixed top-0 z-50 w-full pt-4">
      <Container>
        <div
          className={`pointer-events-auto flex h-14 items-center justify-between gap-4 rounded-2xl px-4 transition-all duration-200 ${navbarShellClass}`}
        >
          <Link to="/home" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 font-semibold text-white shadow-sm">
              A
            </div>
            <div className="leading-tight">
              <div className={`text-sm font-semibold transition-colors ${brandTitleClass}`}>
                AUBG Clubs
              </div>
              <div className={`text-xs transition-colors ${brandSubtitleClass}`}>
                Browse & apply
              </div>
            </div>
          </Link>

          {showSearch && search !== undefined && setSearch && (
            <div className="hidden w-full max-w-md md:block">
              <ClubSearch value={search} onChange={setSearch} tone={searchTone} />
            </div>
          )}

          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" type="button" className={ghostButtonClass}>
                    Log in
                  </Button>
                </Link>

                <Link to="/register">
                  <Button size="sm" type="button">
                    Create account
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>

        {showSearch && search !== undefined && setSearch && (
          <div className="mt-3 md:hidden">
            <div
              className={`rounded-2xl p-3 transition-all duration-200 ${navbarShellClass}`}
            >
              <ClubSearch value={search} onChange={setSearch} tone={searchTone} />
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
