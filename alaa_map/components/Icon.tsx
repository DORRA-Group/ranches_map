// One stroke icon set (24 px grid, 1.6 px line) so every control shares the same weight instead of mixed Unicode glyphs.
const PATHS={
 grid:'M4.5 4.5h6v6h-6zM13.5 4.5h6v6h-6zM4.5 13.5h6v6h-6zM13.5 13.5h6v6h-6z',
 coffee:'M5 9h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9ZM16 10.5h1.2a2.4 2.4 0 0 1 0 4.8H16M8 3.5v2.5M11 3.5v2.5M14 3.5v2.5M4 21h13',
 bag:'M5.8 7.5h12.4l1 13H4.8l1-13ZM9 10V6.5a3 3 0 0 1 6 0V10',
 health:'M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6v-6Z',
 school:'M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9ZM6.5 11v5c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-5M21.5 9v5.5',
 wrench:'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z',
 pin:'M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11ZM12 7.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z',
 search:'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14ZM20 20l-4-4',
 close:'M6.5 6.5l11 11M17.5 6.5l-11 11',
 arrow:'M7.5 16.5l9-9M9 7.5h7.5V15',
 layers:'M12 3.5 21 8.5l-9 5-9-5 9-5ZM3 12.5l9 5 9-5M3 16.5l9 5 9-5',
 cube:'M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4l8-4.6ZM4 7.4l8 4.6 8-4.6M12 12v9.2',
 globe:'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18ZM3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z',
 map:'M9 4.5 3.5 6.8v12.7L9 17.2l6 2.3 5.5-2.3V4.5L15 6.8 9 4.5ZM9 4.5v12.7M15 6.8v12.7',
 focus:'M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z',
 flat:'M4 6.5h16v11H4zM4 12h16M12 6.5v11',
 play:'M8 5.5v13l10.5-6.5L8 5.5Z',
 stop:'M7 7h10v10H7z',
 sun:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8ZM12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4',
 moon:'M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10Z',
} as const;
export type IconName=keyof typeof PATHS;
export function Icon({name,size=16}:{name:IconName;size?:number}){return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={PATHS[name]}/></svg>}
