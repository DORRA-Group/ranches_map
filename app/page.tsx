'use client';
import dynamic from 'next/dynamic';
const Explorer = dynamic(()=>import('../components/Explorer'),{ssr:false,loading:()=> <div className="loading"><span className="brand">RANCHES</span><small>NEW ZAYED</small><i className="loading-line"/><p>Preparing the masterplan</p></div>});
export default function Home(){return <Explorer/>}
