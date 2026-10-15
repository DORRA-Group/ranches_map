'use client';
import dynamic from 'next/dynamic';
const Explorer = dynamic(()=>import('../components/Explorer'),{ssr:false,loading:()=> <div className="loading"><span className="brand">R.</span><p>Finding your place…</p></div>});
export default function Home(){return <Explorer/>}
