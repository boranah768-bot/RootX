"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const texts = [
    "The AI Assistant Built for Coders & Cybersecurity",
    "Build Smarter With Artificial Intelligence",
    "Solve Technical Problems Faster",
    "Explore Security With Intelligence",
  ];

  const [text, setText] = useState("");
  const [i, setI] = useState(0);
  const [deleteMode, setDeleteMode] = useState(false);

  useEffect(() => {
    const current = texts[i];

    const timer = setTimeout(() => {
      if (!deleteMode) {
        setText(current.substring(0, text.length + 1));

        if (text === current) {
          setTimeout(() => setDeleteMode(true), 1000);
        }
      } else {
        setText(current.substring(0, text.length - 1));

        if (text === "") {
          setDeleteMode(false);
          setI((i + 1) % texts.length);
        }
      }
    }, deleteMode ? 40 : 80);

    return () => clearTimeout(timer);
  }, [text, deleteMode, i]);


  return (
    <main className="page">

      <nav className="navbar">
        <div className="brand">
          <img src="/logo.png" className="logo" />
          <span>ROOTX</span>
        </div>

        <div>
          <button 
            className="login"
            onClick={()=>router.push("/login")}
          >
            Login
          </button>

          <button 
            className="signup"
            onClick={()=>router.push("/signup")}
          >
            Get Started
          </button>
        </div>
      </nav>


      <section className="hero">

        <div className="glow"></div>

        <img src="/logo.png" className="heroLogo"/>

        <h1>ROOTX</h1>

        <h2>{text}<span>|</span></h2>

        <p>
          Your AI companion for coding, cybersecurity,
          research and technical problem solving.
        </p>


        <div className="searchBox">

          <input
            placeholder="Ask RootX anything..."
            onFocus={()=>router.push("/login")}
          />

          <button onClick={()=>router.push("/login")}>
            ➤
          </button>

        </div>

        <small>
          Powered by RootX AI
        </small>

      </section>



      <section className="pageSection">

        <h2>Why RootX?</h2>

        <p>
          RootX helps developers and cybersecurity learners
          understand technology, build projects and solve problems
          with AI assistance.
        </p>


        <div className="cards">

          <div>
            <h3>💻 AI Coding</h3>
            <p>
              Write, debug and improve code faster.
            </p>
          </div>


          <div>
            <h3>🔐 Cybersecurity</h3>
            <p>
              Learn security concepts and technical skills.
            </p>
          </div>


          <div>
            <h3>🧠 Smart Research</h3>
            <p>
              Understand complex topics instantly.
            </p>
          </div>

        </div>

      </section>



      <section className="pageSection dark">

        <h2>
          Build With Intelligence
        </h2>

        <p>
          From coding projects to technical learning,
          RootX helps you create smarter solutions.
        </p>

      </section>



      <section className="pageSection">

        <h2>
          The Future Of AI Development
        </h2>

        <p>
          RootX is creating powerful AI tools for the next
          generation of builders.
        </p>

        <button 
          className="join"
          onClick={()=>router.push("/signup")}
        >
          Join RootX
        </button>

      </section>



      <footer>
        RootX © 2026 — AI for the next generation of builders.
      </footer>



<style jsx>{`

.page{
background:#050505;
color:white;
font-family:Arial, sans-serif;
}


.navbar{
position:fixed;
top:0;
width:100%;
display:flex;
justify-content:space-between;
align-items:center;
padding:20px 8%;
background:rgba(5,5,5,.7);
backdrop-filter:blur(15px);
z-index:10;
}


.brand{
display:flex;
align-items:center;
gap:12px;
font-size:25px;
font-weight:bold;
}


.logo{
width:45px;
height:45px;
border-radius:12px;
}


.login{
background:none;
color:white;
border:1px solid #333;
padding:12px 20px;
border-radius:10px;
margin-right:10px;
}


.signup,
.join{
background:#8cff00;
color:black;
border:none;
padding:12px 22px;
border-radius:10px;
font-weight:bold;
}



.hero{
height:100vh;
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
text-align:center;
padding:20px;
position:relative;
}


.glow{
position:absolute;
width:350px;
height:350px;
background:#8cff00;
filter:blur(150px);
opacity:.15;
}


.heroLogo{
width:120px;
height:120px;
border-radius:25px;
}


.hero h1{
font-size:80px;
letter-spacing:8px;
}


.hero h2{
color:#8cff00;
max-width:800px;
font-size:35px;
min-height:80px;
}


.hero p{
max-width:600px;
color:#aaa;
font-size:18px;
line-height:1.7;
}



.searchBox{
display:flex;
width:500px;
max-width:90%;
margin-top:30px;
padding:8px;
background:#111;
border:1px solid #333;
border-radius:20px;
}


.searchBox input{
flex:1;
background:none;
border:none;
outline:none;
color:white;
padding:15px;
}


.searchBox button{
background:#8cff00;
border:none;
border-radius:50%;
width:45px;
}



.pageSection{
min-height:100vh;
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
text-align:center;
padding:80px 10%;
}


.dark{
background:#090909;
}


.pageSection h2{
font-size:45px;
color:#8cff00;
}


.pageSection p{
max-width:700px;
color:#aaa;
font-size:18px;
line-height:1.8;
}


.cards{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
gap:25px;
width:100%;
margin-top:40px;
}


.cards div{
background:#111;
padding:30px;
border-radius:20px;
border:1px solid #222;
}


.cards h3{
color:#8cff00;
}


footer{
text-align:center;
padding:40px;
color:#666;
}


@media(max-width:700px){

.hero h1{
font-size:50px;
}

.hero h2{
font-size:24px;
}

.navbar{
padding:20px;
}

}

`}</style>


    </main>
  );
}