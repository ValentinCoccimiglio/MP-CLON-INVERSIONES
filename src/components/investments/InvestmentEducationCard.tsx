import { BookOpen, ChevronDown } from "lucide-react";
const lessons = [
  {
    title: "¿Qué es una acción?",
    text: "Es una pequeña parte de una empresa. Su precio puede subir o bajar. Algunas empresas distribuyen dividendos, pero no están garantizados.",
  },
  {
    title: "¿Qué es un CEDEAR?",
    text: "Es un certificado que se negocia en Argentina y representa acciones u otros valores del exterior. Su valor puede cambiar por el precio del activo y el tipo de cambio. No equivale necesariamente a una acción completa.",
  },
  {
    title: "¿Puedo perder dinero al invertir?",
    text: "Sí. Podés recuperar menos de lo que invertiste. Los rendimientos pasados no aseguran resultados futuros. Conocer los riesgos y el plazo de cada inversión te ayuda a decidir.",
  },
  {
    title: "¿Qué es un fondo de inversión?",
    text: "Reúne dinero de varias personas para invertirlo con una estrategia común, administrada por profesionales. Participás mediante cuotapartes. Su valor y sus riesgos dependen de los activos del fondo; no tiene una ganancia asegurada.",
  },
];
export function InvestmentEducationCard() {
  return (
    <section className="education-card" aria-labelledby="education-title">
      <div className="education-heading">
        <span>
          <BookOpen size={22} />
        </span>
        <div>
          <p>UN PASO A LA VEZ</p>
          <h2 id="education-title">Invertir empieza por entender</h2>
        </div>
      </div>
      <p className="inv-subtitle">
        Respuestas simples, para decidir con más información.
      </p>
      {lessons.map((lesson) => (
        <details key={lesson.title}>
          <summary>
            {lesson.title}
            <ChevronDown size={17} aria-hidden="true" />
          </summary>
          <p>{lesson.text}</p>
        </details>
      ))}
      <p className="education-source">
        Para seguir aprendiendo:{" "}
        <a
          href="https://www.argentina.gob.ar/cnv/proteccion-al-publico-inversor"
          target="_blank"
          rel="noreferrer"
        >
          Protección al inversor · CNV ↗
        </a>
      </p>
    </section>
  );
}
