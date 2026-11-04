import {notFound} from 'next/navigation';
import Workbench from '@/components/v12/Workbench';
export const dynamic='force-dynamic';
export default function Page(){if(process.env.VERCEL_ENV!=='preview'&&process.env.NODE_ENV!=='development')notFound();return <Workbench/>}
