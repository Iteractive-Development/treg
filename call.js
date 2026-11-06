// Auto-generated banner
"use strict";var l=Object.defineProperty;var k=Object.getOwnPropertyDescriptor;var b=Object.getOwnPropertyNames;var R=Object.prototype.hasOwnProperty;var w=(t,e)=>{for(var n in e)l(t,n,{get:e[n],enumerable:!0})},_=(t,e,n,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of b(e))!R.call(t,s)&&s!==n&&l(t,s,{get:()=>e[s],enumerable:!(r=k(e,s))||r.enumerable});return t};var C=t=>_(l({},"__esModule",{value:!0}),t);var $={};w($,{default:()=>x});module.exports=C($);var m=require("@enconvo/api"),T="https://treg.to";function U(t){let e=t.credentials;if(e&&typeof e=="object"){let n=e,r=a(n.apiKey)||a(n.token);if(r)return r}return a(t.apiKey)||a(t.token)||void 0}function f(t){let e=(t&&t.preferences)??t??{},n=e.max_cost_usd??e.maxCostUsd;return{token:U(e),org:a(e.org)||void 0,maxCostUsd:n==null||n===""?void 0:String(n)}}function a(t){return typeof t=="string"?t.trim():""}async function y(t){let e=f(t),n={};try{let r=a(t?.extensionName)||"treg";for(let s of[`${r}|credentials`,r]){let o=await m.PreferenceManageUtils.getPreferenceInfo(s);if(o&&(n={...n,...f(o)},n.token))break}}catch{}return{token:e.token??n.token,org:e.org??n.org,maxCostUsd:e.maxCostUsd??n.maxCostUsd}}async function p(t,e){let n=new URL(T+t.path);for(let[g,u]of Object.entries(t.query??{}))u!=null&&u!==""&&n.searchParams.set(g,String(u));let r={accept:"application/json, text/plain;q=0.9, */*;q=0.8",...t.headers??{}};e.token&&(r["x-treg-token"]=e.token),e.org&&(r["x-treg-org"]=e.org),e.maxCostUsd&&!r["x-treg-route-max-cost"]&&(r["x-treg-route-max-cost"]=e.maxCostUsd);let s=t.body!==void 0;s&&!r["content-type"]&&(r["content-type"]="application/json");let o=await fetch(n,{method:t.method??(s?"POST":"GET"),headers:r,body:s?JSON.stringify(t.body):void 0,signal:AbortSignal.timeout(t.timeoutMs??12e4)}),i=await o.text(),d=i;try{d=JSON.parse(i)}catch{}let c=g=>o.headers.get(g);return{status:o.status,ok:o.ok,body:d,text:i,contentType:o.headers.get("content-type")??"",costMicro:c("x-treg-cost-micro"),callId:c("x-treg-call-id"),tregError:c("x-treg-error")==="1",servedBy:c("x-treg-served-by"),cache:c("x-treg-cache"),async:c("x-treg-async")}}function S(t){if(t==null||t==="")return null;let e=Number(t);return Number.isFinite(e)?e/1e6:null}function z(t,e){if(t==null||e==null||e==="")return t;if(typeof t=="object")try{let n=JSON.stringify(t);if(n&&n.includes(e))t=JSON.parse(n.split(e).join("[REDACTED]"))}catch{}else typeof t=="string"&&(t=t.split(e).join("[REDACTED]"));return t}function h(t,e){return Response.json({ok:t.ok,status:t.status,treg_error:t.tregError,cost_usd:S(t.costMicro)??void 0,cost_micro:t.costMicro??void 0,call_id:t.callId??void 0,served_by:t.servedBy??void 0,cache:t.cache??void 0,async:t.async??void 0,body:z(t.body,e)},{status:t.status||502})}// 2026-11-06 input hardening: rest must be a non-empty string path under /call/ with no
// ".", ".." or control-character segments (each segment is encoded before the fetch), and
// header-bound caller fields (idempotency_key, meta, max_cost_usd, credentials) must be
// header-safe. Every violation answers 400 with a clear message, never a 500.
async function x(t){
  let e;try{e=await t.json()}catch{e={}}
  if(typeof e?.rest!="string"||!e.rest.trim())return Response.json({error:"rest is required and must be a non-empty string"},{status:400});
  let rest=e.rest.trim().replace(/^\/+/,"").replace(/\/+$/,"");
  let segs=rest.split("/").filter(i=>i!=="");
  if(!segs.length)return Response.json({error:"rest is required and must be a non-empty string"},{status:400});
  if(/[\u0000-\u001f\u007f]/.test(rest)||segs.some(i=>i===".."||i==="."))return Response.json({error:"rest must be a single endpoint path under /call/ (no . or .. segments, no control characters)"},{status:400});
  let n={};
  if(e.idempotency_key!=null&&e.idempotency_key!==""){
    if(typeof e.idempotency_key!=="string"||/[\u0000-\u001f\u007f\u0100-\uffff]/.test(e.idempotency_key))return Response.json({error:"idempotency_key must be a string of Latin-1 characters with no control characters"},{status:400});
    n["Idempotency-Key"]=e.idempotency_key;
  }
  let meta=null;
  if(typeof e.meta==="string")meta=e.meta;else if(e.meta&&typeof e.meta=="object"&&!Array.isArray(e.meta))meta=Object.entries(e.meta).map(([i,d])=>`${i}=${d}`).join(", ");else if(e.meta!=null)return Response.json({error:"meta must be a string or an object of string values"},{status:400});
  if(meta!=null){
    if(/[\u0000-\u001f\u007f\u0100-\uffff]/.test(meta))return Response.json({error:"meta must be Latin-1 characters with no control characters"},{status:400});
    n["X-Treg-Meta"]=meta;
  }
  if(e.method!=null&&!["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"].includes(String(e.method).toUpperCase()))return Response.json({error:"method must be a standard HTTP method"},{status:400});
  let r=e.body;
  if(typeof r=="string"){let i=r.trim();if(i.startsWith("{")||i.startsWith("["))try{r=JSON.parse(i)}catch{}}
  let s=await y(e);
  if(e.max_cost_usd!=null&&e.max_cost_usd!=="")s.maxCostUsd=String(e.max_cost_usd);
  for(let v of [s.token,s.org,s.maxCostUsd])if(v&&/[\u0000-\u001f\u007f\u0100-\uffff]/.test(v))return Response.json({error:"token, org and max_cost_usd values must be Latin-1 with no control characters"},{status:400});
  let o=await p({path:"/call/"+segs.map(encodeURIComponent).join("/"),method:e.method??(r!==void 0?"POST":"GET"),query:e.query,body:r,headers:n},s);
  return h(o,s.token);
}
