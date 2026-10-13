// Original piped-stroke letter coordinates for this concept. No font outlines or client logo.
const glyphs: Record<string,string> = {
 S:'M31 10C11-3 1 13 7 25C12 35 35 27 34 44C34 59 12 64 4 52',
 W:'M2 5L7 55Q8 64 13 52L21 22L28 53Q33 65 36 53L41 5',
 E:'M32 5L6 5L6 57L34 57M7 30L27 30',
 T:'M1 5L37 5M19 5L19 58',
 P:'M6 58L6 5L23 5Q41 5 37 21Q35 32 7 32',
 O:'M20 4C-3 4-3 58 20 58C43 58 43 4 20 4Z',
 L:'M6 5L6 56L35 56',
 A:'M2 57L17 7Q20-1 24 8L39 57M10 38L32 38',
 Y:'M2 5L20 31L38 5M20 31L20 58',
 C:'M36 11C10-10-7 12 4 43Q15 68 36 51',
 U:'M4 5L4 40Q4 65 22 57Q38 54 38 37L38 5',
 N:'M4 58L4 5L37 57L37 5',
 R:'M5 58L5 5L24 5Q42 7 34 23Q28 32 6 31M22 31L39 58',
 H:'M5 5L5 58M37 5L37 58M5 30L37 30',
};
export function Lettering({text}:{text:string}) {
 const letters = [...text.toUpperCase()];
 return <span style={{display:'inline-block',width:'100%'}}><span className="sr-only">{text}</span><svg aria-hidden="true" viewBox={`0 0 ${letters.length*49} 80`} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">{letters.map((letter,i)=><g key={i} transform={`translate(${i*49+4} ${i%2?5:7})`}>{glyphs[letter]&&<path d={glyphs[letter]}/>}</g>)}</svg></span>;
}
