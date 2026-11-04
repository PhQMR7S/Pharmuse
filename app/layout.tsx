import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Pharmuse | Learn Pharmacology',description:'Play, learn, and master pharmacology in Arabic and English.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en" suppressHydrationWarning><body>{children}</body></html>}
