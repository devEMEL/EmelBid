import{eh as A,dJ as k,dg as M,dc as N,di as o,fj as O,dP as E,eO as C,eP as T,de as t,dF as P,dB as p,cn as I,ck as z,fk as $}from"./index-LEybwlkM.js";import{h as q}from"./CopyToClipboard-DSTf_eKU-DYjjVcEc.js";import{a as F}from"./Layouts-BlFm53ED-BEg7Xg08.js";import{a as J,i as V}from"./JsonTree-aPaJmPx7-jtW6aiIE.js";import{n as H}from"./ScreenLayout-BgwOsyLd-CgpMLruN.js";import"./ModalHeader-D7u2VQIH-Bt02Zs0R.js";import"./Screen-yabWN6I5-BwALAjML.js";import"./index-Dq_xe9dz-Ct5-JaDC.js";const B=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],K=A("square-pen",B),Q=p.img`
  && {
    height: ${e=>e.size==="sm"?"65px":"140px"};
    width: ${e=>e.size==="sm"?"65px":"140px"};
    border-radius: 16px;
    margin-bottom: 12px;
  }
`;let W=e=>{if(!I(e))return e;try{let a=z(e);return a.includes("�")?e:a}catch{return e}},G=e=>{try{let a=$.decode(e),s=new TextDecoder().decode(a);return s.includes("�")?e:s}catch{return e}},X=e=>{let{types:a,primaryType:s,...l}=e.typedData;return t.jsxs(t.Fragment,{children:[t.jsx(te,{data:l}),t.jsx(q,{text:(i=e.typedData,JSON.stringify(i,null,2)),itemName:"full payload to clipboard"})," "]});var i};const Y=({method:e,messageData:a,copy:s,iconUrl:l,isLoading:i,success:g,walletProxyIsLoading:m,errorMessage:x,isCancellable:d,onSign:c,onCancel:y,onClose:u})=>t.jsx(H,{title:s.title,subtitle:s.description,showClose:!0,onClose:u,icon:K,iconVariant:"subtle",helpText:x?t.jsx(ee,{children:x}):void 0,primaryCta:{label:s.buttonText,onClick:c,disabled:i||g||m,loading:i},secondaryCta:d?{label:"Not now",onClick:y,disabled:i||g||m}:void 0,watermark:!0,children:t.jsxs(F,{children:[l?t.jsx(Q,{style:{alignSelf:"center"},size:"sm",src:l,alt:"app image"}):null,t.jsxs(Z,{children:[e==="personal_sign"&&t.jsx(w,{children:W(a)}),e==="eth_signTypedData_v4"&&t.jsx(X,{typedData:a}),e==="solana_signMessage"&&t.jsx(w,{children:G(a)})]})]})}),de={component:()=>{let{authenticated:e}=k(),{initializeWalletProxy:a,closePrivyModal:s}=M(),{navigate:l,data:i,onUserCloseViaDialogOrKeybindRef:g}=N(),[m,x]=o.useState(!0),[d,c]=o.useState(""),[y,u]=o.useState(),[f,b]=o.useState(null),[j,S]=o.useState(!1);o.useEffect((()=>{e||l("LandingScreen")}),[e]),o.useEffect((()=>{a(O).then((n=>{x(!1),n||(c("An error has occurred, please try again."),u(new E(new C(d,T.E32603_DEFAULT_INTERNAL_ERROR.eipCode))))}))}),[]);let{method:R,data:_,confirmAndSign:v,onSuccess:D,onFailure:U,uiOptions:r}=i.signMessage,L={title:r?.title||"Sign message",description:r?.description||"Signing this message will not cost you any fees.",buttonText:r?.buttonText||"Sign and continue"},h=n=>{n?D(n):U(y||new E(new C("The user rejected the request.",T.E4001_USER_REJECTED_REQUEST.eipCode))),s({shouldCallAuthOnSuccess:!1}),setTimeout((()=>{b(null),c(""),u(void 0)}),200)};return g.current=()=>{h(f)},t.jsx(Y,{method:R,messageData:_,copy:L,iconUrl:r?.iconUrl&&typeof r.iconUrl=="string"?r.iconUrl:void 0,isLoading:j,success:f!==null,walletProxyIsLoading:m,errorMessage:d,isCancellable:r?.isCancellable,onSign:async()=>{S(!0),c("");try{let n=await v();b(n),S(!1),setTimeout((()=>{h(n)}),P)}catch(n){console.error(n),c("An error has occurred, please try again."),u(new E(new C(d,T.E32603_DEFAULT_INTERNAL_ERROR.eipCode))),S(!1)}},onCancel:()=>h(null),onClose:()=>h(f)})}};let Z=p.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,ee=p.p`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-error-dark);
    font-size: 14px;
    line-height: 22px;
  }
`,te=p(J)`
  margin-top: 0;
`,w=p(V)`
  margin-top: 0;
`;export{de as SignRequestScreen,Y as SignRequestView,de as default};
