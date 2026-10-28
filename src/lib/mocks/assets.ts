import type {
  AssetCategory,
  AssetPricePoint,
  InvestmentAsset,
} from "@/types/investments";
import { changeBetween } from "@/lib/investments";
const education: Record<AssetCategory, string> = {
  cedears:
    "Un CEDEAR es un certificado que te permite invertir desde Argentina en activos del exterior. Este certificado representa acciones de la empresa, no una acción estadounidense comprada directamente. Su precio en pesos puede cambiar por el activo subyacente y el tipo de cambio. Puede existir un ratio de conversión: un certificado no equivale necesariamente a una acción completa. No indicamos un ratio porque no fue verificado.",
  acciones:
    "Una acción representa una pequeña parte de una empresa argentina. Su precio puede subir o bajar según la empresa y el mercado. Los dividendos, si los hubiera, no están garantizados.",
  fondos:
    "Un fondo reúne el dinero de varias personas para invertirlo siguiendo una estrategia. Participás mediante cuotapartes. Este fondo es completamente ficticio: no ofrece condiciones comerciales ni un rendimiento garantizado.",
};
// Las fechas/horas son etiquetas fijas del escenario educativo, no cotizaciones.
function makeHistory(
  price: number,
  previous: number,
  initial: number,
): AssetPricePoint[] {
  const anchors: [string, number][] = [
    ["2025-04-28", initial],
    ["2025-10-28", price * 0.93],
    ["2026-07-28", price * 0.97],
    ["2026-09-28", price * 0.985],
    ["2026-10-21", price * 1.01],
    ["2026-10-27", previous],
  ];
  const points: AssetPricePoint[] = [];
  const day = 86400000;
  for (let segment = 0; segment < anchors.length - 1; segment++) {
    const [from, startValue] = anchors[segment];
    const [to, endValue] = anchors[segment + 1];
    const start = Date.parse(`${from}T17:00:00Z`);
    const length = Math.round((Date.parse(`${to}T17:00:00Z`) - start) / day);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      points.push({
        date: new Date(start + i * day).toISOString(),
        value:
          Math.round(
            (startValue +
              (endValue - startValue) * t +
              Math.sin(t * Math.PI) * Math.sin(i * 1.7) * price * 0.004) *
              100,
          ) / 100,
      });
    }
  }
  points.push({ date: "2026-10-27T17:00:00.000Z", value: previous });
  for (let i = 0; i < 8; i++) {
    const t = i / 7;
    points.push({
      date: `2026-10-28T${10 + i}:00:00.000Z`,
      value:
        i === 7
          ? price
          : Math.round(
              (previous +
                (price - previous) * t +
                Math.sin(t * Math.PI) * Math.sin(i * 2) * price * 0.002) *
                100,
            ) / 100,
    });
  }
  return points;
}
function asset(
  ticker: string,
  name: string,
  category: AssetCategory,
  price: number,
  previousPrice: number,
  description: string,
  initial = price * 0.9,
): InvestmentAsset {
  return {
    id: `ar-${category}-${ticker.toLowerCase()}`,
    quantityStep: 1,
    ticker,
    name,
    category,
    currency: "ARS",
    price,
    previousPrice,
    dayChange: changeBetween(price, previousPrice).rate,
    monogram: name[0],
    description,
    education: education[category],
    risks:
      "Las inversiones pueden subir o bajar de valor. Podés perder parte o la totalidad del dinero invertido.",
    market:
      category === "fondos"
        ? "Fondo de demostración · sin mercado asignado"
        : "Mercado argentino · referencia educativa",
    history: makeHistory(price, previousPrice, initial),
  };
}
export const assets: InvestmentAsset[] = [
  asset(
    "AAPL",
    "Apple",
    "cedears",
    29050,
    28800,
    "Apple es una empresa tecnológica conocida por productos como el iPhone y la Mac, y por sus servicios digitales.",
    27000,
  ),
  asset(
    "KO",
    "Coca-Cola",
    "cedears",
    12800,
    12900,
    "Coca-Cola es una compañía de bebidas que comercializa gaseosas y otras bebidas en distintos países.",
    13000,
  ),
  asset(
    "GGAL",
    "Grupo Financiero Galicia",
    "acciones",
    6409,
    6340,
    "Grupo Financiero Galicia es un grupo argentino que ofrece servicios bancarios y otros servicios financieros.",
    6400,
  ),
  asset(
    "YPFD",
    "YPF",
    "acciones",
    42500,
    42750,
    "YPF es una compañía argentina dedicada a la energía, con actividades en petróleo, gas y combustibles.",
  ),
  asset(
    "FONDO-DEMO",
    "Fondo Diversificado Demo",
    "fondos",
    1250,
    1248,
    "Un fondo ficticio creado para mostrar cómo se presenta una inversión colectiva. No corresponde a un producto comercial.",
  ),
  asset(
    "MSFT",
    "Microsoft",
    "cedears",
    23400,
    23100,
    "Microsoft desarrolla software, servicios de computación en la nube y productos tecnológicos.",
  ),
  asset(
    "NVDA",
    "NVIDIA",
    "cedears",
    18300,
    18050,
    "NVIDIA diseña chips y plataformas de computación utilizados en gráficos e inteligencia artificial.",
  ),
  asset(
    "MELI",
    "MercadoLibre",
    "cedears",
    32100,
    32500,
    "MercadoLibre desarrolla plataformas de comercio electrónico y servicios de pagos en América Latina.",
  ),
  asset(
    "AMZN",
    "Amazon",
    "cedears",
    14750,
    14600,
    "Amazon ofrece comercio electrónico, servicios de computación en la nube y contenidos digitales.",
  ),
  asset(
    "TSLA",
    "Tesla",
    "cedears",
    16200,
    16500,
    "Tesla desarrolla vehículos eléctricos y productos de almacenamiento y generación de energía.",
  ),
  asset(
    "BMA",
    "Banco Macro",
    "acciones",
    11800,
    11700,
    "Banco Macro es una entidad financiera argentina que ofrece servicios a personas y empresas.",
  ),
  asset(
    "PAMP",
    "Pampa Energía",
    "acciones",
    4350,
    4390,
    "Pampa Energía es una compañía argentina con actividades de generación eléctrica y producción de gas y petróleo.",
  ),
];
