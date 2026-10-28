import type { Metadata, Viewport } from "next";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { DemoProvider } from "@/components/ui/DemoProvider";
import "./globals.css";
import "./inversiones/trading.css";
export const metadata: Metadata = {
  title: {default: "Mercado Pago Investments · Concepto no oficial", template: "%s · Demo no oficial"},
  applicationName: "Mercado Pago Investments — Unofficial UX/UI Concept",
  description:
    "Proyecto educativo de portfolio. Todos los datos son ficticios. Sin operaciones reales.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffe600",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <div className="app-shell">
          <p className="demo-disclosure">Proyecto educativo no oficial. Sin afiliación con Mercado Pago. Datos y operaciones simulados.</p>
          <DemoProvider>
            {children}
            <BottomNavigation />
          </DemoProvider>
        </div>
      </body>
    </html>
  );
}
