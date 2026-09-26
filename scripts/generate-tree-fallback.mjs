import { writeFileSync } from 'node:fs';
import { createTreePaths } from '../js/tree-paths.js';
const paths=createTreePaths();
const project=p=>[400+p.x*84,350-p.y*84];
const lines=paths.map(({curve,gold})=>`<path d="${curve.getPoints(80).map((p,i)=>`${i?'L':'M'}${project(p).map(n=>n.toFixed(1)).join(',')}`).join(' ')}" stroke="${gold?'#ddec8c':'#69cc65'}" opacity="${gold?.7:.36}"/>`).join('');
const dots=paths.map(({curve},i)=>{const [x,y]=project(curve.getPoint((i*.618034)%1));return `<circle cx="${x}" cy="${y}" r="1.6" fill="#e0ffc2"/>`;}).join('');
const badges=['&lt;/&gt;','API','{ }','SQL','UI','git'].map((text,i)=>{const [x,y]=project(paths[12+i*23].curve.getPoint(.84));return `<g transform="translate(${x} ${y})"><circle r="23" fill="#0b1910" stroke="#a6d377"/><circle r="27" fill="none" stroke="#56894f" stroke-dasharray="100 70"/><text text-anchor="middle" dominant-baseline="central" fill="#e1f5b2" font-family="monospace" font-size="12">${text}</text></g>`;}).join('');
writeFileSync('images/yggdrasil.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="700" viewBox="0 0 800 700"><defs><radialGradient id="a"><stop stop-color="#74c84b" stop-opacity=".17"/><stop offset="1" stop-color="#74c84b" stop-opacity="0"/></radialGradient><filter id="g"><feGaussianBlur stdDeviation="3"/></filter></defs><ellipse cx="400" cy="350" rx="260" ry="290" fill="url(#a)"/><g fill="none" stroke-width="1">${lines}</g><g filter="url(#g)">${dots}</g>${dots}${badges}</svg>`);
