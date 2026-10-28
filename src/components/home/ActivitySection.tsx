import { ArrowRight, BusFront, TrainFront } from "lucide-react";
import { DemoButton } from "@/components/ui/DemoButton";
import { activities } from "@/lib/mocks/account";
export function ActivitySection() {
  return (
    <section className="activity-section" aria-labelledby="activity-title">
      <h2 id="activity-title">Últimas actividades</h2>
      <DemoButton label="Consultar actividades" className="text-button">
        Consultar todas <ArrowRight size={18} />
      </DemoButton>
      <ul className="activity-list">
        {activities.map((item) => (
          <li key={item.id}>
            <span className={`activity-icon ${item.type}`} aria-hidden="true">
              {item.type === "bus" ? (
                <BusFront size={23} />
              ) : (
                <TrainFront size={23} />
              )}
            </span>
            <div className="activity-description">
              <h3>{item.name}</h3>
              <p>Pago de transporte</p>
              <span>Tarjeta de demostración</span>
            </div>
            <div className="activity-amount">
              <strong>- $ {item.amount}</strong>
              <span>{item.date}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
