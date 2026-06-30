import{l as S,s as z}from"../chunks/Ci43VXtd.js";import{m as M,n as w,q as v,l as A,o as C,w as u,A as E,a4 as x,t as q,x as c,G as h,a5 as G,z as d,y as m,u as y,a6 as H,a7 as P,a8 as V,a9 as B,aa as D}from"../chunks/DOGrFwu9.js";import{I,s as N,i as W}from"../chunks/B-xDorBI.js";import{s as k}from"../chunks/5A4YS7nF.js";import{s as F}from"../chunks/CGnfAG2J.js";function J(r,a){const e=S(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M21.54 15H17a2 2 0 0 0-2 2v4.54"}],["path",{d:"M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17"}],["path",{d:"M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"}],["circle",{cx:"12",cy:"12",r:"10"}]];I(r,z({name:"earth"},()=>e,{get iconNode(){return s},children:(t,i)=>{var o=M(),l=w(o);N(l,a,"default",{}),v(t,o)},$$slots:{default:!0}}))}function K(r,a){const e=S(a,["children","$$slots","$$events","$$legacy"]);/**
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
 */const s=[["path",{d:"M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"}],["path",{d:"M9 18c-4.51 2-5-2-7-2"}]];I(r,z({name:"github"},()=>e,{get iconNode(){return s},children:(t,i)=>{var o=M(),l=w(o);N(l,a,"default",{}),v(t,o)},$$slots:{default:!0}}))}var O=u('<div class="sticky top-0 navbar bg-base-100 shadow-sm z-[2000]"><div class="none"><!></div> <div class="flex-1"><button class="text-2xl pl-2 font-bold btn-ghost">StreetSeeker</button></div> <div class="flex-none"><div class="join hidden sm:inline-flex mr-2"><button>DE</button> <button>EN</button></div> <a class="btn btn-square btn-ghost" aria-label="SourceCode" href="https://github.com/doen1el/street_seekr" target="_blank" rel="noopener noreferrer"><!></a></div></div>');function Q(r,a){A(a,!1);let e=G("en");C(()=>{try{const n=localStorage.getItem("paraglide:locale")||localStorage.getItem("inlang.locale");n==="de"||n==="en"?h(e,n):navigator.language?.toLowerCase().startsWith("de")&&h(e,"de")}catch{}});async function s(n){h(e,n);try{localStorage.setItem("paraglide:locale",n)}catch{}F(n)}W();var t=O(),i=c(t),o=c(i);J(o,{class:"size-7"}),d(i);var l=m(i,4),f=c(l),p=c(f);let b;var g=m(p,2);let _;d(f);var $=m(f,2),L=c($);K(L,{class:"size-6"}),d($),d(l),d(t),E((n,j)=>{b=k(p,1,"btn btn-ghost btn-sm join-item",null,b,n),_=k(g,1,"btn btn-ghost btn-sm join-item",null,_,j)},[()=>({"btn-active":y(e)==="de"}),()=>({"btn-active":y(e)==="en"})]),x("click",p,()=>s("de")),x("click",g,()=>s("en")),v(r,t),q()}var R=u('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/> <link rel="icon" type="image/svg+xml" href="/favicon.ico"/>',1),T=u('<div class="flex min-h-screen flex-col bg-base-200"><!> <main class="flex flex-grow flex-col"><!></main></div>');function te(r,a){var e=T();H(o=>{var l=R();V.title="StreetSeekr",B(2),v(o,l)});var s=c(e);Q(s,{});var t=m(s,2),i=c(t);P(i,()=>a.children??D),d(t),d(e),v(r,e)}export{te as component};
