import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const widths=[320,375,390,430,768,1024,1440];
const routes=['/','/inversiones','/inversiones/explorar','/inversiones/activo/AAPL','/inversiones/comprar/KO','/inversiones/vender/KO','/inversiones/actividad'];
test('recorrido A/B/C: navegar, buscar, comprar, vender, persistir y restablecer',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Inversiones'}).click();
 await page.getByRole('link',{name:/Buscar y ver todos/}).click();await page.getByRole('searchbox',{name:'Buscar empresas o inversiones'}).fill('ápple');await expect(page.locator('.catalog-item')).toHaveCount(1);
 await page.locator('.catalog-asset').click();await expect(page).toHaveURL(/activo\/AAPL$/);await expect(page.getByRole('heading',{name:'¿En qué estás invirtiendo?'})).toBeVisible();await expect(page.getByText(/Podés perder parte o la totalidad/)).toBeVisible();
 await page.getByRole('link',{name:'Comprar',exact:true}).click();await page.getByRole('textbox',{name:'Presupuesto en pesos (ARS)'}).fill('60.000,00');await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect(page.locator('.trade-breakdown')).toContainText('58.390,50');
 await page.getByRole('button',{name:'Confirmar compra simulada',exact:true}).click();await expect(page.getByRole('heading',{name:'Tu compra simulada se ejecutó correctamente.'})).toBeVisible();await page.getByRole('link',{name:'Ver mis inversiones',exact:true}).click();await expect(page.locator('.available-balance')).toContainText('187.459,50');await expect(page.locator('.holdings-list')).toContainText('639.100,00');
 await page.reload();await expect(page.locator('.available-balance')).toContainText('187.459,50');await page.locator('.holding-card').filter({hasText:'Apple'}).click();await page.getByRole('link',{name:'Vender',exact:true}).click();await expect(page.getByText('Unidades disponibles:')).toContainText('22');
 await page.getByRole('textbox',{name:'Cantidad de unidades enteras'}).fill('2');await page.getByRole('button',{name:'Continuar',exact:true}).click();await page.getByRole('button',{name:'Confirmar venta simulada',exact:true}).click();await expect(page.getByRole('heading',{name:'Tu venta simulada se ejecutó correctamente.'})).toBeVisible();
 await page.getByRole('link',{name:'Ver detalle de la operación'}).click();await expect(page.locator('.trade-breakdown')).toContainText('57.809,50');await page.reload();await expect(page.getByRole('heading',{name:'Venta de Apple'})).toBeVisible();
 await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('link',{name:'Actividad'}).click();await expect(page.locator('.order-list li')).toHaveCount(2);await expect(page.locator('.available-balance')).toContainText('245.269,00');
 await page.getByRole('button',{name:'Restablecer demo',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Conservar mis datos'}).click();await expect(page.locator('.order-list li')).toHaveCount(2);
 await page.getByRole('button',{name:'Restablecer demo',exact:true}).click();await page.getByRole('button',{name:'Sí, restablecer demo'}).click();await expect(page.getByRole('heading',{name:'Todavía no hay operaciones'})).toBeVisible();await expect(page.locator('.available-balance')).toContainText('245.850,00');expect(errors).toEqual([]);
});
test('primer inversor, favoritos, regreso real y acceso directo',async({page})=>{
 await page.goto('/inversiones');await page.getByText('Probar estados de la demo').click();await page.getByRole('button',{name:'Sin inversiones',exact:true}).click();await expect(page.locator('.portfolio-empty')).toBeVisible();await page.getByRole('link',{name:'Explorar inversiones',exact:true}).click();await page.getByRole('link',{name:/Buscar y ver todos/}).click();await page.getByRole('searchbox').fill('Coca-Cola');await page.getByRole('button',{name:'Agregar Coca-Cola a favoritos'}).click();await page.locator('.catalog-asset').click();await expect(page.getByRole('button',{name:'Quitar Coca-Cola de favoritos'})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Volver',exact:true}).click();await expect(page).toHaveURL(/explorar$/);
 await page.goto('/inversiones/activo/KO');await page.reload();await page.getByRole('button',{name:'Volver',exact:true}).click();await expect(page).toHaveURL(/explorar$/);await page.getByRole('button',{name:/Mis favoritos/}).click();await expect(page.locator('.catalog-item')).toHaveCount(1);
});
test('dos pestañas no pueden confirmar dos veces el mismo saldo revisado',async({context,page})=>{
 await page.goto('/inversiones/comprar/KO');const second=await context.newPage();await second.goto('/inversiones/comprar/KO');for(const p of [page,second]){await p.getByRole('textbox').fill('200.000');await p.getByRole('button',{name:'Continuar',exact:true}).click();}
 await Promise.all([page.getByRole('button',{name:'Confirmar compra simulada'}).click(),second.getByRole('button',{name:'Confirmar compra simulada'}).click()]);
 await expect.poll(async()=>{const raw=await page.evaluate(()=>localStorage.getItem('mp-financial-demo-v1'));return raw?JSON.parse(raw).orders.length:0;}).toBe(1);
 const combined=(await page.locator('main').innerText())+(await second.locator('main').innerText());expect(combined).toContain('Revisá nuevamente');await page.goto('/inversiones/actividad');await expect(page.locator('.order-list li')).toHaveCount(1);
});
for(const width of widths)test(`responsive ${width}px: sin desbordes y acciones accesibles`,async({page})=>{
 await page.setViewportSize({width,height:844});
 for(const route of routes){await page.goto(route);await expect(page.locator('main')).toHaveCount(1);await expect(page.locator('main')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),route).toBe(true);await page.locator('main').evaluate(el=>el.scrollIntoView());await expect(page.getByRole('navigation',{name:'Navegación principal'})).toBeVisible();}
 await page.goto('/inversiones/comprar/KO');await page.getByRole('textbox').fill('50.000');await page.getByRole('button',{name:'Continuar',exact:true}).click();const confirm=page.getByRole('button',{name:'Confirmar compra simulada'});await confirm.scrollIntoViewIfNeeded();const box=await confirm.boundingBox();const nav=await page.locator('.bottom-nav').boundingBox();expect(box!.y+box!.height).toBeLessThanOrEqual(nav!.y);await confirm.click();await expect(page.locator('.trade-result')).toBeVisible();
 await page.goto('/inversiones/actividad');await page.getByRole('button',{name:'Restablecer demo',exact:true}).click();const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();const d=await dialog.boundingBox();expect(d!.x).toBeGreaterThanOrEqual(0);expect(d!.x+d!.width).toBeLessThanOrEqual(width);await page.keyboard.press('Escape');await expect(dialog).not.toBeVisible();
});
for(const route of routes)test(`accesibilidad axe: ${route}`,async({page},testInfo)=>{
 await page.goto(route);await expect(page.locator('main')).toHaveCount(1);await expect(page.locator('main')).toBeVisible();const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();await testInfo.attach('axe',{body:JSON.stringify(scan.violations,null,2),contentType:'application/json'});expect(scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
});
test('teclado, error del formulario, revisión y foco',async({page})=>{
 await page.goto('/inversiones/comprar/KO');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Saltar al contenido'})).toBeFocused();await page.getByRole('textbox').fill('0');await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect(page.locator('#trade-validation')).not.toBeEmpty();await page.getByRole('textbox').fill('50.000');await page.getByRole('button',{name:'Continuar',exact:true}).click();await expect(page.getByRole('heading',{name:'Revisá tu compra'})).toBeFocused();await page.getByRole('button',{name:'Volver y modificar'}).click();await expect(page.getByRole('textbox')).toBeFocused();await expect(page.getByRole('textbox')).toHaveValue('50.000');
});

test('revisión, resultado y diálogo accesibles; viewport con teclado',async({page})=>{
 await page.setViewportSize({width:320,height:460});
 await page.goto('/inversiones/comprar/KO');await page.getByRole('textbox').fill('50.000');await page.getByRole('button',{name:'Continuar',exact:true}).click();
 for(const step of ['review','result','dialog']){
  if(step==='result')await page.getByRole('button',{name:'Confirmar compra simulada'}).click();
  if(step==='dialog'){await page.goto('/inversiones/actividad');await page.getByRole('button',{name:'Restablecer demo',exact:true}).click();}
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(scan.violations,step).toEqual([]);
 }
 await page.getByRole('button',{name:'Conservar mis datos'}).click();await expect(page.getByRole('button',{name:'Restablecer demo',exact:true})).toBeFocused();
});

test('capturas de las pantallas auditadas',async({page})=>{
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:844});
  for(const [name,route] of [['home','/'],['dashboard','/inversiones'],['detalle','/inversiones/activo/AAPL'],['compra','/inversiones/comprar/KO']]){
   await page.goto(route);await expect(page.locator('main')).toHaveCount(1);await expect(page.locator('main')).toBeVisible();
   if(name==='compra'){await page.getByRole('textbox').fill('50.000');await page.getByRole('button',{name:'Continuar',exact:true}).click();}
   await page.screenshot({path:`docs/screenshots/${name}-${width}.png`,fullPage:true,animations:'disabled'});
  }
 }
});
