# Operaciones simuladas y modelo financiero

## Probar una compra y una venta

1. Ejecutar `npm run dev` y abrir `/inversiones/activo/KO`.
2. Tocar **Comprar**. Ingresar `50.000,00` como presupuesto.
3. La demo permite comprar **3 unidades** de Coca-Cola: subtotal **$ 38.400,00**, comisión ficticia **$ 192,00**, total **$ 38.592,00**, sobrante del presupuesto **$ 11.408,00**.
4. Tocar **Continuar** para revisar. Se puede volver a modificar sin perder lo escrito.
5. **Confirmar compra simulada** ejecuta inmediatamente al precio fijo de referencia. Desde la cuenta inicial, el saldo disponible pasa de **$ 245.850,00** a **$ 207.258,00**, y KO pasa de 30 a 33 unidades.
6. Volver al Home o a Inversiones para ver el mismo estado actualizado. Consultar el registro en **Actividad** o `/inversiones/actividad`.
7. En la ficha de KO, **Vender** permite ingresar unidades o **Vender todo**. Revisar y confirmar la venta simulada. Si se venden las 33 unidades del ejemplo, el neto es **$ 420.288,00**, el saldo queda en **$ 627.546,00** y KO se elimina de las posiciones abiertas.
8. Recargar la página: saldo, posiciones, costos y órdenes se mantienen en este navegador.

Todos los precios son ficticios; los valores anteriores presuponen la cuenta inicial. Se puede recuperar desde **Restablecer demo** en Inversiones o Actividad, después de confirmar. Los favoritos se conservan.

## Reglas financieras

### Importes y unidades

`src/lib/trading/money.ts` centraliza los cálculos. Se usa centavos enteros y `BigInt` en multiplicaciones/divisiones, con redondeo a centavo (mitades hacia arriba). El presupuesto acepta formato argentino, como `50.000,25`, y rechaza importes vacíos, no numéricos, negativos, cero o con más de dos decimales.

La comisión ilustrativa es **0,5% por operación**, definida en `TRADE_CONFIG.feeBps = 50`. No es una tarifa oficial de Mercado Pago. No se simulan otros cargos ni impuestos. El costo de compra incluye la comisión; en venta, la comisión se descuenta del bruto.

La cantidad máxima comprable considera la comisión y el paso mínimo `quantityStep` del activo. Todos los instrumentos del catálogo de esta demo, incluido el fondo ficticio, usan unidades enteras; no se afirma que esa regla represente un producto comercial. El sobrante del presupuesto no se debita ni se reserva.

### Posiciones y resultados

- Compra ejecutada: debita el total, suma unidades y agrega el costo total con comisión al costo de adquisición.
- Venta ejecutada: acredita el neto y asigna el costo de las unidades vendidas usando el promedio ponderado.
- El promedio se conserva como razón de enteros (numerador/denominador). Las ventas parciales mantienen esa razón; el costo en centavos restante se redondea y la última venta libera exactamente todo el costo residual.
- **Resultado realizado:** neto de ventas menos costo asignado a las unidades vendidas.
- **Resultado no realizado:** valor actual de las posiciones abiertas menos su costo de adquisición.
- **Capital en posiciones abiertas:** no incluye el costo de posiciones ya vendidas.
- El efectivo disponible no se usa como medida de ganancia.

Antes de operar, el gráfico de cartera conserva la historia educativa de las fases anteriores. Después de ejecutar operaciones, muestra el valor de cartera registrado tras cada operación, con períodos y una aclaración visible: los cambios incluyen compras y ventas y **no representan rentabilidad**. Los resultados realizados y no realizados se muestran por separado; los gráficos de precios por activo conservan sus series ficticias.

## Estado financiero y persistencia

`src/lib/trading/engine.ts` contiene funciones puras que cotizan, validan, registran y ejecutan. Los componentes no modifican balances ni posiciones directamente. `src/lib/trading/store.ts` expone la cuenta mediante `useSyncExternalStore`, sin una biblioteca adicional de estado.

Home, dashboard, ficha, formularios e historial leen la misma cuenta. El precio y la identidad de cada instrumento siguen centralizados en `src/lib/mocks/assets.ts`. Las tres posiciones iniciales provienen de `src/lib/mocks/investments.ts`:

| Activo | Unidades | Costo inicial | Valor inicial |
| --- | ---: | ---: | ---: |
| AAPL | 20 | $ 540.000,00 | $ 581.000,00 |
| KO | 30 | $ 390.000,00 | $ 384.000,00 |
| GGAL | 50 | $ 320.000,00 | $ 320.450,00 |
| Total | | $ 1.250.000,00 | $ 1.285.450,00 |

La clave `mp-financial-demo-v1` de localStorage guarda esquema, generación de cuenta, revisión, saldo, posiciones, costo/promedio, órdenes, ejecuciones y un registro de eventos. Al recuperar, se reproducen los eventos y se compara el estado reconstruido con el guardado. Datos inválidos o de versión incompatible bloquean operaciones y ofrecen recuperación explícita; no se sobrescriben silenciosamente.

La revisión de una orden fija precio, unidades, comisión, total y revisión/generación de la cuenta. Confirmar valida de nuevo esos datos. Un cambio de precio, costos, saldo, reservas, posiciones o un restablecimiento exige revisar nuevamente. Cada intento revisado tiene un UUID: confirmar repetidamente el mismo intento no duplica órdenes ni ejecuciones.

Los cambios se guardan antes de publicarse a los componentes. Si falla la escritura, no se aplica la operación. Web Locks coordina escrituras entre pestañas. Si el navegador no lo admite, las escrituras se bloquean con una explicación y los datos se conservan. Los eventos de almacenamiento sincronizan las vistas.

No se guardan datos personales, bancarios ni credenciales. Los favoritos conservan su clave independiente `mp-demo-watchlist-v1`.

## Órdenes y escenarios de prueba

En el primer paso de compra o venta, abrir **Escenario de orden · Solo pruebas**:

- **Inmediata** (predeterminado): Enviada → Ejecutada, como una única actualización local persistida.
- **Enviada**: reserva el total de compra o las unidades de venta; no mueve efectivo ni posiciones.
- **Pendiente**: mantiene la reserva sin indicar ejecución.
- **Rechazada**: se registra sin ejecutar, liberando cualquier reserva.

En el detalle de una orden abierta se puede pasar de Enviada a Pendiente, ejecutar, cancelar o simular rechazo. Las órdenes terminales no vuelven a abrirse. Ejecutar nuevamente la misma orden no duplica efectos. Las reservas impiden gastar dos veces el saldo o vender unidades comprometidas; cancelar/rechazar solo libera reservas. Una orden pendiente se ejecuta al precio fijo que fue revisado, no a una cotización de mercado.

El historial muestra empresa, lado, unidades, total/neto, fecha y hora de Argentina, estado e identificador. El detalle agrega el desglose y, en ventas ejecutadas, el resultado realizado. Un ID desconocido muestra un mensaje con regreso al historial, ya que las órdenes solo existen en el navegador local.

