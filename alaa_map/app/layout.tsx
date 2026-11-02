import type { Metadata } from 'next';
import { Instrument_Serif } from 'next/font/google';
import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';
const display=Instrument_Serif({subsets:['latin'],weight:'400',style:['normal','italic'],variable:'--font-display'});
export const metadata: Metadata = { title: 'Ranches | Explore your surroundings', description: 'Explore Ranches New Zayed, its CAD masterplan and nearby amenities on an interactive map.' };
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en" className={display.variable}><body>{children}</body></html>}
