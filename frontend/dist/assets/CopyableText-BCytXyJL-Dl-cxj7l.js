import{di as d,de as e,dB as o,eb as u,ec as m}from"./index-LEybwlkM.js";let a=o.button`
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 0.5rem;

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
`,h=o.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--privy-color-foreground-2);
`,p=o(u)`
  color: var(--privy-color-icon-success);
  flex-shrink: 0;
`,x=o(m)`
  color: var(--privy-color-icon-muted);
  flex-shrink: 0;
`;function j({children:r,iconOnly:l,value:s,hideCopyIcon:i,...c}){let[n,t]=d.useState(!1);return e.jsxs(a,{...c,onClick:()=>{navigator.clipboard.writeText(s||(typeof r=="string"?r:"")).catch(console.error),t(!0),setTimeout((()=>t(!1)),1500)},children:[r," ",n?e.jsxs(h,{children:[e.jsx(p,{})," ",!l&&"Copied"]}):!i&&e.jsx(x,{})]})}const g=({value:r,includeChildren:l,children:s,...i})=>{let[c,n]=d.useState(!1),t=()=>{navigator.clipboard.writeText(r).catch(console.error),n(!0),setTimeout((()=>n(!1)),1500)};return e.jsxs(e.Fragment,{children:[l?e.jsx(a,{...i,onClick:t,children:s}):e.jsx(e.Fragment,{children:s}),e.jsx(a,{...i,onClick:t,children:c?e.jsx(h,{children:e.jsx(p,{})}):e.jsx(x,{})})]})};export{j as m,g as p};
