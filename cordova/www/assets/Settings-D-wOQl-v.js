import{g as z,j as e,C as S,a1 as M,r as b,f as O,w as R,x as T,i as W,q as $,v as H,d as j,M as Z,$ as q,a2 as G,a3 as V,a4 as C,a5 as y,Z as L,O as F,k as J}from"./index-BmB6lFxD.js";var[K,Q]=z({name:"AvatarStylesContext",hookName:"useAvatarStyles",providerName:"<Avatar/>"});function X(a){var t;const r=a.split(" "),s=(t=r[0])!=null?t:"",o=r.length>1?r[r.length-1]:"";return s&&o?`${s.charAt(0)}${o.charAt(0)}`:s.charAt(0)}function _(a){const{name:t,getInitials:r,...s}=a,o=Q();return e.jsx(S.div,{role:"img","aria-label":t,...s,__css:o.label,children:t?r==null?void 0:r(t):null})}_.displayName="AvatarName";var I=a=>e.jsxs(S.svg,{viewBox:"0 0 128 128",color:"#fff",width:"100%",height:"100%",className:"chakra-avatar__svg",...a,children:[e.jsx("path",{fill:"currentColor",d:"M103,102.1388 C93.094,111.92 79.3504,118 64.1638,118 C48.8056,118 34.9294,111.768 25,101.7892 L25,95.2 C25,86.8096 31.981,80 40.6,80 L87.4,80 C96.019,80 103,86.8096 103,95.2 L103,102.1388 Z"}),e.jsx("path",{fill:"currentColor",d:"M63.9961647,24 C51.2938136,24 41,34.2938136 41,46.9961647 C41,59.7061864 51.2938136,70 63.9961647,70 C76.6985159,70 87,59.7061864 87,46.9961647 C87,34.2938136 76.6985159,24 63.9961647,24"})]});function E(a){const{src:t,srcSet:r,onError:s,onLoad:o,getInitials:g,name:u,borderRadius:m,loading:p,iconLabel:c,icon:x=e.jsx(I,{}),ignoreFallback:f,referrerPolicy:l,crossOrigin:i}=a,n=M({src:t,onError:s,crossOrigin:i,ignoreFallback:f})==="loaded";return!t||!n?u?e.jsx(_,{className:"chakra-avatar__initials",getInitials:g,name:u}):b.cloneElement(x,{role:"img","aria-label":c}):e.jsx(S.img,{src:t,srcSet:r,alt:u,onLoad:o,referrerPolicy:l,crossOrigin:i??void 0,className:"chakra-avatar__img",loading:p,__css:{width:"100%",height:"100%",objectFit:"cover",borderRadius:m}})}E.displayName="AvatarImage";var Y={display:"inline-flex",alignItems:"center",justifyContent:"center",textAlign:"center",textTransform:"uppercase",fontWeight:"medium",position:"relative",flexShrink:0},P=O((a,t)=>{const r=R("Avatar",a),[s,o]=b.useState(!1),{src:g,srcSet:u,name:m,showBorder:p,borderRadius:c="full",onError:x,onLoad:f,getInitials:l=X,icon:i=e.jsx(I,{}),iconLabel:d=" avatar",loading:n,children:v,borderColor:h,ignoreFallback:A,crossOrigin:D,referrerPolicy:B,...U}=T(a),w={borderRadius:c,borderWidth:p?"2px":void 0,...Y,...r.container};return h&&(w.borderColor=h),e.jsx(S.span,{ref:t,...U,className:W("chakra-avatar",a.className),"data-loaded":$(s),__css:w,children:e.jsxs(K,{value:r,children:[e.jsx(E,{src:g,srcSet:u,loading:n,onLoad:H(f,()=>{o(!0)}),onError:x,getInitials:l,name:m,borderRadius:c,icon:i,iconLabel:d,ignoreFallback:A,crossOrigin:D,referrerPolicy:B}),v]})})});P.displayName="Avatar";const ee=j.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f7f7f7;
  overflow-y: auto;
  padding: 20px;
  z-index: 1000;
`,ae=j.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`,te=j.form`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`,k=j(L)`
  background-color: #f0f0f0;
  border: none;
  border-radius: 25px;
  padding: 10px 15px;
`,N=j(J)`
  background-color: #333;
  color: #27b600;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #555;
  }
`;function oe({user:a,setUser:t,isOpen:r,onClose:s}){const[o,g]=b.useState({username:"",description:"",age:""}),[u,m]=b.useState(!1),p=Z();b.useEffect(()=>{a&&g({username:a.username||"",description:a.description||"",age:a.age||""})},[a]);const c=l=>{g({...o,[l.target.name]:l.target.value})},x=async l=>{var i,d;l.preventDefault();try{const n=await F.put("/api/users/profile",o);t(n.data.user),s(n.data.user)}catch(n){console.error("Error updating profile:",n),p({title:"Error",description:((d=(i=n.response)==null?void 0:i.data)==null?void 0:d.message)||"Failed to update profile",status:"error",duration:3e3,isClosable:!0})}},f=async l=>{var n,v;const i=l.target.files[0];if(!i)return;const d=new FormData;d.append("photo",i),m(!0);try{const h=await F.post("/api/users/upload-photo",d,{headers:{"Content-Type":"multipart/form-data"}});t(A=>({...A,photo:h.data.user.photo})),p({title:"Photo Updated",status:"success",duration:3e3,isClosable:!0})}catch(h){console.error("Error uploading photo:",h),p({title:"Error",description:((v=(n=h.response)==null?void 0:n.data)==null?void 0:v.message)||"Failed to update photo",status:"error",duration:3e3,isClosable:!0})}finally{m(!1)}};return r?e.jsxs(ee,{children:[e.jsx(ae,{onClick:s,children:"×"}),e.jsx(te,{onSubmit:x,children:e.jsxs(q,{spacing:6,children:[e.jsx(G,{as:"h2",size:"xl",textAlign:"center",children:"Edit Profile"}),e.jsxs(V,{direction:"column",align:"center",children:[e.jsx(P,{size:"2xl",name:a.username,src:a.photo,mb:4}),e.jsxs(C,{children:[e.jsx(y,{htmlFor:"photo",cursor:"pointer",children:e.jsx(N,{as:"span",children:u?"Uploading...":"Change Profile Photo"})}),e.jsx(L,{type:"file",id:"photo",accept:"image/*",onChange:f,hidden:!0})]})]}),e.jsxs(C,{children:[e.jsx(y,{htmlFor:"username",children:"Username"}),e.jsx(k,{id:"username",name:"username",value:o.username,onChange:c})]}),e.jsxs(C,{children:[e.jsx(y,{htmlFor:"description",children:"Description"}),e.jsx(k,{id:"description",name:"description",value:o.description,onChange:c})]}),e.jsxs(C,{children:[e.jsx(y,{htmlFor:"age",children:"Age"}),e.jsx(k,{id:"age",name:"age",type:"number",value:o.age,onChange:c})]}),e.jsx(N,{type:"submit",width:"full",children:"Save Changes"})]})})]}):null}export{oe as default};
