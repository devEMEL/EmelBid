import{di as n,dc as B,dd as O,dg as V,dJ as q,dF as F,de as r,dV as h,dk as x,dS as K,dH as z,dB as b}from"./index-LEybwlkM.js";import{F as H}from"./EnvelopeIcon-CeUh8pmg.js";import{F as X}from"./PhoneIcon-DQjRjqRL.js";import{o as Y}from"./Layouts-BlFm53ED-BEg7Xg08.js";import{n as J}from"./Link-DJ5gq9Di-Do9aXPHj.js";import{a as Q}from"./shouldProceedtoEmbeddedWalletCreationFlow-BTsQS1ZO-BBqxUst2.js";import{n as Z}from"./ScreenLayout-BgwOsyLd-CgpMLruN.js";import"./ModalHeader-D7u2VQIH-Bt02Zs0R.js";import"./Screen-yabWN6I5-BwALAjML.js";import"./index-Dq_xe9dz-Ct5-JaDC.js";function G({title:o,titleId:d,...S},u){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:u,"aria-labelledby":d},S),o?n.createElement("title",{id:d},o):null,n.createElement("path",{fillRule:"evenodd",d:"M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z",clipRule:"evenodd"}))}const ee=n.forwardRef(G),re=({contactMethod:o,authFlow:d,emailDomain:S,appName:u="Privy",whatsAppEnabled:k=!1,onBack:y,onCodeSubmit:R,onResend:j,errorMessage:p,success:f=!1,resendCountdown:I=0,onInvalidInput:M,onClearError:T})=>{let[c,w]=n.useState(U);n.useEffect((()=>{p||w(U)}),[p]);let g=async v=>{v.preventDefault();let a=v.currentTarget.value.replace(" ","");if(a==="")return;if(isNaN(Number(a)))return void M?.("Code should be numeric");T?.();let m=Number(v.currentTarget.name?.charAt(5)),i=[...a||[""]].slice(0,P-m),s=[...c.slice(0,m),...i,...c.slice(m+i.length)];w(s);let E=Math.min(Math.max(m+i.length,0),P-1);isNaN(Number(v.currentTarget.value))||document.querySelector(`input[name=code-${E}]`)?.focus(),s.every((l=>l&&!isNaN(+l)))&&(document.querySelector(`input[name=code-${E}]`)?.blur(),await R?.(s.join("")))};return r.jsx(Z,{title:"Enter confirmation code",subtitle:r.jsxs("span",d==="email"?{children:["Please check ",r.jsx(W,{children:o})," for an email from"," ",S??"privy.io"," and enter your code below."]}:{children:["Please check ",r.jsx(W,{children:o})," for a",k?" WhatsApp":""," message from ",u," and enter your code below."]}),icon:d==="email"?H:X,onBack:y,showBack:!0,helpText:r.jsxs(se,{children:[r.jsxs("span",{children:["Didn't get ",d==="email"?"an email":"a message","?"]}),I?r.jsxs(le,{children:[r.jsx(ee,{color:"var(--privy-color-foreground)",strokeWidth:1.33,height:"12px",width:"12px"}),r.jsx("span",{children:"Code sent"})]}):r.jsx(J,{as:"button",size:"sm",onClick:j,children:"Resend code"})]}),children:r.jsx(te,{children:r.jsx(Y,{children:r.jsxs(ne,{children:[r.jsx("div",{children:c.map(((v,a)=>r.jsx("input",{name:`code-${a}`,type:"text",value:c[a],onChange:g,onKeyUp:m=>{m.key==="Backspace"&&(i=>{T?.(),w([...c.slice(0,i),"",...c.slice(i+1)]),i>0&&document.querySelector(`input[name=code-${i-1}]`)?.focus()})(a)},inputMode:"numeric",autoFocus:a===0,pattern:"[0-9]",className:`${f?"success":""} ${p?"fail":""}`,autoComplete:z.isMobile?"one-time-code":"off"},a)))}),r.jsx(ie,{$fail:!!p,$success:f,children:r.jsx("span",{children:p==="Invalid or expired verification code"?"Incorrect code":p||(f?"Success!":"")})})]})})})})};let P=6,U=Array(6).fill("");var C,A,oe=((C=oe||{})[C.RESET_AFTER_DELAY=0]="RESET_AFTER_DELAY",C[C.CLEAR_ON_NEXT_VALID_INPUT=1]="CLEAR_ON_NEXT_VALID_INPUT",C),ae=((A=ae||{})[A.EMAIL=0]="EMAIL",A[A.SMS=1]="SMS",A);const ge={component:()=>{let{navigate:o,lastScreen:d,navigateBack:S,setModalData:u,onUserCloseViaDialogOrKeybindRef:k}=B(),y=O(),{closePrivyModal:R,resendEmailCode:j,resendSmsCode:p,getAuthMeta:f,loginWithCode:I,updateWallets:M,createAnalyticsEvent:T}=V(),{authenticated:c,logout:w,user:g}=q(),{whatsAppEnabled:v}=O(),[a,m]=n.useState(!1),[i,s]=n.useState(null),[E,l]=n.useState(null),[N,D]=n.useState(0);k.current=()=>null;let _=f()?.email?0:1,L=_===0?f()?.email||"":f()?.phoneNumber||"",$=F-500;return n.useEffect((()=>{if(N){let t=setTimeout((()=>{D(N-1)}),1e3);return()=>clearTimeout(t)}}),[N]),n.useEffect((()=>{if(c&&a&&g){if(y?.legal.requireUsersAcceptTerms&&!g.hasAcceptedTerms){let t=setTimeout((()=>{o("AffirmativeConsentScreen")}),$);return()=>clearTimeout(t)}if(Q(g,y.embeddedWallets)){let t=setTimeout((()=>{u({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),T({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"AwaitingPasswordlessCodeScreen"}}),w()},callAuthOnSuccessOnClose:!0}}),o("EmbeddedWalletOnAccountCreateScreen")}),$);return()=>clearTimeout(t)}{M();let t=setTimeout((()=>R({shouldCallAuthOnSuccess:!0,isSuccess:!0})),F);return()=>clearTimeout(t)}}}),[c,a,g]),n.useEffect((()=>{if(i&&E===0){let t=setTimeout((()=>{s(null),l(null),document.querySelector("input[name=code-0]")?.focus()}),1400);return()=>clearTimeout(t)}}),[i,E]),r.jsx(re,{contactMethod:L,authFlow:_===0?"email":"sms",emailDomain:y?.appearance.emailDomain,appName:y?.name,whatsAppEnabled:v,onBack:()=>S(),onCodeSubmit:async t=>{try{await I(t),m(!0)}catch(e){if(e instanceof h&&e.privyErrorCode===x.INVALID_CREDENTIALS)s("Invalid or expired verification code"),l(0);else if(e instanceof h&&e.privyErrorCode===x.CANNOT_LINK_MORE_OF_TYPE)s(e.message);else{if(e instanceof h&&e.privyErrorCode===x.USER_LIMIT_REACHED)return console.error(new K(e).toString()),void o("UserLimitReachedScreen");if(e instanceof h&&e.privyErrorCode===x.USER_DOES_NOT_EXIST)return void o("AccountNotFoundScreen");if(e instanceof h&&e.privyErrorCode===x.LINKED_TO_ANOTHER_USER)return u({errorModalData:{error:e,previousScreen:d??"AwaitingPasswordlessCodeScreen"}}),void o("ErrorScreen",!1);if(e instanceof h&&e.privyErrorCode===x.DISALLOWED_PLUS_EMAIL)return u({inlineError:{error:e}}),void o("ConnectOrCreateScreen",!1);if(e instanceof h&&e.privyErrorCode===x.ACCOUNT_TRANSFER_REQUIRED&&e.data?.data?.nonce)return u({accountTransfer:{nonce:e.data?.data?.nonce,account:L,displayName:e.data?.data?.account?.displayName,linkMethod:_===0?"email":"sms",embeddedWalletAddress:e.data?.data?.otherUser?.embeddedWalletAddress}}),void o("LinkConflictScreen");s("Issue verifying code"),l(0)}}},onResend:async()=>{D(30),_===0?await j():await p()},errorMessage:i||void 0,success:a,resendCountdown:N,onInvalidInput:t=>{s(t),l(1)},onClearError:()=>{E===1&&(s(null),l(null))}})}};let te=b.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  gap: 16px;
  flex-grow: 1;
  width: 100%;
`,ne=b.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;

  > div:first-child {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    border-radius: var(--privy-border-radius-sm);

    > input {
      border: 1px solid var(--privy-color-foreground-4);
      background: var(--privy-color-background);
      border-radius: var(--privy-border-radius-sm);
      padding: 8px 10px;
      height: 48px;
      width: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: var(--privy-color-foreground);
      transition: all 0.2s ease;
    }

    > input:focus {
      border: 1px solid var(--privy-color-foreground);
      box-shadow: 0 0 0 1px var(--privy-color-foreground);
    }

    > input:invalid {
      border: 1px solid var(--privy-color-error);
    }

    > input.success {
      border: 1px solid var(--privy-color-border-success);
      background: var(--privy-color-success-bg);
    }

    > input.fail {
      border: 1px solid var(--privy-color-border-error);
      background: var(--privy-color-error-bg);
      animation: shake 180ms;
      animation-iteration-count: 2;
    }
  }

  @keyframes shake {
    0% {
      transform: translate(1px, 0px);
    }
    33% {
      transform: translate(-1px, 0px);
    }
    67% {
      transform: translate(-1px, 0px);
    }
    100% {
      transform: translate(1px, 0px);
    }
  }
`,ie=b.div`
  line-height: 20px;
  min-height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: ${o=>o.$success?"var(--privy-color-success-dark)":o.$fail?"var(--privy-color-error-dark)":"transparent"};
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
`,se=b.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(--privy-color-foreground-2);
`,le=b.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-sm);
  padding: 2px 8px;
  gap: 4px;
  background: var(--privy-color-background-2);
  color: var(--privy-color-foreground-2);
`,W=b.span`
  font-weight: 500;
  word-break: break-all;
  color: var(--privy-color-foreground);
`;export{ge as AwaitingPasswordlessCodeScreen,re as AwaitingPasswordlessCodeScreenView,ge as default};
