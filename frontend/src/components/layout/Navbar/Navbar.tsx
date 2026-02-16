import { Link } from "react-router-dom";
import { Container } from "../Container";
import { ClubSearch } from "./ClubSearch";
import { Button } from "../../ui/Button";

type Props = {
  search: string;
  setSearch: (v: string) => void;
};

export function Navbar({ search, setSearch }: Props) {
  return (
    <header className="fixed top-0 z-50 w-full pt-4">
      <Container>
        <div className="pointer-events-auto flex h-14 items-center justify-between gap-4 rounded-2xl bg-white/10 px-4 backdrop-blur-md ring-1 ring-white/15">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white font-semibold shadow-sm">
              A
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-white">AUBG Clubs</div>
              <div className="text-xs text-white/70">Browse & apply</div>
            </div>
          </Link>

          <div className="hidden w-full max-w-md md:block">
            <ClubSearch value={search} onChange={setSearch} />
          </div>

          <nav className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" type="button">
                Log in
              </Button>
            </Link>

            <Link to="/register">
              <Button size="sm" type="button">
                Create account
              </Button>
            </Link>
          </nav>
        </div>

        {/* Mobile */}
        <div className="mt-3 md:hidden">
          <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md ring-1 ring-white/15">
            <ClubSearch value={search} onChange={setSearch} />
          </div>
        </div>
      </Container>
    </header>
  );
}
