import{di as d,de as e,dq as p,eb as x,ec as m,dB as o}from"./index-LEybwlkM.js";import{$ as f}from"./ModalHeader-D7u2VQIH-Bt02Zs0R.js";const z=({address:r,showCopyIcon:i,url:n,className:a})=>{let[s,l]=d.useState(!1);function c(t){t.stopPropagation(),navigator.clipboard.writeText(r).then((()=>l(!0))).catch(console.error)}return d.useEffect((()=>{if(s){let t=setTimeout((()=>l(!1)),3e3);return()=>clearTimeout(t)}}),[s]),e.jsxs(h,n?{children:[e.jsx(j,{title:r,className:a,href:`${n}/address/${r}`,target:"_blank",children:p(r)}),i&&e.jsx(f,{onClick:c,size:"sm",style:{gap:"0.375rem"},children:e.jsxs(e.Fragment,s?{children:["Copied",e.jsx(x,{size:16})]}:{children:["Copy",e.jsx(m,{size:16})]})})]}:{children:[e.jsx(g,{title:r,className:a,children:p(r)}),i&&e.jsx(f,{onClick:c,size:"sm",style:{gap:"0.375rem",fontSize:"14px"},children:e.jsxs(e.Fragment,s?{children:["Copied",e.jsx(x,{size:14})]}:{children:["Copy",e.jsx(m,{size:14})]})})]})};let h=o.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`,g=o.span`
  font-size: 14px;
  font-weight: 500;
  color: var(--privy-color-foreground);
`,j=o.a`
  font-size: 14px;
  color: var(--privy-color-foreground);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;export{z as d};
