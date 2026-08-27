"use client";

import { useEffect, useState } from "react";

export default function FounderPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /*
    HERO ANIMATION

    0 - 650px:
    Logo grows + rotates.

    650 - 1000px:
    Logo becomes extremely large and fades into black.

    After 1000px:
    Founder section appears.
  */

  const logoProgress = Math.min(scrollY / 700, 1);

  const scale = 0.75 + logoProgress * 7;
  const rotation = logoProgress * 360;

  const logoOpacity =
    scrollY < 850
      ? 1
      : Math.max(0, 1 - (scrollY - 850) / 180);

  const heroOpacity =
    scrollY < 650
      ? 1
      : Math.max(0, 1 - (scrollY - 650) / 250);

  const founderOpacity =
    scrollY < 650
      ? 0
      : Math.min(1, (scrollY - 650) / 300);

  const founderMove =
    scrollY < 650
      ? 80
      : Math.max(0, 80 - (scrollY - 650) * 0.3);

  return (
    <main className="page">

      {/* =========================================
          CINEMATIC HERO
      ========================================= */}

      <section className="cinematic">

        {/* Black background */}
        <div className="black-background" />

        {/* Small top branding */}
        <div
          className="top-brand"
          style={{
            opacity: heroOpacity,
          }}
        >
          <img src="/logo.png" alt="RootX" />
          <span>ROOTX</span>
        </div>

        {/* Small instruction */}
        <div
          className="scroll-text"
          style={{
            opacity: heroOpacity,
          }}
        >
          <span>SCROLL TO ENTER</span>
          <div className="scroll-arrow">↓</div>
        </div>

        {/* Main animated logo */}
        <div
          className="hero-logo"
          style={{
            transform: `
              translate(-50%, -50%)
              scale(${scale})
              rotate(${rotation}deg)
            `,
            opacity: logoOpacity,
          }}
        >
          <img src="/logo.png" alt="RootX Logo" />
        </div>

        {/* Cinematic black fade */}
        <div
          className="cinematic-fade"
          style={{
            opacity:
              scrollY < 650
                ? 0
                : Math.min(1, (scrollY - 650) / 220),
          }}
        />

        {/* Founder intro */}
        <div
          className="founder-intro"
          style={{
            opacity: founderOpacity,
            transform: `translateY(${founderMove}px)`,
          }}
        >
          <div className="intro-line" />

          <p>FOUNDER & CEO</p>

          <h1>
            Harshit
            <br />
            <span>Borana</span>
          </h1>

          <div className="intro-line" />
        </div>
      </section>

      {/* =========================================
          FOUNDER CONTENT
      ========================================= */}

      <section className="content">

        <div className="content-inner">

          <div className="label">
            ABOUT THE FOUNDER
          </div>

          <h2>
            Building
            <br />
            <span>RootX.</span>
          </h2>

          <div className="content-grid">

            <div>
              <p className="big-text">
                Harshit Borana is the founder and CEO
                behind RootX.
              </p>
            </div>

            <div className="description">
              <p>
                RootX is an AI-powered platform focused
                on coding, cybersecurity, research and
                technical problem solving.
              </p>

              <p>
                The vision is simple — create technology
                that helps people build, learn and
                experiment without unnecessary complexity.
              </p>

              <p>
                From an idea on a screen to a product
                people can actually use, every part of
                RootX is built around experimentation,
                learning and constant improvement.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          VISION
      ========================================= */}

      <section className="vision">

        <div className="vision-content">

          <p className="label">
            THE VISION
          </p>

          <h2>
            Think.
            <br />
            Build.
            <br />
            <span>Evolve.</span>
          </h2>

          <p className="vision-text">
            Technology is not just something to use.
            It is something to create.
          </p>

        </div>

      </section>

      {/* =========================================
          ROOTX SECTION
      ========================================= */}

      <section className="rootx-section">

        <div className="rootx-card">

          <div className="card-logo">
            <img src="/logo.png" alt="RootX" />
          </div>

          <p className="label">
            THE PRODUCT
          </p>

          <h2>
            ROOTX
          </h2>

          <p className="rootx-description">
            AI for coding, cybersecurity, research
            and the next generation of builders.
          </p>

          <a
            href="https://www.rootx.fun"
            className="rootx-button"
          >
            Enter RootX
            <span>↗</span>
          </a>

        </div>

      </section>

      {/* =========================================
          FINAL FOUNDER MESSAGE
      ========================================= */}

      <section className="final">

        <div className="final-logo">
          <img src="/logo.png" alt="RootX" />
        </div>

        <p className="label">
          FOUNDED BY
        </p>

        <h2>
          Harshit Borana
        </h2>

        <p className="final-description">
          Founder & CEO of RootX.
          <br />
          Building the future, one idea at a time.
        </p>

        <a
          href="https://www.rootx.fun"
          className="back-button"
        >
          ← Back to RootX
        </a>

      </section>

      {/* =========================================
          FOOTER
      ========================================= */}

      <footer>

        <div className="footer-brand">
          <img src="/logo.png" alt="RootX" />
          <span>ROOTX</span>
        </div>

        <span>
          Founded by Harshit Borana
        </span>

      </footer>

      <style jsx>{`

        * {
          box-sizing: border-box;
        }

        .page {
          background: #000;
          color: #fff;
          min-height: 100vh;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
          overflow-x: hidden;
        }

        /* ======================================
           CINEMATIC HERO
        ====================================== */

        .cinematic {
          position: relative;
          height: 170vh;
          background: #000;
        }

        .black-background {
          position: fixed;
          inset: 0;
          background: #000;
          z-index: 0;
        }

        .top-brand {
          position: fixed;
          top: 28px;
          left: 32px;
          z-index: 20;

          display: flex;
          align-items: center;
          gap: 10px;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 4px;

          transition: opacity 0.2s linear;
        }

        .top-brand img {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }

        .scroll-text {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translateX(-50%);

          z-index: 20;

          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;

          color: #555;
          font-size: 9px;
          letter-spacing: 3px;

          transition: opacity 0.2s linear;
        }

        .scroll-arrow {
          font-size: 18px;
          color: #888;

          animation: arrowMove 1.5s infinite;
        }

        .hero-logo {
          position: fixed;

          left: 50%;
          top: 50%;

          width: 120px;
          height: 120px;

          z-index: 10;

          display: flex;
          align-items: center;
          justify-content: center;

          transform-origin: center;

          will-change: transform, opacity;

          pointer-events: none;
        }

        .hero-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .cinematic-fade {
          position: fixed;
          inset: 0;

          z-index: 12;

          background: #000;

          pointer-events: none;
        }

        .founder-intro {
          position: fixed;

          z-index: 15;

          left: 50%;
          top: 50%;

          transform: translate(-50%, 0);

          width: 100%;

          display: flex;
          flex-direction: column;
          align-items: center;

          text-align: center;

          pointer-events: none;
        }

        .founder-intro p {
          margin: 25px 0;

          color: #555;

          font-size: 10px;
          font-weight: 700;
          letter-spacing: 5px;
        }

        .founder-intro h1 {
          margin: 0;

          font-size: clamp(60px, 11vw, 150px);

          line-height: 0.82;

          letter-spacing: -7px;

          font-weight: 850;
        }

        .founder-intro h1 span {
          color: #555;
        }

        .intro-line {
          width: 70px;
          height: 1px;
          background: #333;
        }

        /* ======================================
           CONTENT
        ====================================== */

        .content {
          position: relative;
          z-index: 30;

          background: #050505;

          min-height: 900px;

          padding: 180px 30px;
        }

        .content-inner {
          max-width: 1100px;
          margin: auto;
        }

        .label {
          color: #555;

          font-size: 10px;
          font-weight: 700;

          letter-spacing: 4px;
        }

        .content h2 {
          margin: 35px 0 120px;

          font-size: clamp(70px, 10vw, 130px);

          line-height: 0.8;

          letter-spacing: -8px;
        }

        .content h2 span {
          color: #555;
        }

        .content-grid {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 100px;
        }

        .big-text {
          font-size: 28px;

          line-height: 1.4;

          color: #ddd;

          margin: 0;
        }

        .description p {
          margin: 0 0 28px;

          color: #777;

          font-size: 17px;

          line-height: 1.9;
        }

        /* ======================================
           VISION
        ====================================== */

        .vision {
          position: relative;

          z-index: 30;

          min-height: 1000px;

          background: #000;

          display: flex;

          align-items: center;

          padding: 150px 30px;
        }

        .vision-content {
          max-width: 1100px;

          width: 100%;

          margin: auto;
        }

        .vision h2 {
          margin: 40px 0 80px;

          font-size: clamp(80px, 13vw, 170px);

          line-height: 0.78;

          letter-spacing: -10px;
        }

        .vision h2 span {
          color: #555;
        }

        .vision-text {
          max-width: 400px;

          margin-left: auto;

          color: #666;

          font-size: 17px;

          line-height: 1.8;
        }

        /* ======================================
           ROOTX
        ====================================== */

        .rootx-section {
          position: relative;

          z-index: 30;

          background: #050505;

          padding: 150px 25px;
        }

        .rootx-card {
          max-width: 1050px;

          min-height: 650px;

          margin: auto;

          padding: 65px;

          border: 1px solid #1d1d1d;

          border-radius: 30px;

          background: #080808;
        }

        .card-logo {
          width: 75px;
          height: 75px;

          display: flex;

          align-items: center;
          justify-content: center;

          border: 1px solid #222;

          border-radius: 20px;
        }

        .card-logo img {
          width: 50px;
          height: 50px;

          object-fit: contain;
        }

        .rootx-card .label {
          margin-top: 90px;
        }

        .rootx-card h2 {
          margin: 25px 0;

          font-size: clamp(80px, 12vw, 150px);

          line-height: 0.8;

          letter-spacing: -10px;
        }

        .rootx-description {
          max-width: 500px;

          color: #666;

          font-size: 17px;

          line-height: 1.8;
        }

        .rootx-button {
          display: inline-flex;

          align-items: center;

          gap: 12px;

          margin-top: 25px;

          padding: 14px 22px;

          background: #fff;

          color: #000;

          border-radius: 12px;

          text-decoration: none;

          font-size: 13px;

          font-weight: 700;

          transition: 0.25s;
        }

        .rootx-button:hover {
          transform: translateY(-3px);
        }

        /* ======================================
           FINAL
        ====================================== */

        .final {
          position: relative;

          z-index: 30;

          min-height: 900px;

          background: #000;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          padding: 100px 20px;
        }

        .final-logo {
          width: 80px;
          height: 80px;

          margin-bottom: 35px;
        }

        .final-logo img {
          width: 100%;
          height: 100%;

          object-fit: contain;
        }

        .final h2 {
          margin: 25px 0;

          font-size: clamp(55px, 9vw, 120px);

          line-height: 0.9;

          letter-spacing: -7px;
        }

        .final-description {
          color: #666;

          font-size: 15px;

          line-height: 1.8;
        }

        .back-button {
          margin-top: 35px;

          padding: 15px 22px;

          border: 1px solid #292929;

          border-radius: 12px;

          color: #ddd;

          text-decoration: none;

          font-size: 13px;

          transition: 0.25s;
        }

        .back-button:hover {
          background: #fff;

          color: #000;
        }

        /* ======================================
           FOOTER
        ====================================== */

        footer {
          position: relative;

          z-index: 30;

          padding: 30px;

          border-top: 1px solid #171717;

          display: flex;

          justify-content: space-between;

          align-items: center;

          color: #444;

          font-size: 10px;
        }

        .footer-brand {
          display: flex;

          align-items: center;

          gap: 10px;

          color: #777;

          font-weight: 800;

          letter-spacing: 3px;
        }

        .footer-brand img {
          width: 30px;
          height: 30px;

          object-fit: contain;
        }

        /* ======================================
           ANIMATION
        ====================================== */

        @keyframes arrowMove {

          0% {
            transform: translateY(0);
            opacity: 0.3;
          }

          50% {
            transform: translateY(8px);
            opacity: 1;
          }

          100% {
            transform: translateY(0);
            opacity: 0.3;
          }

        }

        /* ======================================
           MOBILE
        ====================================== */

        @media (max-width: 700px) {

          .top-brand {
            top: 20px;
            left: 20px;
          }

          .hero-logo {
            width: 95px;
            height: 95px;
          }

          .founder-intro h1 {
            font-size: 60px;
            letter-spacing: -4px;
          }

          .content {
            padding: 130px 22px;
          }

          .content h2 {
            margin-bottom: 70px;

            font-size: 70px;

            letter-spacing: -5px;
          }

          .content-grid {
            grid-template-columns: 1fr;

            gap: 45px;
          }

          .big-text {
            font-size: 22px;
          }

          .vision {
            min-height: 800px;

            padding: 120px 22px;
          }

          .vision h2 {
            font-size: 80px;

            letter-spacing: -6px;
          }

          .vision-text {
            margin-left: 0;
          }

          .rootx-section {
            padding: 100px 20px;
          }

          .rootx-card {
            padding: 35px;

            min-height: 550px;

            border-radius: 24px;
          }

          .rootx-card h2 {
            font-size: 90px;

            letter-spacing: -7px;
          }

          footer {
            flex-direction: column;

            gap: 15px;

            text-align: center;
          }

        }

      `}</style>

    </main>
  );
}