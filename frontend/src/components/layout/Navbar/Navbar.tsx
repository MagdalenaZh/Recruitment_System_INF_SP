import { Link, useLocation } from "react-router-dom";

import { Container } from "../Container";
import { ClubSearch } from "./ClubSearch";
import { UserMenu } from "./UserMenu";
import { Button } from "../../ui/Button";
import { useAuth } from "../../../features/auth/components/AuthContext";

type Props = {
  search?: string;
  setSearch?: (v: string) => void;
  overlay?: boolean;
  tone?: "dark" | "light";
};

export function Navbar({
  search,
  setSearch,
  overlay = false,
  tone = "dark",
}: Props) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const showSearch = location.pathname === "/home";
  const headerClassName = overlay
    ? "absolute inset-x-0 top-0 z-50 w-full pt-4"
    : "relative z-50 w-full pt-4";
  const navbarShellClass = overlay
    ? "bg-white/10 ring-1 ring-white/15 backdrop-blur-md"
    : tone === "light"
      ? "bg-white/88 shadow-lg ring-1 ring-slate-200/80 backdrop-blur-md"
      : "bg-white/10 ring-1 ring-white/15 backdrop-blur-md";
  const brandTitleClass =
    overlay || tone === "dark" ? "text-white" : "text-slate-900";
  const brandSubtitleClass =
    overlay || tone === "dark" ? "text-white/70" : "text-slate-500";
  const ghostButtonClass =
    overlay || tone === "dark"
      ? ""
      : "!text-slate-600 hover:!text-slate-950";
  const searchTone = overlay || tone === "dark" ? "dark" : "light";

  return (
    <header className={headerClassName}>
      <Container>
        <div
          className={`pointer-events-auto flex h-14 items-center justify-between gap-4 rounded-2xl px-4 ${navbarShellClass}`}
        >
          <Link to="/home" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 font-semibold text-white shadow-sm">
              A
            </div>
            <div className="leading-tight">
              <div className={`text-sm font-semibold transition-colors ${brandTitleClass}`}>
                AUBG Clubs
              </div>
              <div className={`text-xs ${brandSubtitleClass}`}>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    className={ghostButtonClass}
                  >
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
            <div className={`rounded-2xl p-3 ${navbarShellClass}`}>
              <ClubSearch value={search} onChange={setSearch} tone={searchTone} />
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
