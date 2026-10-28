"use client";
import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Info, X } from "lucide-react";
const DemoContext = createContext<(label: string) => void>(() => {});
export const useDemo = () => useContext(DemoContext);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function show(label: string) {
    if (timer.current) clearTimeout(timer.current);
    setNotice(
      `${label}: esta función es demostrativa. No se realizan operaciones reales.`,
    );
    timer.current = setTimeout(() => setNotice(""), 6000);
  }
  return (
    <DemoContext.Provider value={show}>
      {children}
      <div
        className="notice-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice && (
          <div className="notice">
            <Info size={20} aria-hidden="true" />
            <p>{notice}</p>
            <button
              className="icon-button"
              aria-label="Cerrar aviso"
              onClick={() => setNotice("")}
            >
              <X size={19} />
            </button>
          </div>
        )}
      </div>
    </DemoContext.Provider>
  );
}
