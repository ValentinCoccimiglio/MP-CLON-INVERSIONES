'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{reset:()=>void}){return <main id="contenido" className="site-error" role="alert"><h1>No pudimos mostrar esta pantalla</h1><p>Podés reintentar. Tus datos guardados no se restablecen automáticamente.</p><button className="primary-button" onClick={reset}>Reintentar</button><Link href="/" className="text-button">Volver al inicio</Link></main>;}
