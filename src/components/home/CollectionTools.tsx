import { Calculator, Link, ScanQrCode, SmartphoneNfc } from "lucide-react";
import { DemoButton } from "@/components/ui/DemoButton";
const tools = [
  { label: "Point", icon: Calculator },
  { label: "Link de pago", icon: Link },
  { label: "QR", icon: ScanQrCode },
  { label: "Tap to Pay", icon: SmartphoneNfc },
];
export function CollectionTools() {
  return (
    <section className="collection-tools" aria-labelledby="collection-title">
      <h2 id="collection-title">Herramientas de cobro</h2>
      <div className="collection-grid">
        {tools.map(({ label, icon: Icon }) => (
          <DemoButton key={label} label={label} className="collection-tool">
            <Icon size={25} strokeWidth={1.8} />
            <span>{label}</span>
          </DemoButton>
        ))}
      </div>
    </section>
  );
}
