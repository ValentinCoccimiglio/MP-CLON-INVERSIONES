import { ArrowUpRight, Plus, QrCode, Grid2X2 } from "lucide-react";
import { DemoButton } from "@/components/ui/DemoButton";
const actions = [
  { label: "Ingresar dinero", icon: Plus },
  { label: "Transferir", icon: ArrowUpRight },
  { label: "Pagar", icon: QrCode },
  { label: "Más", icon: Grid2X2 },
];
export function QuickActions() {
  return (
    <div className="quick-actions">
      {actions.map(({ label, icon: Icon }) => (
        <DemoButton key={label} label={label} className="quick-action">
          <span className="action-icon">
            <Icon size={25} strokeWidth={1.8} />
          </span>
          <span>{label}</span>
        </DemoButton>
      ))}
    </div>
  );
}
