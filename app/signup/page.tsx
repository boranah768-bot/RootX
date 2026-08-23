"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanName = name.trim();
    const cleanAge = age.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    const ageNumber = Number(cleanAge);

    if (!cleanAge || !Number.isInteger(ageNumber) || ageNumber < 13 || ageNumber > 100) {
      setError("Please enter a valid age between 13 and 100.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: cleanName,
      });

      router.replace("/dashboard");
    } catch (error: unknown) {
      console.error("Signup error:", error);

      let message = "Unable to create your RootX account. Please try again.";

      if (error instanceof Error) {
        const firebaseError = error as Error & { code?: string };

        switch (firebaseError.code) {
          case "auth/email-already-in-use":
            message = "An account with this email already exists.";
            break;

          case "auth/invalid-email":
            message = "Please enter a valid email address.";
            break;

          case "auth/weak-password":
            message = "Your password is too weak. Use at least 6 characters.";
            break;

          case "auth/network-request-failed":
            message = "Network error. Please check your internet connection.";
            break;

          case "auth/operation-not-allowed":
            message = "Email/password signup is not enabled in Firebase.";
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
            AI • CODE • SECURITY • INTELLIGENCE • ROOTX • FUTURE • CYBER •
            BUILD • CREATE • SECURE •
          </textPath>
        </text>
      </svg>

      <div className="glow" />

      <form className="card" onSubmit={handleSignup}>
        <img src="/logo.png" alt="RootX" className="logo" />

        <h1>ROOTX</h1>

        <p className="subtitle">
          Create your AI workspace
        </p>

        {error && (
          <div className="errorBox" role="alert">
            {error}
          </div>
        )}

        <label htmlFor="name">
          Name
        </label>

        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          disabled={loading}
          required
        />

        <label htmlFor="age">
          Age
        </label>

        <input
          id="age"
          type="number"
          placeholder="Enter your age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min="13"
          max="100"
          disabled={loading}
          required
        />

        <label htmlFor="email">
          Email
        </label>

        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={loading}
          required
        />

        <label htmlFor="password">
          Password
        </label>

        <div className="passwordWrapper">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={loading}
            required
          />

          <button
            type="button"
            className="eyeButton"
            onClick={() => setShowPassword((previous) => !previous)}
            disabled={loading}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "◉" : "◌"}
          </button>
        </div>

        <button
          type="submit"
          className="createButton"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create RootX Account"}
        </button>

        <p className="login">
          Already have access?{" "}
          <span
            onClick={() => {
              if (!loading) {
                router.push("/login");
              }
            }}
          >
            Login
          </span>
        </p>
      </form>

      <style jsx>{`
        .page {
          min-height: 100vh;
          width: 100%;
          background: #070707;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          position: fixed;
          inset: 0;
          color: white;
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
          opacity: 0.12;
          z-index: 0;
          pointer-events: none;
        }

        .card {
          width: 390px;
          max-width: 100%;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 40px;
          background: rgba(18, 18, 18, 0.92);
          border: 1px solid #292929;
          border-radius: 24px;
          backdrop-filter: blur(20px);
          z-index: 2;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.7);
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
        }

        .subtitle {
          text-align: center;
          color: #888;
          margin: 0 0 30px;
        }

        .errorBox {
          background: rgba(255, 70, 70, 0.1);
          border: 1px solid rgba(255, 70, 70, 0.35);
          color: #ff8b8b;
          padding: 12px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        label {
          display: block;
          color: #aaa;
          font-size: 14px;
          margin-bottom: 8px;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          padding: 15px;
          margin-bottom: 20px;
          background: #0b0b0b;
          border: 1px solid #333;
          border-radius: 12px;
          color: white;
          font-size: 15px;
          outline: none;
        }

        input:focus {
          border-color: #666;
        }

        input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        input::placeholder {
          color: #666;
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
          color: #aaa;
          border: none;
          cursor: pointer;
          font-size: 20px;
        }

        .eyeButton:hover {
          color: white;
        }

        .createButton {
          width: 100%;
          padding: 15px;
          background: white;
          color: black;
          border: none;
          border-radius: 14px;
          font-weight: 700;
          cursor: pointer;
          font-size: 15px;
          transition: opacity 0.2s ease;
        }

        .createButton:hover:not(:disabled) {
          opacity: 0.9;
        }

        .createButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login {
          text-align: center;
          color: #777;
          margin-top: 25px;
          font-size: 14px;
        }

        .login span {
          color: #8cff00;
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