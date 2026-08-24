"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [error, setError] = useState("");

  /*
   * CHECK EXISTING LOGIN
   *
   * If the user has already logged in before,
   * Firebase will restore the session automatically.
   */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
        return;
      }

      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, [router]);

  /*
   * EMAIL LOGIN
   */

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      /*
       * IMPORTANT:
       * This keeps the Firebase session saved
       * even after the browser is closed.
       */

      await setPersistence(
        auth,
        browserLocalPersistence
      );

      await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        password
      );

      router.replace("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);

      switch (error?.code) {
        case "auth/invalid-credential":
          setError(
            "Incorrect email or password."
          );
          break;

        case "auth/user-not-found":
          setError(
            "No account exists with this email."
          );
          break;

        case "auth/wrong-password":
          setError(
            "Incorrect password."
          );
          break;

        case "auth/invalid-email":
          setError(
            "Please enter a valid email address."
          );
          break;

        case "auth/too-many-requests":
          setError(
            "Too many attempts. Please try again later."
          );
          break;

        case "auth/network-request-failed":
          setError(
            "Network error. Please check your internet connection."
          );
          break;

        default:
          setError(
            error?.message ||
              "Login failed. Please try again."
          );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * GOOGLE LOGIN
   */

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const provider =
        new GoogleAuthProvider();

      /*
       * Keep Google users logged in too.
       */

      await setPersistence(
        auth,
        browserLocalPersistence
      );

      await signInWithPopup(
        auth,
        provider
      );

      router.replace("/dashboard");
    } catch (error: any) {
      console.error(
        "Google login error:",
        error
      );

      if (
        error?.code ===
        "auth/popup-closed-by-user"
      ) {
        setError(
          "Google login was cancelled."
        );
      } else if (
        error?.code ===
        "auth/popup-blocked"
      ) {
        setError(
          "Your browser blocked the Google login popup."
        );
      } else {
        setError(
          error?.message ||
            "Google login failed."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * LOADING SCREEN
   */

  if (checkingAuth) {
    return (
      <main className="page">
        <div className="loadingBox">
          <img
            src="/logo.png"
            alt="RootX"
            className="loadingLogo"
          />

          <div className="loadingText">
            Loading RootX...
          </div>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            width: 100%;
            background: #090909;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family:
              Inter,
              Arial,
              Helvetica,
              sans-serif;
          }

          .loadingBox {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 18px;
          }

          .loadingLogo {
            width: 64px;
            height: 64px;
            border-radius: 17px;
            object-fit: cover;
          }

          .loadingText {
            color: #777;
            font-size: 14px;
          }
        `}</style>
      </main>
    );
  }

  /*
   * LOGIN PAGE
   */

  return (
    <main className="page">
      <div className="backgroundGlow" />

      <section className="loginCard">

        {/* LOGO */}

        <div className="logoWrapper">
          <img
            src="/logo.png"
            alt="RootX"
            className="logo"
          />
        </div>

        {/* TITLE */}

        <h1>Welcome back</h1>

        <p className="subtitle">
          Login to your RootX workspace
        </p>

        {/* ERROR */}

        {error && (
          <div className="errorBox">
            {error}
          </div>
        )}

        {/* EMAIL LOGIN */}

        <form onSubmit={handleLogin}>

          <label htmlFor="email">
            Email
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@example.com"
            autoComplete="email"
            disabled={loading}
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={loading}
          />

          <button
            type="submit"
            className="loginButton"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Login"}
          </button>

        </form>

        {/* DIVIDER */}

        <div className="divider">
          <span />
          <p>OR</p>
          <span />
        </div>

        {/* GOOGLE */}

        <button
          type="button"
          className="googleButton"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <span className="googleIcon">
            G
          </span>

          <span>
            Continue with Google
          </span>
        </button>

        {/* SIGNUP */}

        <div className="signupText">
          Don't have an account?

          <button
            type="button"
            onClick={() =>
              router.push("/signup")
            }
          >
            Create account
          </button>
        </div>

      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          width: 100%;
          background: #090909;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        .backgroundGlow {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: rgba(
            140,
            255,
            0,
            0.035
          );
          filter: blur(100px);
          pointer-events: none;
        }

        .loginCard {
          width: 100%;
          max-width: 420px;
          background: #111;
          border: 1px solid #292929;
          border-radius: 22px;
          padding: 36px;
          position: relative;
          z-index: 1;
          box-shadow:
            0 30px 80px
              rgba(0, 0, 0, 0.45);
        }

        .logoWrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 22px;
        }

        .logo {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          object-fit: cover;
        }

        h1 {
          margin: 0;
          text-align: center;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .subtitle {
          margin: 9px 0 28px;
          color: #777;
          text-align: center;
          font-size: 14px;
        }

        .errorBox {
          padding: 11px 13px;
          margin-bottom: 18px;
          border: 1px solid #4a2626;
          border-radius: 10px;
          background: #211313;
          color: #ff8f8f;
          font-size: 13px;
          line-height: 1.5;
        }

        label {
          display: block;
          color: #aaa;
          font-size: 13px;
          margin-bottom: 7px;
        }

        input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          margin-bottom: 17px;
          background: #181818;
          border: 1px solid #303030;
          border-radius: 11px;
          color: #fff;
          outline: none;
          font-size: 14px;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        input::placeholder {
          color: #555;
        }

        input:focus {
          border-color: #555;
          background: #1b1b1b;
        }

        input:disabled {
          opacity: 0.6;
        }

        .loginButton {
          width: 100%;
          height: 48px;
          margin-top: 3px;
          border: 0;
          border-radius: 11px;
          background: #fff;
          color: #000;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition:
            transform 0.15s ease,
            opacity 0.15s ease;
        }

        .loginButton:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .loginButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .divider span {
          height: 1px;
          flex: 1;
          background: #292929;
        }

        .divider p {
          margin: 0;
          color: #555;
          font-size: 10px;
        }

        .googleButton {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: 1px solid #333;
          border-radius: 11px;
          background: #171717;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .googleButton:hover:not(:disabled) {
          background: #1d1d1d;
          border-color: #444;
        }

        .googleButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .googleIcon {
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff;
          color: #4285f4;
          font-size: 14px;
          font-weight: 800;
        }

        .signupText {
          margin-top: 24px;
          text-align: center;
          color: #666;
          font-size: 13px;
        }

        .signupText button {
          margin-left: 5px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #fff;
          font-size: 13px;
          cursor: pointer;
          font-weight: 600;
        }

        .signupText button:hover {
          text-decoration: underline;
        }

        @media (max-width: 500px) {
          .page {
            padding: 16px;
          }

          .loginCard {
            padding: 28px 22px;
            border-radius: 18px;
          }

          h1 {
            font-size: 27px;
          }
        }
      `}</style>
    </main>
  );
}