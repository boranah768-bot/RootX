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

    const timer = setTimeout(
      () => {
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
      },
      deleteMode ? 40 : 80
    );

    return () => clearTimeout(timer);
  }, [text, deleteMode, i]);

  return (
    <main className="page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="brand">
          <img
            src="/logo.png"
            className="logo"
            alt="RootX Logo"
          />

          <span>ROOTX</span>
        </div>

        <div className="navButtons">

          <button
            className="login"
            onClick={() => router.push("/login")}
          >
            Login
          </button>

          <button
            className="signup"
            onClick={() => router.push("/signup")}
          >
            Get Started
          </button>

        </div>

      </nav>


      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="glow"></div>

        <img
          src="/logo.png"
          className="heroLogo"
          alt="RootX"
        />

        <h1>ROOTX</h1>

        <h2>
          {text}
          <span className="cursor">|</span>
        </h2>

        <p>
          Your AI companion for coding, cybersecurity,
          research and technical problem solving.
        </p>


        <div className="searchBox">

          <input
            placeholder="Ask RootX anything..."
            onFocus={() => router.push("/login")}
          />

          <button
            onClick={() => router.push("/login")}
          >
            ➤
          </button>

        </div>

        <small>
          Powered by RootX AI
        </small>

      </section>


      {/* ================= WHY ROOTX ================= */}

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


      {/* ================= BUILD ================= */}

      <section className="pageSection dark">

        <h2>
          Build With Intelligence
        </h2>

        <p>
          From coding projects to technical learning,
          RootX helps you create smarter solutions.
        </p>

      </section>


      {/* ================= FUTURE ================= */}

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
          onClick={() => router.push("/signup")}
        >
          Join RootX
        </button>

      </section>


      {/* ================= FOOTER ================= */}

      <footer>
        RootX © 2026 — AI for the next generation of builders.
      </footer>


      {/* ================= CSS ================= */}

      <style jsx>{`

        /* =========================
           MAIN
        ========================= */

        .page {
          background: #050505;
          color: white;
          font-family: Arial, sans-serif;

          min-height: 100vh;

          overflow-x: hidden;
        }


        /* =========================
           NAVBAR
        ========================= */

        .navbar {
          position: fixed;

          top: env(safe-area-inset-top, 0px);
          left: 0;

          width: 100%;

          height: 80px;

          display: flex;

          justify-content: space-between;
          align-items: center;

          padding: 0 8%;

          box-sizing: border-box;

          background: rgba(5, 5, 5, 0.75);

          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);

          z-index: 100;
        }


        /* =========================
           BRAND
        ========================= */

        .brand {
          display: flex;

          align-items: center;

          gap: 12px;

          font-size: 25px;

          font-weight: bold;

          flex-shrink: 0;

          white-space: nowrap;
        }


        .logo {
          width: 45px;
          height: 45px;

          border-radius: 12px;

          object-fit: contain;
        }


        /* =========================
           NAV BUTTONS
        ========================= */

        .navButtons {
          display: flex;

          align-items: center;

          justify-content: flex-end;

          gap: 10px;

          flex-shrink: 0;

          white-space: nowrap;
        }


        .login {
          background: transparent;

          color: white;

          border: 1px solid #333;

          padding: 12px 20px;

          border-radius: 10px;

          cursor: pointer;

          white-space: nowrap;

          font-size: 14px;
        }


        .signup,
        .join {
          background: #8cff00;

          color: black;

          border: none;

          padding: 12px 22px;

          border-radius: 10px;

          font-weight: bold;

          cursor: pointer;

          white-space: nowrap;

          font-size: 14px;
        }


        .login:hover {
          background: #151515;
        }


        .signup:hover,
        .join:hover {
          background: #a0ff2f;
        }


        /* =========================
           HERO
        ========================= */

        .hero {
          min-height: 100vh;

          display: flex;

          flex-direction: column;

          justify-content: center;

          align-items: center;

          text-align: center;

          padding: 120px 20px 60px;

          box-sizing: border-box;

          position: relative;
        }


        .glow {
          position: absolute;

          width: 350px;
          height: 350px;

          background: #8cff00;

          filter: blur(150px);

          opacity: 0.15;

          pointer-events: none;
        }


        .heroLogo {
          width: 120px;
          height: 120px;

          border-radius: 25px;

          object-fit: contain;

          position: relative;

          z-index: 1;
        }


        .hero h1 {
          font-size: 80px;

          letter-spacing: 8px;

          margin: 25px 0 10px;

          position: relative;

          z-index: 1;
        }


        .hero h2 {
          color: #8cff00;

          max-width: 800px;

          font-size: 35px;

          min-height: 80px;

          line-height: 1.3;

          margin: 0;

          position: relative;

          z-index: 1;
        }


        /* =========================
           TYPING CURSOR
        ========================= */

        .cursor {
          animation: blink 0.8s infinite;
        }


        @keyframes blink {

          0%,
          50% {
            opacity: 1;
          }

          51%,
          100% {
            opacity: 0;
          }

        }


        .hero p {
          max-width: 600px;

          color: #aaa;

          font-size: 18px;

          line-height: 1.7;

          margin-top: 20px;
        }


        /* =========================
           SEARCH BOX
        ========================= */

        .searchBox {
          display: flex;

          width: 500px;

          max-width: 90%;

          margin-top: 30px;

          padding: 8px;

          background: #111;

          border: 1px solid #333;

          border-radius: 20px;

          box-sizing: border-box;
        }


        .searchBox input {
          flex: 1;

          min-width: 0;

          background: transparent;

          border: none;

          outline: none;

          color: white;

          padding: 15px;

          font-size: 16px;
        }


        .searchBox input::placeholder {
          color: #888;
        }


        .searchBox button {
          background: #8cff00;

          color: black;

          border: none;

          border-radius: 50%;

          width: 45px;

          height: 45px;

          flex-shrink: 0;

          cursor: pointer;

          font-size: 20px;
        }


        .hero small {
          margin-top: 8px;
        }


        /* =========================
           SECTIONS
        ========================= */

        .pageSection {
          min-height: 100vh;

          display: flex;

          flex-direction: column;

          justify-content: center;

          align-items: center;

          text-align: center;

          padding: 80px 10%;

          box-sizing: border-box;
        }


        .dark {
          background: #090909;
        }


        .pageSection h2 {
          font-size: 45px;

          color: #8cff00;
        }


        .pageSection p {
          max-width: 700px;

          color: #aaa;

          font-size: 18px;

          line-height: 1.8;
        }


        /* =========================
           CARDS
        ========================= */

        .cards {
          display: grid;

          grid-template-columns:
            repeat(auto-fit, minmax(250px, 1fr));

          gap: 25px;

          width: 100%;

          margin-top: 40px;
        }


        .cards div {
          background: #111;

          padding: 30px;

          border-radius: 20px;

          border: 1px solid #222;
        }


        .cards h3 {
          color: #8cff00;
        }


        /* =========================
           FOOTER
        ========================= */

        footer {
          text-align: center;

          padding: 40px;

          color: #666;
        }


        /* =========================
           TABLET
        ========================= */

        @media (max-width: 900px) {

          .navbar {
            padding: 0 25px;
          }


          .brand {
            font-size: 22px;
          }


          .logo {
            width: 40px;
            height: 40px;
          }

        }


        /* =========================
           MOBILE
        ========================= */

        @media (max-width: 600px) {

          .navbar {

            /*
             * Small extra space below
             * Android status bar.
             */

            top: env(safe-area-inset-top, 8px);

            height: 70px;

            padding: 8px 14px 0;

            gap: 8px;

            box-sizing: border-box;
          }


          .brand {

            font-size: 19px;

            gap: 7px;

            min-width: 0;
          }


          .logo {

            width: 36px;

            height: 36px;

            border-radius: 9px;
          }


          .navButtons {

            gap: 6px;
          }


          .login {

            padding: 9px 12px;

            font-size: 13px;

            min-height: 40px;
          }


          .signup {

            padding: 9px 12px;

            font-size: 13px;

            min-height: 40px;
          }


          .hero {

            padding-top: 110px;
          }


          .heroLogo {

            width: 95px;

            height: 95px;
          }


          .hero h1 {

            font-size: 52px;

            letter-spacing: 6px;

            margin-top: 20px;
          }


          .hero h2 {

            font-size: 24px;

            min-height: 100px;

            max-width: 340px;
          }


          .hero p {

            font-size: 16px;

            max-width: 340px;
          }


          .searchBox {

            max-width: 92%;

            margin-top: 20px;
          }


          .pageSection {

            padding: 70px 25px;
          }


          .pageSection h2 {

            font-size: 35px;
          }


          .pageSection p {

            font-size: 16px;
          }

        }


        /* =========================
           VERY SMALL PHONES
        ========================= */

        @media (max-width: 380px) {

          .navbar {

            padding-left: 9px;

            padding-right: 9px;
          }


          .brand {

            font-size: 17px;
          }


          .logo {

            width: 32px;

            height: 32px;
          }


          .navButtons {

            gap: 4px;
          }


          .login {

            padding: 8px 9px;

            font-size: 12px;
          }


          .signup {

            padding: 8px 9px;

            font-size: 12px;
          }

        }

      `}</style>

    </main>
  );
}