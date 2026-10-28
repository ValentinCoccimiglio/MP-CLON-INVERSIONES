"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
const BackContext = createContext<((fallback: string) => void) | null>(null);
export function InvestmentNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const trail = useRef({
    paths: [pathname],
    index: 0,
    pop: false,
    replace: false,
  });
  useEffect(() => {
    const handlePop = () => {
      trail.current.pop = true;
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);
  useEffect(() => {
    const state = trail.current;
    if (state.paths[state.index] === pathname) {
      state.pop = false;
      return;
    }
    if (state.replace) {
      state.paths = [pathname];
      state.index = 0;
      state.replace = false;
    } else if (state.pop) {
      const known =
        state.paths[state.index - 1] === pathname
          ? state.index - 1
          : state.paths[state.index + 1] === pathname
            ? state.index + 1
            : state.paths.lastIndexOf(pathname);
      state.index = known < 0 ? 0 : known;
      if (known < 0) state.paths = [pathname];
    } else {
      state.paths = state.paths.slice(0, state.index + 1);
      state.paths.push(pathname);
      state.index++;
    }
    state.pop = false;
  }, [pathname]);
  function goBack(fallback: string) {
    if (trail.current.index > 0) router.back();
    else {
      trail.current.replace = true;
      router.replace(fallback);
    }
  }
  return <BackContext.Provider value={goBack}>{children}</BackContext.Provider>;
}
export function InvestmentBackButton({ fallback }: { fallback: string }) {
  const back = useContext(BackContext);
  const router = useRouter();
  return (
    <button
      className="icon-button"
      aria-label="Volver"
      onClick={() => (back ? back(fallback) : router.replace(fallback))}
    >
      <ArrowLeft size={23} />
    </button>
  );
}
