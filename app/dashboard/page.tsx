"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function Dashboard() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<
    { role: "user" | "rootx"; text: string }[]
  >([]);


const sendMessage = async () => {
  if (!message.trim()) return;

  const userText = message;

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      text: userText,
    },
  ]);

  setMessage("");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: userText,
      }),
    });

    const data = await response.json();

    setMessages((prev) => [
      ...prev,
      {
        role: "rootx",
        text: data.reply || "No response received.",
      },
    ]);

  } catch (error) {

    setMessages((prev) => [
      ...prev,
      {
        role: "rootx",
        text: "Connection error. Please try again.",
      },
    ]);

  }
};


  const newChat = () => {
    setMessages([]);
    setSidebarOpen(false);
  };


  const logout = async () => {
    await signOut(auth);
    router.push("/login");
  };


  return (
    <main
      style={{
        height: "100vh",
        background: "#090909",
        color: "white",
        fontFamily: "Inter, Arial",
        overflow: "hidden",
      }}
    >


      {/* RootX Logo Button */}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed",
          top: "22px",
          left: "22px",
          zIndex: 50,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <img
          src="/logo.png"
          alt="RootX"
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "12px",
          }}
        />
      </button>



      {/* Sidebar */}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: sidebarOpen ? 0 : "-320px",
          width: "300px",
          height: "100vh",
          background: "#111111",
          padding: "25px",
          transition: "0.35s ease",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
        }}
      >


        <div
          style={{
            display:"flex",
            alignItems:"center",
            gap:"12px",
            marginBottom:"35px",
          }}
        >

          <img
            src="/logo.png"
            alt="RootX"
            style={{
              width:"40px",
              height:"40px",
              borderRadius:"10px",
            }}
          />

          <h2
            style={{
              margin:0,
              letterSpacing:"3px",
              fontSize:"20px",
            }}
          >
            ROOTX
          </h2>

        </div>



        <button
          onClick={newChat}
          style={{
            padding:"13px",
            background:"#ffffff",
            color:"#000",
            border:"none",
            borderRadius:"12px",
            fontWeight:"700",
            cursor:"pointer",
          }}
        >
          + New Chat
        </button>



        <div style={{marginTop:"30px"}}>

          <MenuItem text="⌕  Search Chats"/>
          <MenuItem text="★  Pinned Chats"/>
          <MenuItem text="◷  Recent"/>
          <MenuItem text="▣  Library"/>

        </div>



        <p
          style={{
            marginTop:"35px",
            color:"#666",
            fontSize:"12px",
          }}
        >
          CHAT HISTORY
        </p>


        <p
          style={{
            color:"#777",
            fontSize:"14px",
          }}
        >
          No saved chats
        </p>



        <div
          style={{
            marginTop:"auto",
            borderTop:"1px solid #222",
            paddingTop:"20px",
          }}
        >

          <p
            style={{
              margin:0,
              fontWeight:"600",
            }}
          >
            RootX User
          </p>

          <small
            style={{
              color:"#777",
            }}
          >
            AI Developer
          </small>


          <button
            onClick={logout}
            style={{
              marginTop:"15px",
              width:"100%",
              padding:"11px",
              background:"transparent",
              color:"#aaa",
              border:"1px solid #333",
              borderRadius:"10px",
              cursor:"pointer",
            }}
          >
            Logout
          </button>


        </div>


      </aside>




      {/* Main Chat */}

      <section
        style={{
          height:"100%",
          display:"flex",
          flexDirection:"column",
          alignItems:"center",
        }}
      >


        {messages.length === 0 ? (

          <div
            style={{
              flex:1,
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              flexDirection:"column",
            }}
          >

            <img
              src="/logo.png"
              alt="RootX"
              style={{
                width:"100px",
                height:"100px",
                borderRadius:"25px",
              }}
            />


            <h1
              style={{
                fontSize:"48px",
                marginTop:"25px",
              }}
            >
              Welcome to RootX
            </h1>


            <p
              style={{
                color:"#888",
              }}
            >
              Your AI assistant for coding, security and research
            </p>


          </div>


        ) : (

          <div
            style={{
              width:"750px",
              maxWidth:"90%",
              flex:1,
              overflowY:"auto",
              paddingTop:"80px",
            }}
          >

            {messages.map((msg,index)=>(

              <div
                key={index}
                style={{
                  display:"flex",
                  justifyContent:
                  msg.role==="user"
                  ? "flex-end"
                  : "flex-start",
                  marginBottom:"18px",
                }}
              >

                <div
                  style={{
                    maxWidth:"70%",
                    padding:"14px 18px",
                    borderRadius:"18px",
                    background:
                    msg.role==="user"
                    ? "#ffffff"
                    : "#171717",
                    color:
                    msg.role==="user"
                    ? "#000"
                    : "#fff",
                  }}
                >
                  {msg.text}
                </div>


              </div>

            ))}


          </div>

        )}




        {/* Message Box */}

        <div
          style={{
            width:"750px",
            maxWidth:"90%",
            padding:"20px",
            display:"flex",
            gap:"12px",
          }}
        >

          <input
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter") sendMessage();
            }}
            placeholder="Message RootX..."
            style={{
              flex:1,
              padding:"16px",
              background:"#151515",
              color:"white",
              border:"1px solid #333",
              borderRadius:"16px",
              outline:"none",
            }}
          />


          <button
            onClick={sendMessage}
            style={{
              padding:"0 28px",
              background:"#ffffff",
              color:"#000",
              border:"none",
              borderRadius:"16px",
              fontWeight:"700",
              cursor:"pointer",
            }}
          >
            Send
          </button>


        </div>


      </section>


    </main>
  );
}



function MenuItem({text}:{text:string}){

return(
<div
style={{
padding:"12px 5px",
color:"#cfcfcf",
fontSize:"15px",
cursor:"pointer",
}}
>
{text}
</div>
);

}