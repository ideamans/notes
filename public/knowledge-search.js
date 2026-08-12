var l=`/*
 * \u30C8\u30EA\u30AC\u30FC\u306E\u30DC\u30BF\u30F3\u3060\u3051\u306E\u30B9\u30BF\u30A4\u30EB\u3002\u30ED\u30FC\u30C0\u30FC\u3078\u30A4\u30F3\u30E9\u30A4\u30F3\u3067\u57CB\u3081\u8FBC\u3080\u3002
 *
 * \u30C0\u30A4\u30A2\u30ED\u30B0\u672C\u4F53\u306ECSS\u306F\u9045\u5EF6\u30ED\u30FC\u30C9\u3060\u304C\u3001\u30DC\u30BF\u30F3\u306F\u6700\u521D\u304B\u3089\u898B\u3048\u308B\u306E\u3067
 * \u305D\u308C\u307E\u3067\u7D20\u306E\u30DC\u30BF\u30F3\u304C\u9732\u51FA\u3057\u3066\u3057\u307E\u3046\u3002\u3053\u3053\u3060\u3051\u306F\u5373\u5EA7\u306B\u5F53\u3066\u308B\u3002
 *
 * \u5143\u306F style.css \u30681\u3064\u3060\u3063\u305F\u3002
 *
 * \u914D\u7F6E\u5148\u306E\u30B5\u30A4\u30C8\u306F Tailwind/DaisyUI \u306E\u30D0\u30FC\u30B8\u30E7\u30F3\u304C\u30D0\u30E9\u30D0\u30E9\uFF08blog \u306F 3/4\u3001
 * press \u306F 4/5\u3001notes \u306F\u72EC\u81EACSS\uFF09\u306A\u306E\u3067\u3001**\u30B5\u30A4\u30C8\u5074\u306E\u30B9\u30BF\u30A4\u30EB\u306B\u4E00\u5207\u4F9D\u5B58\u3057\u306A\u3044**\u3002
 * \u5909\u6570\u306F\u3053\u3053\u3067\u5B8C\u7D50\u3055\u305B\u3001\u30C0\u30FC\u30AF\u30E2\u30FC\u30C9\u306F prefers-color-scheme \u3067\u81EA\u524D\u306B\u6301\u3064\u3002
 */

.iks-trigger {
  --iks-bg: #ffffff;
  --iks-fg: #1f2933;
  --iks-muted: #6b7280;
  --iks-border: #e5e7eb;
  --iks-hover: #f3f4f6;
  --iks-accent: #2563eb;
  --iks-mark-bg: #fef3c7;
  --iks-mark-fg: #92400e;
  --iks-radius: 8px;
  --iks-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
}

@media (prefers-color-scheme: dark) {
  .iks-trigger {
    --iks-bg: #1b1f24;
    --iks-fg: #e6e6e6;
    --iks-muted: #9aa3ad;
    --iks-border: #333a42;
    --iks-hover: #262c33;
    --iks-accent: #7aa7ff;
    --iks-mark-bg: #4a3b12;
    --iks-mark-fg: #ffe9a8;
    --iks-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  }
}

/* --- \u30C8\u30EA\u30AC\u30FC --- */

.iks-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.35em 0.7em;
  font: inherit;
  font-size: 0.8rem;
  line-height: 1.4;
  color: var(--iks-muted);
  background: var(--iks-bg);
  border: 1px solid var(--iks-border);
  border-radius: var(--iks-radius);
  cursor: pointer;
  white-space: nowrap;
}

.iks-trigger:hover {
  color: var(--iks-fg);
  border-color: var(--iks-accent);
}

.iks-trigger-icon {
  flex: none;
}

.iks-trigger-kbd {
  font: inherit;
  font-size: 0.7em;
  padding: 0.1em 0.35em;
  color: var(--iks-muted);
  border: 1px solid var(--iks-border);
  border-radius: 4px;
}

@media (max-width: 640px) {
  .iks-trigger-label,
  .iks-trigger-kbd {
    display: none;
  }
}

`;var m="[data-knowledge-search]",c="https://knowledge.ideamans.com",k=document.currentScript&&document.currentScript.src,i=null;function u(){if(!i){let e=k||`${c}/knowledge-search.js`;i=import(new URL("knowledge-search-app.js",e).href)}return i}function b(){if(document.querySelector("style[data-knowledge-search-trigger]"))return;let e=document.createElement("style");e.setAttribute("data-knowledge-search-trigger",""),e.textContent=l,document.head.appendChild(e)}function p(){if(document.querySelector("link[data-knowledge-search-css]"))return;let e=k||`${c}/knowledge-search.js`,t=document.createElement("link");t.rel="stylesheet",t.href=new URL("knowledge-search.css",e).href,t.setAttribute("data-knowledge-search-css",""),document.head.appendChild(t)}function h(e){let t=e.dataset.set;return t?{set:t,endpoint:(e.dataset.endpoint||c).replace(/\/$/,""),cross:e.dataset.cross!=="false",label:e.dataset.label||"\u30B5\u30A4\u30C8\u5185\u3092\u691C\u7D22",category:e.dataset.category||"",categoryLabel:e.dataset.categoryLabel||""}:(console.warn("[knowledge-search] data-set \u304C\u6307\u5B9A\u3055\u308C\u3066\u3044\u307E\u305B\u3093",e),null)}function w(e){let t=document.createElement("button");t.type="button",t.className="iks-trigger",t.setAttribute("aria-label",e.label),t.innerHTML=`<svg class="iks-trigger-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg><span class="iks-trigger-label">${y(e.label)}</span><kbd class="iks-trigger-kbd"></kbd>`;let n=t.querySelector(".iks-trigger-kbd"),r=/Mac|iPhone|iPad/.test(navigator.platform||navigator.userAgent);return n.textContent=r?"\u2318K":"Ctrl K",t}function y(e){return String(e).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}async function o(e,t){p(),(await u()).open(e,t)}function g(){let e=document.querySelectorAll(m);if(e.length===0)return;b();let t=null;if(e.forEach(r=>{let s=h(r);if(!s)return;t||(t=s);let a=w(s);a.addEventListener("click",()=>o(s));let d=()=>{p(),u()};a.addEventListener("pointerdown",d,{once:!0}),a.addEventListener("focus",d,{once:!0}),r.appendChild(a)}),!t)return;document.addEventListener("keydown",r=>{(r.metaKey||r.ctrlKey)&&r.key.toLowerCase()==="k"&&(r.preventDefault(),o(t))});let n=new URLSearchParams(location.search).get("q");n&&o(t,n)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",g):g();
