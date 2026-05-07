import{di as d,de as e,eb as p,ec as x,dB as r}from"./index-LEybwlkM.js";import{$ as f}from"./ModalHeader-D7u2VQIH-Bt02Zs0R.js";import{e as h}from"./ErrorMessage-D8VaAP5m-BchOp5jP.js";import{r as g}from"./LabelXs-oqZNqbm_-DCOJNY4p.js";import{d as j}from"./Address-DF9G842N-DIXg6AV0.js";import{d as u}from"./shared-FM0rljBt-C2k7T47t.js";let v=r(u)`
  && {
    padding: 0.75rem;
    height: 56px;
  }
`,y=r.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`,C=r.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`,b=r.div`
  font-size: 12px;
  line-height: 1rem;
  color: var(--privy-color-foreground-3);
`,z=r(g)`
  text-align: left;
  margin-bottom: 0.5rem;
`,w=r(h)`
  margin-top: 0.25rem;
`,E=r(f)`
  && {
    gap: 0.375rem;
    font-size: 14px;
  }
`;const I=({errMsg:s,balance:o,address:a,className:c,title:n,showCopyButton:m=!1})=>{let[t,l]=d.useState(!1);return d.useEffect((()=>{if(t){let i=setTimeout((()=>l(!1)),3e3);return()=>clearTimeout(i)}}),[t]),e.jsxs("div",{children:[n&&e.jsx(z,{children:n}),e.jsx(v,{className:c,$state:s?"error":void 0,children:e.jsxs(y,{children:[e.jsxs(C,{children:[e.jsx(j,{address:a,showCopyIcon:!1}),o!==void 0&&e.jsx(b,{children:o})]}),m&&e.jsx(E,{onClick:function(i){i.stopPropagation(),navigator.clipboard.writeText(a).then((()=>l(!0))).catch(console.error)},size:"sm",children:e.jsxs(e.Fragment,t?{children:["Copied",e.jsx(p,{size:14})]}:{children:["Copy",e.jsx(x,{size:14})]})})]})}),s&&e.jsx(w,{children:s})]})};export{I as j};
