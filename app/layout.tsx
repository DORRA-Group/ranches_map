import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Ranches | Explore your surroundings', description: 'Explore Ranches New Zayed, its CAD masterplan and nearby amenities on an interactive map.' };
export default function Layout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
