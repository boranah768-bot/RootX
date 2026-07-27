"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function SignupPage() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleSignup = async(e:React.FormEvent)=>{
    e.preventDefault();

    try {

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Welcome to RootX!");
      router.push("/dashboard");

    } catch(error:any){

      alert(error.message);

    }
  };


  return (

    <main className="page">


      {/* Circular Text */}

      <svg className="circleText" viewBox="0 0 800 800">

        <defs>

          <path
            id="circlePath"
            d="
            M 400 400
            m -310 0
            a 310 310 0 1 1 620 0
            a 310 310 0 1 1 -620 0
            "
          />

        </defs>


        <circle
          cx="400"
          cy="400"
          r="310"
          fill="none"
          stroke="#202020"
          strokeWidth="1"
        />


        <text
          fill="#262626"
          fontSize="28"
          fontWeight="800"
          letterSpacing="8"
        >

          <textPath href="#circlePath">

            AI • CODE • SECURITY • INTELLIGENCE • ROOTX • FUTURE • CYBER • BUILD • CREATE • SECURE •

          </textPath>

        </text>

      </svg>




      {/* Glow */}

      <div className="glow"></div>




      {/* Signup Card */}

      <form
        className="card"
        onSubmit={handleSignup}
      >


        <img
          src="/logo.png"
          alt="RootX"
          className="logo"
        />


        <h1>
          ROOTX
        </h1>


        <p className="subtitle">
          Create your AI workspace
        </p>



        <label>
          Email
        </label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          required
          onChange={(e)=>setEmail(e.target.value)}
        />



        <label>
          Password
        </label>

        <input
          type="password"
          placeholder="Create password"
          value={password}
          required
          onChange={(e)=>setPassword(e.target.value)}
        />



        <button type="submit">
          Create RootX Account
        </button>



        <p className="login">

          Already have access?{" "}

          <span onClick={()=>router.push("/login")}>
            Login
          </span>

        </p>


      </form>




<style jsx>{`

.page{

height:100vh;
width:100%;
background:#070707;
display:flex;
justify-content:center;
align-items:center;
overflow:hidden;
position:fixed;
inset:0;
color:white;
font-family:Inter,Arial;

}



.circleText{

position:absolute;
width:720px;
height:720px;
animation:rotate 45s linear infinite;

}



.glow{

position:absolute;
width:250px;
height:250px;
background:#8cff00;
filter:blur(140px);
opacity:0.12;
z-index:0;

}



.card{

width:390px;
padding:40px;
background:rgba(18,18,18,0.88);
border:1px solid #292929;
border-radius:24px;
backdrop-filter:blur(20px);
z-index:2;
box-shadow:0 30px 100px rgba(0,0,0,0.7);

}



.logo{

width:75px;
height:75px;
border-radius:20px;
display:block;
margin:auto;

}



h1{

text-align:center;
font-size:34px;
letter-spacing:2px;
margin:20px 0 8px;

}



.subtitle{

text-align:center;
color:#888;
margin-bottom:35px;

}



label{

color:#aaa;
font-size:14px;

}



input{

width:100%;
box-sizing:border-box;
padding:15px;
margin-top:8px;
margin-bottom:22px;
background:#0b0b0b;
border:1px solid #333;
border-radius:12px;
color:white;
font-size:15px;
outline:none;

}



input::placeholder{

color:#666;

}



button{

width:100%;
padding:15px;
background:white;
color:black;
border:none;
border-radius:14px;
font-weight:700;
cursor:pointer;
font-size:15px;

}



.login{

text-align:center;
color:#777;
margin-top:25px;

}



.login span{

color:#8cff00;
cursor:pointer;
font-weight:600;

}



@keyframes rotate{

from{

transform:rotate(0deg);

}

to{

transform:rotate(360deg);

}

}

`}</style>


    </main>

  );
}