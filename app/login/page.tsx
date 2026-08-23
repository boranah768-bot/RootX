"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      router.replace("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);

      let message = "Unable to sign in. Please try again.";

      if (error instanceof Error) {
        const firebaseError = error as Error & { code?: string };

        switch (firebaseError.code) {
          case "auth/invalid-credential":
            message = "Incorrect email or password.";
            break;

          case "auth/user-not-found":
            message = "No RootX account was found with this email.";
            break;

          case "auth/wrong-password":
            message = "Incorrect password.";
            break;

          case "auth/invalid-email":
            message = "Please enter a valid email address.";
            break;

          case "auth/user-disabled":
            message = "This RootX account has been disabled.";
            break;

          case "auth/network-request-failed":
            message = "Network error. Please check your internet connection.";
            break;

          default:
            message = firebaseError.message || message;
        }
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <svg
        className="circleText"
        viewBox="0 0 800 800"
        aria-hidden="true"
      >
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
            AI • CODE • SECURITY • INTELLIGENCE • ROOTX • FUTURE • CYBER •
            BUILD • CREATE • SECURE •
          </textPath>
        </text>
      </svg>

      <div className="glow" />

      <form className="card" onSubmit={handleLogin}>
        <img
          src="/logo.png"
          alt="RootX"
          className="logo"
        />

        <h1>ROOTX</h1>

        <p className="subtitle">
          Sign in to your AI workspace
        </p>

        {error && (
          <div className="errorBox" role="alert">
            {error}
          </div>
        )}

        <label htmlFor="email">
          Email
        </label>

        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          required
          autoComplete="email"
          disabled={loading}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">
          Password
        </label>

        <div className="passwordWrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            required
            autoComplete="current-password"
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="eyeButton"
            onClick={() => setShowPassword((previous) => !previous)}
            disabled={loading}
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? "◉" : "◌"}
          </button>
        </div>

        <button
          type="submit"
          className="loginButton"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="login">
          Don't have an account?{" "}
          <span
            onClick={() => {
              if (!loading) {
                router.push("/signup");
              }
            }}
          >
            Create Account
          </span>
        </p>
      </form>

      <style jsx>{`
        .page {
          min-height: 100vh;
          width: 100%;
          background: #ffffff;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: fixed;
          inset: 0;
          color: black;
          font-family: Inter, Arial, sans-serif;
          padding: 20px;
          box-sizing: border-box;
        }

        .circleText {
          position: absolute;
          width: 720px;
          height: 720px;
          animation: rotate 45s linear infinite;
          pointer-events: none;
        }

        .glow {
          position: absolute;
          width: 250px;
          height: 250px;
          background: #8cff00;
          filter: blur(140px);
          opacity: 0.15;
          z-index: 0;
          pointer-events: none;
        }

        .card {
          width: 390px;
          max-width: 100%;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 40px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid #e5e5e5;
          border-radius: 24px;
          backdrop-filter: blur(20px);
          z-index: 2;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.12);
          box-sizing: border-box;
        }

        .logo {
          width: 75px;
          height: 75px;
          border-radius: 20px;
          display: block;
          margin: auto;
          object-fit: cover;
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
          margin: 0 0 30px;
        }

        .errorBox {
          background: #fff0f0;
          border: 1px solid #ffcaca;
          color: #c62828;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        label {
          display: block;
          color: #444;
          font-size: 14px;
          margin-bottom: 8px;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 15px;
          margin-bottom: 20px;
          background: white;
          border: 1px solid #d9d9d9;
          border-radius: 12px;
          color: black;
          font-size: 15px;
          outline: none;
        }

        input:focus {
          border-color: #888;
        }

        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        input::placeholder {
          color: #999;
        }

        .passwordWrapper {
          position: relative;
        }

        .passwordWrapper input {
          padding-right: 52px;
        }

        .eyeButton {
          position: absolute;
          right: 8px;
          top: 5px;
          width: 40px;
          height: 40px;
          padding: 0;
          background: transparent;
          color: #666;
          border: none;
          cursor: pointer;
          font-size: 20px;
        }

        .eyeButton:hover {
          color: black;
        }

        .loginButton {
          width: 100%;
          padding: 15px;
          background: black;
          color: white;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          font-size: 15px;
          transition: opacity 0.2s ease;
        }

        .loginButton:hover:not(:disabled) {
          opacity: 0.85;
        }

        .loginButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login {
          text-align: center;
          color: #666;
          margin-top: 25px;
          font-size: 14px;
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

        @media (max-width: 700px) {
          .circleText {
            width: 600px;
            height: 600px;
          }

          .card {
            padding: 28px 22px;
          }

          .logo {
            width: 65px;
            height: 65px;
          }

          h1 {
            font-size: 30px;
          }
        }
      `}</style>
    </main>
  );
}