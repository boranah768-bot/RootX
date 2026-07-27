"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);

      alert("Welcome back to RootX!");
      router.push("/dashboard");
    } catch (error: any) {
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
          stroke="#dcdcdc"
          strokeWidth="1"
        />

        <text
          fill="#999"
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

      {/* Login Card */}
      <form className="card" onSubmit={handleLogin}>
        <img src="/logo.png" alt="RootX" className="logo" />

        <h1>ROOTX</h1>

        <p className="subtitle">
          Sign in to your AI workspace
        </p>

        <label>Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Login
        </button>

        <p className="login">
          Don't have an account?{" "}
          <span onClick={() => router.push("/signup")}>
            Create Account
          </span>
        </p>
      </form>

      <style jsx>{`
        .page {
          height: 100vh;
          width: 100%;
          background: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: fixed;
          inset: 0;
          color: black;
          font-family: Inter, Arial;
        }

        .circleText {
          position: absolute;
          width: 720px;
          height: 720px;
          animation: rotate 45s linear infinite;
        }

        .glow {
          position: absolute;
          width: 250px;
          height: 250px;
          background: #8cff00;
          filter: blur(140px);
          opacity: 0.15;
          z-index: 0;
        }

        .card {
          width: 390px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e5e5e5;
          border-radius: 24px;
          backdrop-filter: blur(20px);
          z-index: 2;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.12);
        }

        .logo {
          width: 75px;
          height: 75px;
          border-radius: 20px;
          display: block;
          margin: auto;
        }

        h1 {
          text-align: center;
          font-size: 34px;
          letter-spacing: 2px;
          margin: 20px 0 8px;
          color: black;
        }

        .subtitle {
          text-align: center;
          color: #666;
          margin-bottom: 35px;
        }

        label {
          color: #444;
          font-size: 14px;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 15px;
          margin-top: 8px;
          margin-bottom: 22px;
          background: white;
          border: 1px solid #d9d9d9;
          border-radius: 12px;
          color: black;
          font-size: 15px;
          outline: none;
        }

        input::placeholder {
          color: #999;
        }

        button {
          width: 100%;
          padding: 15px;
          background: black;
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          font-size: 15px;
        }

        .login {
          text-align: center;
          color: #666;
          margin-top: 25px;
        }

        .login span {
          color: #36b300;
          cursor: pointer;
          font-weight: 600;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </main>
  );
}