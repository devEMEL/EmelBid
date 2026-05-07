import{eh as b,dc as L,fP as M,de as t,fQ as g,fR as a,fS as R,fT as q,fp as z,fU as T,fV as I,eb as D,dB as m,em as Q}from"./index-LEybwlkM.js";import{w as U,u as B,p as N,m as W}from"./SelectSourceAsset-DtMDf1hq-C3ryNOZX.js";import{n as x}from"./ScreenLayout-BgwOsyLd-CgpMLruN.js";import{t as Y,h as G}from"./GooglePay-DA-Ff7zK-BDGQjr84.js";import{T as O}from"./triangle-alert-CoVkTtBQ.js";import{C as F}from"./circle-x-DsibqEGj.js";import{S as j}from"./smartphone-Cof9Ju7m.js";import"./ModalHeader-D7u2VQIH-Bt02Zs0R.js";import"./Screen-yabWN6I5-BwALAjML.js";import"./index-Dq_xe9dz-Ct5-JaDC.js";const $=[["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M12 6h.01",key:"1vi96p"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M16 6h.01",key:"1x0f13"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M8 6h.01",key:"1dz90k"}],["path",{d:"M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3",key:"cabbwy"}],["rect",{x:"4",y:"2",width:"16",height:"20",rx:"2",key:"1uxh74"}]],A=b("building",$);const X=[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]],C=b("credit-card",X);const H=[["path",{d:"M10 18v-7",key:"wt116b"}],["path",{d:"M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z",key:"1m329m"}],["path",{d:"M14 18v-7",key:"vav6t3"}],["path",{d:"M18 18v-7",key:"aexdmj"}],["path",{d:"M3 22h18",key:"8prr45"}],["path",{d:"M6 18v-7",key:"1ivflk"}]],f=b("landmark",H),[_,V]=((e,o=750)=>{let s;return[(...r)=>{s&&clearTimeout(s),s=setTimeout((()=>{e(...r)}),o)},()=>{s&&clearTimeout(s)}]})((async(e,o)=>{a({isLoading:!0});try{let{getQuotes:s}=g(),r=await s({source:{asset:o.source.selectedAsset.toUpperCase(),amount:e},destination:{asset:o.destination.asset.toUpperCase(),chain:o.destination.chain,address:o.destination.address},environment:o.environment}),i=r.quotes??[],p=r.provider_errors,l=T(i,e);a({localQuotes:i,localSelectedQuote:i[0]??null,isLoading:!1,quotesWarning:l,quotesErrors:p??null})}catch{a({localQuotes:[],localSelectedQuote:null,quotesWarning:"provider_errors",quotesErrors:null})}})),K=e=>{a({amount:e});let{opts:o}=g();_(e,o)},k=async()=>{let{error:e,state:o,onFailure:s,onSuccess:r}=g();V(),e?s(e):o.status==="provider-success"?await r({status:"confirmed"}):o.status==="provider-confirming"?await r({status:"submitted"}):s(Error("User exited flow"))},J=async()=>{let e,o=q();if(!o)return;let s=z();if(!s)return void a({state:{status:"provider-error"},error:Error("Unable to open payment window")});a({isLoading:!0});let{opts:r,amount:i,getProviderUrl:p,getStatus:l,controller:d}=g(),u=()=>{try{s.closed||s.close()}catch{}};d.current=new AbortController;try{let c=await p({source:{asset:r.source.selectedAsset.toUpperCase(),amount:i||"0"},destination:{asset:r.destination.asset.toUpperCase(),chain:r.destination.chain,address:r.destination.address},provider:o.provider,sub_provider:o.sub_provider??void 0,payment_method:o.payment_method,redirect_url:window.location.origin});s.location.href=c.url,e=c.session_id}catch{return u(),void a({state:{status:"provider-error"},isLoading:!1,error:Error("Unable to start payment session")})}a({isLoading:!1}),a({state:{status:"provider-confirming"}});let n=await B({operation:()=>l({session_id:e,provider:o.provider}),until:c=>c.status==="completed"||c.status==="failed"||c.status==="cancelled",delay:0,interval:2e3,attempts:60,signal:d.current.signal});if(n.status!=="aborted"){if(n.status==="max_attempts")return u(),n.error?(console.error(n.error),void a({state:{status:"select-amount"},isLoading:!1,error:Error("Unable to check payment status. Please try again.")})):void a({state:{status:"provider-error"},error:Error("Could not confirm payment status yet.")});n.result?.status==="completed"?(u(),a({state:{status:"provider-success"}})):(u(),a({state:{status:"provider-error"},error:Error(`Transaction ${n.result?.status??"failed"}`)}))}},Z=()=>{let e=R();e&&e.length>0&&a({state:{status:"select-payment-method",quotes:e}})},ee=()=>{a({state:{status:"select-source-asset"}})},te=()=>{a({error:null,state:{status:"select-amount"}})},oe=e=>{a({localSelectedQuote:e,state:{status:"select-amount"}})},se=e=>{let{opts:o,amount:s}=g(),r={...o,source:{...o.source,selectedAsset:e}};a({opts:r,state:{status:"select-amount"}}),_(s,r)},re=({onClose:e})=>t.jsx(x,{showClose:!0,onClose:e,iconVariant:"loading",title:"Processing transaction",subtitle:"Your purchase is in progress. You can leave this screen — we’ll notify you when it’s complete.",primaryCta:{label:"Done",onClick:e},watermark:!0}),ne=({onClose:e,onRetry:o})=>t.jsx(x,{showClose:!0,onClose:e,icon:F,iconVariant:"error",title:"Something went wrong",subtitle:"We couldn't complete your transaction. Please try again.",primaryCta:{label:"Try again",onClick:o},secondaryCta:{label:"Close",onClick:e},watermark:!0}),ae=({onClose:e})=>t.jsx(x,{showClose:!0,onClose:e,icon:D,iconVariant:"success",title:"Transaction confirmed",subtitle:"Your purchase is processing. Funds should arrive in your wallet within a few minutes.",primaryCta:{label:"Done",onClick:e},watermark:!0});let ie={CREDIT_DEBIT_CARD:"card",APPLE_PAY:"Apple Pay",GOOGLE_PAY:"Google Pay",BANK_TRANSFER:"bank deposit",ACH:"bank deposit",SEPA:"bank deposit",PIX:"PIX"},le={CREDIT_DEBIT_CARD:t.jsx(C,{size:14}),APPLE_PAY:t.jsx(j,{size:14}),GOOGLE_PAY:t.jsx(j,{size:14}),BANK_TRANSFER:t.jsx(A,{size:14}),ACH:t.jsx(A,{size:14}),SEPA:t.jsx(A,{size:14}),PIX:t.jsx(Q,{size:14})},de=e=>le[e]??t.jsx(C,{size:14});const ce=({opts:e,onClose:o,onEditSourceAsset:s,onEditPaymentMethod:r,onContinue:i,onAmountChange:p,amount:l,selectedQuote:d,quotesWarning:u,quotesErrors:n,quotesCount:c,isLoading:h})=>{return t.jsxs(x,{showClose:!0,onClose:o,headerTitle:`Buy ${e.destination.asset.toLocaleUpperCase()}`,primaryCta:{label:"Continue",onClick:i,loading:h,disabled:!d},helpText:u?t.jsxs(ue,{children:[t.jsx(O,{size:16,strokeWidth:2}),t.jsx(pe,{children:t.jsxs(t.Fragment,u==="amount_too_low"?{children:[t.jsx(P,{children:"Amount too low"}),t.jsx(E,{children:"Please choose a higher amount to continue."})]}:{children:[t.jsx(P,{children:"Unable to get quotes"}),t.jsx(E,{children:n?.[0]?.error??"Something went wrong. Please try again."})]})})]}):d&&c>1?t.jsxs(me,{onClick:r,children:[de(d.payment_method),t.jsxs("span",{children:["Pay with ",(y=d.payment_method,ie[y]??y.replace(/_/g," ").toLowerCase().replace(/^\w/,(v=>v.toUpperCase())))]}),t.jsx(I,{size:14})]}):null,watermark:!0,children:[t.jsx(N,{currency:e.source.selectedAsset,value:l,onChange:p,inputMode:"decimal",autoFocus:!0}),t.jsx(W,{selectedAsset:e.source.selectedAsset,onEditSourceAsset:s})]});var y};let ue=m.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--privy-color-warn-bg, #fffbbb);
  border: 1px solid var(--privy-color-border-warning, #facd63);
  overflow: clip;
  width: 100%;

  svg {
    flex-shrink: 0;
    color: var(--privy-color-icon-warning, #facd63);
  }
`,pe=m.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
  min-width: 0;
  font-size: 0.75rem;
  line-height: 1.125rem;
  color: var(--privy-color-foreground);
  font-feature-settings:
    'calt' 0,
    'kern' 0;
  text-align: left;
`,P=m.span`
  font-weight: 600;
`,E=m.span`
  font-weight: 400;
`,me=m.button`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;

  && {
    padding: 0;
    color: var(--privy-color-accent);
    font-size: 0.875rem;
    font-style: normal;
    font-weight: 500;
    line-height: 1.375rem;
  }
`,he={CREDIT_DEBIT_CARD:"Credit / debit card",APPLE_PAY:"Apple Pay",GOOGLE_PAY:"Google Pay",BANK_TRANSFER:"Bank transfer",ACH:"ACH",SEPA:"SEPA",PIX:"PIX"},ye={CREDIT_DEBIT_CARD:t.jsx(C,{size:20}),APPLE_PAY:t.jsx(G,{width:20,height:20}),GOOGLE_PAY:t.jsx(Y,{width:20,height:20}),BANK_TRANSFER:t.jsx(f,{size:20}),ACH:t.jsx(f,{size:20}),SEPA:t.jsx(f,{size:20}),PIX:t.jsx(f,{size:20})},ge=e=>ye[e]??t.jsx(C,{size:20});const xe=({onClose:e,onSelectPaymentMethod:o,quotes:s,isLoading:r})=>t.jsx(x,{showClose:!0,onClose:e,title:"Select payment method",subtitle:"Choose how you'd like to pay",watermark:!0,children:t.jsx(fe,{children:s.map(((i,p)=>{return t.jsx(Ce,{onClick:()=>o(i),disabled:r,children:t.jsxs(ve,{children:[t.jsx(we,{children:ge(i.payment_method)}),t.jsx(Ae,{children:t.jsx(be,{children:(l=i.payment_method,he[l]??l.replace(/_/g," ").toLowerCase().replace(/^\w/,(d=>d.toUpperCase())))})})]})},`${i.provider}-${i.payment_method}-${p}`);var l}))})});let fe=m.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
`,Ce=m.button`
  border-color: var(--privy-color-border-default);
  border-width: 1px;
  border-radius: var(--privy-border-radius-md);
  border-style: solid;
  display: flex;

  && {
    padding: 1rem 1rem;
  }
`,ve=m.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
`,we=m.div`
  color: var(--privy-color-foreground-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`,Ae=m.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  flex: 1;
`,be=m.span`
  color: var(--privy-color-foreground);
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1.25rem;
`;const je=({onClose:e,onContinue:o,onAmountChange:s,onSelectSource:r,onEditSourceAsset:i,onEditPaymentMethod:p,onSelectPaymentMethod:l,onRetry:d,opts:u,state:n,amount:c,selectedQuote:h,quotesWarning:y,quotesErrors:v,quotesCount:S,isLoading:w})=>n.status==="select-amount"?t.jsx(ce,{onClose:e,onContinue:o,onAmountChange:s,onEditSourceAsset:i,onEditPaymentMethod:p,opts:u,amount:c,selectedQuote:h,quotesWarning:y,quotesErrors:v,quotesCount:S,isLoading:w}):n.status==="select-source-asset"?t.jsx(U,{onSelectSource:r,opts:u,isLoading:w}):n.status==="select-payment-method"?t.jsx(xe,{onClose:e,onSelectPaymentMethod:l,quotes:n.quotes,isLoading:w}):n.status==="provider-confirming"?t.jsx(re,{onClose:e}):n.status==="provider-error"?t.jsx(ne,{onClose:e,onRetry:d}):n.status==="provider-success"?t.jsx(ae,{onClose:e}):null,Te={component:()=>{let{onUserCloseViaDialogOrKeybindRef:e}=L(),o=M();if(!o)return null;let{opts:s,state:r,isLoading:i,amount:p,quotesWarning:l,quotesErrors:d,localQuotes:u,localSelectedQuote:n,initialQuotes:c,initialSelectedQuote:h}=o;return e.current=k,t.jsx(je,{onClose:k,opts:s,state:r,isLoading:i,amount:p,selectedQuote:n??h,quotesWarning:l,quotesErrors:d,quotesCount:(u??c)?.length??0,onAmountChange:K,onContinue:J,onSelectSource:se,onEditSourceAsset:ee,onEditPaymentMethod:Z,onSelectPaymentMethod:oe,onRetry:te})}};export{Te as FiatOnrampScreen,Te as default};
