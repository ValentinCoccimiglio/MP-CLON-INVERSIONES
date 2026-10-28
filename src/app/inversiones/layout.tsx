import type { ReactNode } from "react";
import { InvestmentNavigation } from "@/components/investments/InvestmentNavigation";
import "./investments.css";
import "./assets.css";
export default function InvestmentsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <InvestmentNavigation>{children}</InvestmentNavigation>;
}
