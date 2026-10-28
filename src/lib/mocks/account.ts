export const account = { name: "Valentin", initials: "V", balance: 245850 };
export const formatMoney = (amount: number) =>
  new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const activities = [
  {
    id: "demo-1",
    name: "Viaje en colectivo",
    type: "bus",
    amount: "1.100,00",
    date: "08:30",
  },
  {
    id: "demo-2",
    name: "Viaje en subte",
    type: "train",
    amount: "650,00",
    date: "Ayer",
  },
  {
    id: "demo-3",
    name: "Viaje en colectivo",
    type: "bus",
    amount: "980,00",
    date: "Ayer",
  },
];
