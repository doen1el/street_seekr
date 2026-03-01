import{l as S,c as w,d as L}from"../chunks/3l5szf1F.js";import{v as M,w as I,x as v,n as A,N as E,C as u,I as B,M as x,y as D,D as i,A as p,B as G,F as d,G as f,K as y,a0 as H,a1 as P,a2 as V,a3 as q,a4 as F}from"../chunks/D1rX8njY.js";import{i as K,b as k}from"../chunks/KO1hsnFR.js";import{I as N,s as j}from"../chunks/DtLjg7Vh.js";function W(r,a){const e=S(a,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.539.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */const s=[["path",{d:"M21.54 15H17a2 2 0 0 0-2 2v4.54"}],["path",{d:"M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"}],["path",{d:"M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"}],["circle",{cx:"12",cy:"12",r:"10"}]];N(r,w({name:"earth"},()=>e,{get iconNode(){return s},children:(t,c)=>{var n=M(),l=I(n);j(l,a,"default",{}),v(t,n)},$$slots:{default:!0}}))}function J(r,a){const e=S(a,["children","$$slots","$$events","$$legacy"]);/**
 * @license lucide-svelte v0.539.0 - ISC
 *
 * ISC License
 *
 * Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 *
 */const s=[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"}],["path",{d:"M9 18c-4.51 2-5-2-7-2"}]];N(r,w({name:"github"},()=>e,{get iconNode(){return s},children:(t,c)=>{var n=M(),l=I(n);j(l,a,"default",{}),v(t,n)},$$slots:{default:!0}}))}var O=u('<div class="sticky top-0 navbar bg-base-100 shadow-sm z-[2000]"><div class="none"><!></div> <div class="flex-1"><button class="text-2xl pl-2 font-bold btn-ghost">StreetSeeker</button></div> <div class="flex-none"><div class="join hidden sm:inline-flex mr-2"><button>DE</button> <button>EN</button></div> <a class="btn btn-square btn-ghost" aria-label="SourceCode" href="https://github.com/doen1el/street_seekr" target="_blank" rel="noopener noreferrer"><!></a></div></div>');function Q(r,a){A(a,!1);let e=G("en");E(()=>{try{const o=localStorage.getItem("paraglide:locale")||localStorage.getItem("inlang.locale");o==="de"||o==="en"?p(e,o):navigator.language?.toLowerCase().startsWith("de")&&p(e,"de")}catch{}});async function s(o){p(e,o);try{localStorage.setItem("paraglide:locale",o)}catch{}L(o)}K();var t=O(),c=i(t),n=i(c);W(n,{class:"size-7"}),d(c);var l=f(c,4),h=i(l),m=i(h);let b;var g=f(m,2);let _;d(h);var $=f(h,2),z=i($);J(z,{class:"size-6"}),d($),d(l),d(t),B((o,C)=>{b=k(m,1,"btn btn-ghost btn-sm join-item",null,b,o),_=k(g,1,"btn btn-ghost btn-sm join-item",null,_,C)},[()=>({"btn-active":y(e)==="de"}),()=>({"btn-active":y(e)==="en"})]),x("click",m,()=>s("de")),x("click",g,()=>s("en")),v(r,t),D()}var R=u('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"/> <link rel="icon" type="image/svg+xml" href="/favicon.ico"/>',1),T=u('<div class="flex min-h-screen flex-col bg-base-200"><!> <main class="flex flex-grow flex-col"><!></main></div>');function ee(r,a){var e=T();H(n=>{var l=R();V.title="StreetSeekr",q(4),v(n,l)});var s=i(e);Q(s,{});var t=f(s,2),c=i(t);P(c,()=>a.children??F),d(t),d(e),v(r,e)}export{ee as component};
