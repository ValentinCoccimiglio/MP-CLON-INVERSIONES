"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Landmark,
  ArrowLeftRight,
  ChartNoAxesCombined,
  Menu,
  ScanQrCode,
} from "lucide-react";
import { DemoButton } from "@/components/ui/DemoButton";
export function BottomNavigation() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <Link
        href="/"
        className={pathname === "/" ? "nav-item active" : "nav-item"}
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <Landmark size={23} />
        <span>Inicio</span>
      </Link>
      <Link
        href="/inversiones/actividad"
        className={
          pathname.startsWith("/inversiones/actividad")
            ? "nav-item active"
            : "nav-item"
        }
        aria-current={
          pathname.startsWith("/inversiones/actividad") ? "page" : undefined
        }
      >
        <ArrowLeftRight size={23} />
        <span>Actividad</span>
      </Link>
      <DemoButton label="Pagar con QR" className="nav-item qr-nav">
        <span className="qr-circle">
          <ScanQrCode size={28} />
        </span>
        <span>QR</span>
      </DemoButton>
      <Link
        href="/inversiones"
        className={
          pathname.startsWith("/inversiones") &&
          !pathname.startsWith("/inversiones/actividad")
            ? "nav-item active"
            : "nav-item"
        }
        aria-current={
          pathname.startsWith("/inversiones") &&
          !pathname.startsWith("/inversiones/actividad")
            ? "page"
            : undefined
        }
      >
        <ChartNoAxesCombined size={23} />
        <span>Inversiones</span>
      </Link>
      <DemoButton label="Más opciones" className="nav-item">
        <Menu size={23} />
        <span>Más</span>
      </DemoButton>
    </nav>
  );
}
