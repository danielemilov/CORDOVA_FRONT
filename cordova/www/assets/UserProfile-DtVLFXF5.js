import{d as i,j as t,F as p,a as s,b as x,c as d,e as l,S as c,U as f,D as h,B as g}from"./index-BmB6lFxD.js";const u=i.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgb(0, 0, 0);
  z-index: 1000;
  overflow-y: auto;
  
  display: flex;
  flex-direction: column;
`,b=i.div`
  height: 60vh;
  background-image: url(${o=>o.src});
  background-size: cover;
  background-position: center;
  position: relative;
`,m=i.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30%;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
`,w=i.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: #fff;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`,j=i(c)`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 12px;
  height: 12px;
  box-shadow: 0 0 0 2px #fff;
`,k=i(f)`
  position: absolute;
  bottom: 30px;
  left: 20px;
  font-size: 32px;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
`,v=i.div`
  position: absolute;
  bottom: 32px;
  right: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
  text-shadow: 1px 1px 3px rgba(0,0,0,0.5);
`,y=i.div`
  padding: 20px 20px 30px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #0000003b;
  border-top-left-radius: 0px;
  border-top-right-radius: 120px;
  margin-top: -30px;
  position: relative;
  box-shadow: 0px -5px 20px rgba(0, 0, 0, 0.1);
`,z=i.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
`,D=i.div`
  display: flex;
  align-items: center;
  max-width: fit-content;
  justify-content: center;
  font-size: 16px;
  color: #ffffff;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: rgba(0, 0, 0, 0.861);
  border-radius: 20px;
`,P=i.div`
  position: relative;
  padding: 20px;
  padding-right: 40px;
  margin-bottom: 30px;
  margin-left: 20px;
  background-color: #f0f0f0;
  border-top-right-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 2px 30px rgb(249, 249, 249);
  width: calc(100% + 10px);
  left: -10px;
  
  @media (min-width: 375px) {
    width: calc(100% + 20px);
    left: -20px;
  }

  @media (min-width: 481px) {
    width: calc(100% + 60px);
    left: -60px;
  }

  @media (min-width: 769px) {
    width: calc(100% + 150px);
    left: -150px;
  }
`,e=i.span`
  position: absolute;
  font-size: 24px;
  color: #ddd;
`,C=i(e)`
  top: 10px;
  left: 10px;
`,F=i(e)`
  bottom: 10px;
  right: 10px;
`,B=i(h)`
  font-size: 18px;
  line-height: 1.6;
  color: #333;
  text-align: left;
  padding-left: 10px;
  
  @media (min-width: 375px) {
    padding-left: 20px;
  }

  @media (min-width: 481px) {
    padding-left: 60px;
  }

  @media (min-width: 769px) {
    padding-left: 150px;
  }
`,L=i(g)`
  padding: 15px 30px;
  font-size: 18px;
  background-color: #00000034;
  color: #ffffff;
  border-radius: 30px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #333;
    transform: translateY(-2px);
  }
`,Q=o=>o==null?"Unknown distance":o<1?"Less than 1 km away":o<10?`${o.toFixed(1)} km away`:`${Math.round(o)} km away`,U=({user:o,isOpen:n,onClose:r,onChatClick:a})=>n?t.jsxs(u,{children:[t.jsxs(b,{src:o.photo?o.photo.replace("http://","https://"):"https://via.placeholder.com/800x600",children:[t.jsx(m,{}),t.jsx(w,{onClick:r,children:t.jsx(p,{})}),t.jsx(j,{$online:o.isOnline}),t.jsx(k,{children:o.username}),t.jsx(v,{children:o.age})]}),t.jsxs(y,{children:[t.jsxs(z,{children:[t.jsxs(P,{children:[t.jsx(C,{children:t.jsx(s,{})}),t.jsx(B,{children:o.description}),t.jsx(F,{children:t.jsx(x,{})})]}),t.jsxs(L,{onClick:()=>a(o),children:[t.jsx(d,{style:{marginRight:"10px"}}),"Chat"]})]}),t.jsxs(D,{children:[t.jsx(l,{style:{marginRight:"10px"}}),Q(o.distance)]})]})]}):null;export{U as default};
