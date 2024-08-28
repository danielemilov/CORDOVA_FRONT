import{u as D,j as e,V as P,H as U,F as z,Q as A,b as p,c as l,d as y,a as B}from"./ui-NZYliEti.js";import{r as h}from"./vendor-_1ZOfwzY.js";import{d as i,f as C}from"./index-B-zzZdsT.js";import"./utils-VUVtOQ0U.js";const I=i.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f7f7f7;
  overflow-y: auto;
  padding: 20px;
  z-index: 1000;
`,H=i.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`,T=i.form`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`,g=i(y)`
  background-color: #f0f0f0;
  border: none;
  border-radius: 25px;
  padding: 10px 15px;
`,F=i(B)`
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
`;function W({user:t,setUser:m,isOpen:S,onClose:x}){const[a,f]=h.useState({username:"",description:"",age:""}),[v,b]=h.useState(!1),c=D();h.useEffect(()=>{t&&f({username:t.username||"",description:t.description||"",age:t.age||""})},[t]);const u=r=>{f({...a,[r.target.name]:r.target.value})},w=async r=>{var s,n;r.preventDefault();try{const o=await C.put("/api/users/profile",a);m(o.data.user),x(o.data.user)}catch(o){console.error("Error updating profile:",o),c({title:"Error",description:((n=(s=o.response)==null?void 0:s.data)==null?void 0:n.message)||"Failed to update profile",status:"error",duration:3e3,isClosable:!0})}},k=async r=>{var o,j;const s=r.target.files[0];if(!s)return;const n=new FormData;n.append("photo",s),b(!0);try{const d=await C.post("/api/users/upload-photo",n,{headers:{"Content-Type":"multipart/form-data"}});m(E=>({...E,photo:d.data.user.photo})),c({title:"Photo Updated",status:"success",duration:3e3,isClosable:!0})}catch(d){console.error("Error uploading photo:",d),c({title:"Error",description:((j=(o=d.response)==null?void 0:o.data)==null?void 0:j.message)||"Failed to update photo",status:"error",duration:3e3,isClosable:!0})}finally{b(!1)}};return S?e.jsxs(I,{children:[e.jsx(H,{onClick:x,children:"×"}),e.jsx(T,{onSubmit:w,children:e.jsxs(P,{spacing:6,children:[e.jsx(U,{as:"h2",size:"xl",textAlign:"center",children:"Edit Profile"}),e.jsxs(z,{direction:"column",align:"center",children:[e.jsx(A,{size:"2xl",name:t.username,src:t.photo,mb:4}),e.jsxs(p,{children:[e.jsx(l,{htmlFor:"photo",cursor:"pointer",children:e.jsx(F,{as:"span",children:v?"Uploading...":"Change Profile Photo"})}),e.jsx(y,{type:"file",id:"photo",accept:"image/*",onChange:k,hidden:!0})]})]}),e.jsxs(p,{children:[e.jsx(l,{htmlFor:"username",children:"Username"}),e.jsx(g,{id:"username",name:"username",value:a.username,onChange:u})]}),e.jsxs(p,{children:[e.jsx(l,{htmlFor:"description",children:"Description"}),e.jsx(g,{id:"description",name:"description",value:a.description,onChange:u})]}),e.jsxs(p,{children:[e.jsx(l,{htmlFor:"age",children:"Age"}),e.jsx(g,{id:"age",name:"age",type:"number",value:a.age,onChange:u})]}),e.jsx(F,{type:"submit",width:"full",children:"Save Changes"})]})})]}):null}export{W as default};
//# sourceMappingURL=Settings-Ddrr48ER.js.map
