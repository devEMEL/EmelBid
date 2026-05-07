import{eh as C,dB as o,dJ as E,fb as I,dg as L,di as h,de as e,dj as v,dk as x,ee as b,fc as P}from"./index-LEybwlkM.js";import{a as S,c as m}from"./TodoList-CgrU7uwu-BUBKSxCQ.js";import{n as N}from"./ScreenLayout-BgwOsyLd-CgpMLruN.js";import{C as A}from"./circle-check-big-CAvduOXw.js";import{F as w}from"./fingerprint-pattern-L_BWEjTZ.js";import"./ModalHeader-D7u2VQIH-Bt02Zs0R.js";import"./Screen-yabWN6I5-BwALAjML.js";import"./index-Dq_xe9dz-Ct5-JaDC.js";const B=[["path",{d:"M10 11v6",key:"nco0om"}],["path",{d:"M14 11v6",key:"outv1u"}],["path",{d:"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",key:"miytrc"}],["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",key:"e791ji"}]],M=C("trash-2",B),T=({passkeys:s,isLoading:d,errorReason:u,success:y,expanded:r,onLinkPasskey:l,onUnlinkPasskey:a,onExpand:n,onBack:t,onClose:i})=>e.jsx(N,y?{title:"Passkeys updated",icon:A,iconVariant:"success",primaryCta:{label:"Done",onClick:i},onClose:i,watermark:!0}:r?{icon:w,title:"Your passkeys",onBack:t,onClose:i,watermark:!0,children:e.jsx(j,{passkeys:s,expanded:r,onUnlink:a,onExpand:n})}:{icon:w,title:"Set up passkey verification",subtitle:"Verify with passkey",primaryCta:{label:"Add new passkey",onClick:l,loading:d},onClose:i,watermark:!0,helpText:u||void 0,children:s.length===0?e.jsx(W,{}):e.jsx(U,{children:e.jsx(j,{passkeys:s,expanded:r,onUnlink:a,onExpand:n})})});let U=o.div`
  margin-bottom: 12px;
`,j=({passkeys:s,expanded:d,onUnlink:u,onExpand:y})=>{let[r,l]=h.useState([]),a=d?s.length:2;return e.jsxs("div",{children:[e.jsx(z,{children:"Your passkeys"}),e.jsxs(V,{children:[s.slice(0,a).map((n=>{return e.jsxs(F,{children:[e.jsxs("div",{children:[e.jsx(O,{children:(t=n,t.authenticatorName?t.createdWithBrowser?`${t.authenticatorName} on ${t.createdWithBrowser}`:t.authenticatorName:t.createdWithBrowser?t.createdWithOs?`${t.createdWithBrowser} on ${t.createdWithOs}`:`${t.createdWithBrowser}`:"Unknown device")}),e.jsxs(D,{children:["Last used:"," ",(n.latestVerifiedAt??n.firstVerifiedAt)?.toLocaleString()??"N/A"]})]}),e.jsx(Y,{disabled:r.includes(n.credentialId),onClick:()=>(async i=>{l((p=>p.concat([i]))),await u(i),l((p=>p.filter((k=>k!==i))))})(n.credentialId),children:r.includes(n.credentialId)?e.jsx(P,{}):e.jsx(M,{size:16})})]},n.credentialId);var t})),s.length>2&&!d&&e.jsx($,{onClick:y,children:"View all"})]})]})},W=()=>e.jsxs(S,{style:{color:"var(--privy-color-foreground)"},children:[e.jsx(m,{children:"Verify with Touch ID, Face ID, PIN, or hardware key"}),e.jsx(m,{children:"Takes seconds to set up and use"}),e.jsx(m,{children:"Use your passkey to verify transactions and login to your account"})]});const ee={component:()=>{let{user:s}=E(),{unlink:d}=I(),{linkWithPasskey:u,closePrivyModal:y}=L(),r=s?.linkedAccounts.filter((c=>c.type==="passkey")),[l,a]=h.useState(!1),[n,t]=h.useState(""),[i,p]=h.useState(!1),[k,f]=h.useState(!1);return h.useEffect((()=>{r.length===0&&f(!1)}),[r.length]),e.jsx(T,{passkeys:r,isLoading:l,errorReason:n,success:i,expanded:k,onLinkPasskey:()=>{a(!0),u().then((()=>p(!0))).catch((c=>{if(c instanceof v){if(c.privyErrorCode===x.CANNOT_LINK_MORE_OF_TYPE)return void t("Cannot link more passkeys to account.");if(c.privyErrorCode===x.PASSKEY_NOT_ALLOWED)return void t("Passkey request timed out or rejected by user.")}t("Unknown error occurred.")})).finally((()=>{a(!1)}))},onUnlinkPasskey:async c=>(a(!0),await d({credentialId:c}).then((()=>p(!0))).catch((g=>{g instanceof v&&g.privyErrorCode===x.MISSING_MFA_CREDENTIALS?t("Cannot unlink a passkey enrolled in MFA"):t("Unknown error occurred.")})).finally((()=>{a(!1)}))),onExpand:()=>f(!0),onBack:()=>f(!1),onClose:()=>y()})}},te=o.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 90px;
  border-radius: 50%;
  svg + svg {
    margin-left: 12px;
  }
  > svg {
    z-index: 2;
    color: var(--privy-color-accent) !important;
    stroke: var(--privy-color-accent) !important;
    fill: var(--privy-color-accent) !important;
  }
`;let _=b`
  && {
    width: 100%;
    font-size: 0.875rem;
    line-height: 1rem;

    /* Tablet and Up */
    @media (min-width: 440px) {
      font-size: 14px;
    }

    display: flex;
    gap: 12px;
    justify-content: center;

    padding: 6px 8px;
    background-color: var(--privy-color-background);
    transition: background-color 200ms ease;
    color: var(--privy-color-accent) !important;

    :focus {
      outline: none;
      box-shadow: none;
    }
  }
`;const $=o.button`
  ${_}
`;let V=o.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.8rem;
  padding: 0.5rem 0rem 0rem;
  flex-grow: 1;
  width: 100%;
`,z=o.div`
  line-height: 20px;
  height: 20px;
  font-size: 1em;
  font-weight: 450;
  display: flex;
  justify-content: flex-beginning;
  width: 100%;
`,O=o.div`
  font-size: 1em;
  line-height: 1.3em;
  font-weight: 500;
  color: var(--privy-color-foreground-2);
  padding: 0.2em 0;
`,D=o.div`
  font-size: 0.875rem;
  line-height: 1rem;
  color: #64668b;
  padding: 0.2em 0;
`,F=o.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1em;
  gap: 10px;
  font-size: 0.875rem;
  line-height: 1rem;
  text-align: left;
  border-radius: 8px;
  border: 1px solid #e2e3f0 !important;
  width: 100%;
  height: 5em;
`,R=b`
  :focus,
  :hover,
  :active {
    outline: none;
  }
  display: flex;
  width: 2em;
  height: 2em;
  justify-content: center;
  align-items: center;
  svg {
    color: var(--privy-color-error);
  }
  svg:hover {
    color: var(--privy-color-foreground-3);
  }
`,Y=o.button`
  ${R}
`;export{te as DoubleIconWrapper,$ as LinkButton,ee as LinkPasskeyScreen,T as LinkPasskeyView,ee as default};
