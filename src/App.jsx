import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kqhdlhgghbeqsohbhboa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxaGRsaGdnaGJlcXNvaGJoYm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Mzk5NzAsImV4cCI6MjA5NjExNTk3MH0._Zb8kMbw78F4aGWJ6wC7-Kqd9TG_L4LBD9DEmPRCiys";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ROCK_SHAPES = [
  "M50,15 C70,10 90,25 88,45 C86,65 75,80 55,85 C35,90 15,78 12,58 C9,38 30,20 50,15Z",
  "M45,12 C68,8 92,20 90,48 C88,76 70,88 48,88 C26,88 8,72 10,48 C12,24 22,16 45,12Z",
  "M55,10 C78,12 94,30 92,55 C90,78 72,90 50,90 C28,90 8,76 8,52 C8,28 32,8 55,10Z",
  "M48,8 C74,6 95,22 93,50 C91,72 76,92 52,92 C28,92 5,76 6,50 C7,24 22,10 48,8Z",
];

const ACCESSORIES = {
  none: null,
  hat: { emoji: "🎩", y: 5 },
  flower: { emoji: "🌸", y: 5 },
  crown: { emoji: "👑", y: 3 },
  glasses: { emoji: "🕶️", y: 38 },
  bow: { emoji: "🎀", y: 8 },
};

function RockSVG({ rock, size = 100, speaking = false }) {
  const shape = ROCK_SHAPES[rock.shapeIndex || 0];
  const acc = ACCESSORIES[rock.accessory || "none"];
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{
        filter: speaking ? `drop-shadow(0 0 8px ${rock.color}cc)` : "drop-shadow(2px 4px 6px rgba(0,0,0,0.4))",
        animation: speaking ? "pulse 1s ease-in-out infinite" : "none",
        transition: "filter 0.3s",
      }}>
        <defs>
          <radialGradient id={`g${rock.id}`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor={lighten(rock.color, 40)} />
            <stop offset="60%" stopColor={rock.color} />
            <stop offset="100%" stopColor={darken(rock.color, 30)} />
          </radialGradient>
          <filter id={`tex${rock.id}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <path d={shape} fill={`url(#g${rock.id})`} filter={`url(#tex${rock.id})`} />
        <circle cx="36" cy="44" r="5" fill="rgba(0,0,0,0.7)" />
        <circle cx="62" cy="44" r="5" fill="rgba(0,0,0,0.7)" />
        <circle cx="38" cy="42" r="1.5" fill="white" />
        <circle cx="64" cy="42" r="1.5" fill="white" />
        {speaking
          ? <ellipse cx="49" cy="62" rx="8" ry="5" fill="rgba(0,0,0,0.6)" />
          : <path d="M41,62 Q49,68 57,62" stroke="rgba(0,0,0,0.5)" strokeWidth="2" fill="none" strokeLinecap="round" />}
      </svg>
      {acc && (
        <div style={{ position: "absolute", left: "50%", top: `${(acc.y / 100) * size - size * 0.15}px`, transform: "translateX(-50%)", fontSize: size * 0.32, lineHeight: 1, pointerEvents: "none" }}>
          {acc.emoji}
        </div>
      )}
    </div>
  );
}

function lighten(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgb(${Math.min(255,(n>>16)+amt)},${Math.min(255,((n>>8)&0xff)+amt)},${Math.min(255,(n&0xff)+amt)})`;
}
function darken(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgb(${Math.max(0,(n>>16)-amt)},${Math.max(0,((n>>8)&0xff)-amt)},${Math.max(0,(n&0xff)-amt)})`;
}

const BOT_NAMES = ["Pebbles McGee","Granite Gary","Rocky Balboa","Boulder Bro","Cobble Quinn","Slate McKenzie","Flint Eastwood","Marbles"];
const BOT_COLORS = ["#7a6652","#5a7a65","#7a5a6a","#6a7a5a","#5a6a7a","#7a7a5a","#6a5a7a"];
const BOT_LINES = [
  "just sitting here being a rock 🪨","anyone else feel like they haven't moved in centuries?",
  "I was here before the dinosaurs tbh","geological time hits different",
  "my therapist says I need to open up more. I am literally a rock.",
  "rolling would be nice but alas","sedimentary, my dear Watson","I peaked during the Jurassic",
  "does anyone else feel heavy or just me","being a rock is a 24/7 commitment",
  "the erosion is getting to me ngl","silently judging everyone","vibing in the mineral kingdom",
];

function makeBot(seed) {
  const i = seed % BOT_NAMES.length;
  return { id: `bot_${seed}`, name: BOT_NAMES[i], color: BOT_COLORS[i % BOT_COLORS.length], shapeIndex: i % 4, accessory: Object.keys(ACCESSORIES)[i % Object.keys(ACCESSORIES).length], isBot: true };
}

// Hard content filter — instant, no API needed
const HARD_BLOCKED = ["nigger","nigga","n1gger","faggot","chink","spic","kike","gook","wetback","coon","kill yourself","kys","lynch","hang yourself","retard"];
const BLOCKED_DOMAINS = ["porn","xxx","sex","nude","onlyfans","adult","nsfw","malware","phishing"];

function hardBlock(text) {
  const lower = text.toLowerCase().replace(/[^a-z0-9 ]/g, " ");
  for (const word of HARD_BLOCKED) {
    if (lower.includes(word)) return { allowed: false, reason: "that language isn't allowed here 🪨" };
  }
  if (/https?:\/\//i.test(text)) return { allowed: false, reason: "links aren't allowed in Rock Talk 🪨" };
  const hasBadDomain = BLOCKED_DOMAINS.some(d => text.toLowerCase().includes(d));
  if (hasBadDomain) return { allowed: false, reason: "links aren't allowed in Rock Talk 🪨" };
  return null;
}

function checkContent(text) {
  const result = hardBlock(text);
  return result || { allowed: true };
}

function getSessionId() {
  let id = sessionStorage.getItem("rock_session");
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now(); sessionStorage.setItem("rock_session", id); }
  return id;
}

const COLORS = ["#8B7355","#6B8E6B","#8E6B7A","#6B7A8E","#8E8E6B","#7A6B8E","#6B8E8E","#8E7A6B"];
const COLOR_NAMES = ["Sandstone","Mossy","Rose Quartz","Slate Blue","Citrine","Amethyst","Aquamarine","Amber"];
const ROOM_CAPACITY = 6;
const SESSION_ID = getSessionId();

export default function RockTalk() {
  const [screen, setScreen] = useState("welcome");
  const [username, setUsername] = useState("");
  const [myRock, setMyRock] = useState({ color: COLORS[0], shapeIndex: 0, accessory: "none" });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [blockedMsg, setBlockedMsg] = useState("");
  const [roomNumber, setRoomNumber] = useState(null);
  const [otherRocks, setOtherRocks] = useState([]); // humans + bots combined
  const [speakingId, setSpeakingId] = useState(null);
  const [tick, setTick] = useState(0);
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const heartbeatRef = useRef(null);
  const botTimerRef = useRef(null);
  const roomNumberRef = useRef(null);
  const usernameRef = useRef(null);
  const myRockRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (!blockedMsg) return; const t = setTimeout(() => setBlockedMsg(""), 3000); return () => clearTimeout(t); }, [blockedMsg]);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);

  // Keep refs in sync so intervals always have fresh values
  useEffect(() => { roomNumberRef.current = roomNumber; }, [roomNumber]);
  useEffect(() => { usernameRef.current = username; }, [username]);
  useEffect(() => { myRockRef.current = myRock; }, [myRock]);

  const refreshRoomRocks = useCallback(async (rn, addOnly = true) => {
    const cutoff = new Date(Date.now() - 120000).toISOString();
    const { data } = await supabase.from("users")
      .select("*")
      .eq("current_room", parseInt(rn))
      .neq("session_id", SESSION_ID)
      .gt("last_seen", cutoff);

    const humans = (data || []).map(u => ({
      id: u.session_id, name: u.user_name,
      color: u.rock_color || COLORS[0],
      shapeIndex: parseInt(u.rock_shape) || 0,
      accessory: u.rock_accessory || "none",
      isBot: false,
    }));

    setOtherRocks(prev => {
      const existingBots = prev.filter(r => r.isBot);
      const existingHumans = prev.filter(r => !r.isBot);

      if (addOnly) {
        // Only ADD new humans, never remove existing ones
        const existingIds = existingHumans.map(r => r.id);
        const newHumans = humans.filter(h => !existingIds.includes(h.id));
        if (newHumans.length === 0) return prev;
        const botCount = Math.max(0, Math.min(3, ROOM_CAPACITY - existingHumans.length - newHumans.length - 1));
        return [...existingHumans, ...newHumans, ...existingBots.slice(0, botCount)];
      } else {
        // Full replace — only used on initial load
        const botCount = Math.max(0, Math.min(3, ROOM_CAPACITY - humans.length - 1));
        const bots = existingBots.length < botCount
          ? [...existingBots, ...Array.from({ length: botCount - existingBots.length }, (_, i) => makeBot((rn * 10 + existingBots.length + i) % (BOT_NAMES.length * 5)))]
          : existingBots.slice(0, botCount);
        return [...humans, ...bots];
      }
    });
  }, []);

  const joinRoom = useCallback(async (rock, name, forceRoom = null) => {
    clearInterval(heartbeatRef.current);
    clearInterval(botTimerRef.current);
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }

    // Get room
    let rn;
    if (forceRoom) {
      rn = forceRoom;
    } else {
      const { data: rnData } = await supabase.rpc("join_or_create_room");
      rn = parseInt(rnData);
    }
    setRoomNumber(rn);
    roomNumberRef.current = rn;

    // Write to DB
    await supabase.from("users").upsert({
      session_id: SESSION_ID,
      user_name: name,
      rock_color: rock.color,
      rock_shape: parseInt(rock.shapeIndex),
      rock_accessory: rock.accessory,
      current_room: rn,
      last_seen: new Date().toISOString(),
    }, { onConflict: "session_id" });

    // Initial load — full replace to set up bots correctly
    await refreshRoomRocks(rn, false);

    setMessages([{ id: "sys", rockId: "system", text: `You rolled into Room #${rn}. Bots are keeping you company...`, system: true }]);

    // Retry refreshes — add-only so existing rocks never get removed
    [1000, 3000, 6000].forEach(delay => {
      setTimeout(() => refreshRoomRocks(rn, true), delay);
    });

    // Broadcast channel for messages only
    const channel = supabase.channel(`room_${rn}`)
      .on("broadcast", { event: "msg" }, ({ payload }) => {
        if (payload.sid === SESSION_ID) return;
        setMessages(prev => [...prev, { id: payload.id, rockId: payload.sid, rockName: payload.name, text: payload.text, timestamp: Date.now() }]);
        setSpeakingId(payload.sid);
        setTimeout(() => setSpeakingId(null), 2500);
        // Add their rock if not already showing
        setOtherRocks(prev => {
          if (prev.find(r => r.id === payload.sid)) return prev;
          const newRock = { id: payload.sid, name: payload.name, color: payload.rock_color || COLORS[0], shapeIndex: parseInt(payload.rock_shape) || 0, accessory: payload.rock_accessory || "none", isBot: false };
          const bots = prev.filter(r => r.isBot);
          return [...prev.filter(r => !r.isBot), newRock, ...bots.slice(0, Math.max(0, bots.length - 1))];
        });
      })
      .on("broadcast", { event: "join" }, ({ payload }) => {
        if (payload.sid === SESSION_ID) return;
        setMessages(prev => {
          if (prev.some(m => m.system && m.text?.includes(payload.name) && m.text?.includes("rolled in"))) return prev;
          return [...prev, { id: Date.now(), rockId: "system", text: `${payload.name} just rolled in 🪨`, system: true }];
        });
        refreshRoomRocks(rn, true); // add-only
        // Reply with "here" event (not "join") so newcomer sees us without triggering join/leave cycle
        [500, 2000].forEach(delay => {
          setTimeout(() => {
            if (channelRef.current) {
              channelRef.current.send({ type: "broadcast", event: "here", payload: { sid: SESSION_ID, name, rock_color: rock.color, rock_shape: rock.shapeIndex, rock_accessory: rock.accessory } });
            }
          }, delay + Math.random() * 300);
        });
      })
      .on("broadcast", { event: "here" }, ({ payload }) => {
        if (payload.sid === SESSION_ID) return;
        // Someone announcing they're already here - just add their rock silently
        setOtherRocks(prev => {
          if (prev.find(r => r.id === payload.sid)) return prev; // already showing
          const newRock = { id: payload.sid, name: payload.name, color: payload.rock_color || COLORS[0], shapeIndex: parseInt(payload.rock_shape) || 0, accessory: payload.rock_accessory || "none", isBot: false };
          const bots = prev.filter(r => r.isBot);
          return [...prev.filter(r => !r.isBot), newRock, ...bots.slice(0, Math.max(0, bots.length - 1))];
        });
      })
      .on("broadcast", { event: "leave" }, ({ payload }) => {
        if (payload.sid === SESSION_ID) return;
        setMessages(prev => {
          // Deduplicate - don't show rolled away twice within 5 seconds
          const recent = prev.filter(m => m.system && m.text?.includes(payload.name) && m.text?.includes("rolled away") && Date.now() - (m.ts || 0) < 5000);
          if (recent.length > 0) return prev;
          return [...prev, { id: Date.now(), rockId: "system", text: `${payload.name} rolled away`, system: true, ts: Date.now() }];
        });
        setOtherRocks(prev => prev.filter(r => r.id !== payload.sid));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Announce immediately
          await channel.send({ type: "broadcast", event: "join", payload: { sid: SESSION_ID, name } });
          // Also refresh rocks from DB right away to catch anyone already here
          await refreshRoomRocks(rn);
          // Re-announce with "here" after delay to catch late subscribers
          setTimeout(async () => {
            if (channelRef.current) {
              await channelRef.current.send({ type: "broadcast", event: "here", payload: { sid: SESSION_ID, name, rock_color: rock.color, rock_shape: rock.shapeIndex, rock_accessory: rock.accessory } });
            }
          }, 2000);
        }
      });
    channelRef.current = channel;

    // Heartbeat — update DB every 15s + refresh rocks
    heartbeatRef.current = setInterval(async () => {
      const currentRoom = roomNumberRef.current;
      if (!currentRoom) return;
      // Update own heartbeat
      await supabase.from("users").update({
        last_seen: new Date().toISOString(),
        current_room: parseInt(currentRoom),
      }).eq("session_id", SESSION_ID);
      // Only ADD rocks from DB refresh, never remove (removal via leave broadcast only)
      const cutoff = new Date(Date.now() - 120000).toISOString();
      const { data } = await supabase.from("users")
        .select("*")
        .eq("current_room", parseInt(currentRoom))
        .neq("session_id", SESSION_ID)
        .gt("last_seen", cutoff);
      if (data && data.length > 0) {
        const humans = data.map(u => ({
          id: u.session_id, name: u.user_name,
          color: u.rock_color || COLORS[0],
          shapeIndex: parseInt(u.rock_shape) || 0,
          accessory: u.rock_accessory || "none",
          isBot: false,
        }));
        setOtherRocks(prev => {
          const existingIds = prev.filter(r => !r.isBot).map(r => r.id);
          const newRocks = humans.filter(h => !existingIds.includes(h.id));
          if (newRocks.length === 0) return prev; // nothing to add
          const bots = prev.filter(r => r.isBot);
          const botCount = Math.max(0, Math.min(3, ROOM_CAPACITY - (existingIds.length + newRocks.length) - 1));
          return [...prev.filter(r => !r.isBot), ...newRocks, ...bots.slice(0, botCount)];
        });
      }
    }, 15000);

    // Bot chat timer — only when no humans present
    botTimerRef.current = setInterval(() => {
      setOtherRocks(prev => {
        const humans = prev.filter(r => !r.isBot);
        if (humans.length > 0) return prev;
        const bots = prev.filter(r => r.isBot);
        if (!bots.length || Math.random() > 0.25) return prev;
        const bot = bots[Math.floor(Math.random() * bots.length)];
        const line = BOT_LINES[Math.floor(Math.random() * BOT_LINES.length)];
        setSpeakingId(bot.id);
        setTimeout(() => setSpeakingId(null), 2500);
        setMessages(m => [...m, { id: Date.now(), rockId: bot.id, rockName: bot.name, text: line, timestamp: Date.now() }]);
        return prev;
      });
    }, 9000);
  }, [refreshRoomRocks]);

  const leaveRoom = async () => {
    const currentRoom = roomNumberRef.current;
    clearInterval(heartbeatRef.current);
    clearInterval(botTimerRef.current);
    const ch = channelRef.current;
    channelRef.current = null; // clear ref first to prevent double sends
    if (ch) {
      await ch.send({ type: "broadcast", event: "leave", payload: { sid: SESSION_ID, name: usernameRef.current } });
      supabase.removeChannel(ch);
    }
    if (currentRoom) {
      await supabase.from("users").update({ current_room: null }).eq("session_id", SESSION_ID);
      const { data: room } = await supabase.from("rooms").select("*").eq("room_number", currentRoom).single();
      if (room) await supabase.from("rooms").update({ human_count: Math.max(0, room.human_count - 1) }).eq("id", room.id);
    }
    // Roll to a different room
    let newRoom = currentRoom;
    let attempts = 0;
    while (newRoom === currentRoom && attempts < 5) {
      const { data } = await supabase.rpc("join_or_create_room");
      newRoom = parseInt(data);
      attempts++;
      if (newRoom === currentRoom) {
        const { data: room } = await supabase.from("rooms").select("*").eq("room_number", newRoom).single();
        if (room) await supabase.from("rooms").update({ human_count: Math.max(0, room.human_count - 1) }).eq("id", room.id);
      }
    }
    if (newRoom === currentRoom) {
      const freshNum = Math.floor(Math.random() * 9999) + 1;
      await supabase.from("rooms").insert({ room_number: freshNum, human_count: 1 });
      newRoom = freshNum;
    }
    await joinRoom(myRockRef.current, usernameRef.current, newRoom);
  };

  useEffect(() => {
    if (screen !== "room") return;
    // Use visibilitychange instead of beforeunload - more reliable on mobile
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        // Tab hidden - update last_seen so heartbeat pauses gracefully
        // Don't remove from room - they may come back
        navigator.sendBeacon && navigator.sendBeacon("/api/ping"); // no-op, just keeps connection
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [screen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const check = hardBlock(text);
    if (check && !check.allowed) { setBlockedMsg(`🚫 ${check.reason}`); setInput(""); return; }
    setInput("");
    const msgId = Date.now();
    setMessages(m => [...m, { id: msgId, rockId: "me", rockName: username, text, timestamp: Date.now() }]);
    setSpeakingId("me");
    setTimeout(() => setSpeakingId(null), 2000);
    if (channelRef.current) {
      await channelRef.current.send({ type: "broadcast", event: "msg", payload: { id: msgId, sid: SESSION_ID, name: username, text, rock_color: myRock.color, rock_shape: myRock.shapeIndex, rock_accessory: myRock.accessory } });
    }
  };

  if (screen === "welcome") return <WelcomeScreen onNext={(name) => { setUsername(name); setScreen("customize"); }} />;
  if (screen === "customize") return (
    <CustomizeScreen username={username} rock={myRock} setRock={setMyRock} onEnter={async () => {
      setScreen("room");
      await joinRoom(myRock, username);
    }} />
  );

  const myRockFull = { ...myRock, id: "me", name: username };
  const allRocks = [myRockFull, ...otherRocks];

  return (
    <div style={styles.app}>
      <style>{globalStyles}</style>
      <div style={styles.header}>
        <span style={styles.logo}>🪨 rock talk</span>
        <div style={styles.roomBadge}>Room #{roomNumber} · {allRocks.length}/{ROOM_CAPACITY}</div>
        <button style={styles.leaveBtn} onClick={leaveRoom}>roll away →</button>
      </div>
      <div style={styles.scene}>
        <div style={styles.ground} />
        {allRocks.map((rock, i) => {
          const angle = (i / allRocks.length) * Math.PI * 2 - Math.PI / 2;
          const x = 50 + 36 * Math.cos(angle);
          const y = 50 + 32 * Math.sin(angle);
          const lastMsg = [...messages].reverse().find(m => m.rockId === rock.id && !m.system);
          const showBubble = lastMsg && (Date.now() - (lastMsg.timestamp || 0)) < 5000;
          const bubbleBelow = y < 42;
          const onRight = x > 65;
          const onLeft = x < 35;
          return (
            <div key={rock.id} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", zIndex: speakingId === rock.id ? 10 : 5 }}>
              {showBubble && (
                <div style={{ ...styles.bubble, ...(rock.id === "me" ? styles.myBubble : {}), ...(bubbleBelow ? { bottom: "auto", top: "calc(100% + 4px)" } : {}), ...(onRight ? { left: "auto", right: 0, transform: "none" } : {}), ...(onLeft ? { left: 0, transform: "none" } : {}) }}>
                  {lastMsg.text}
                </div>
              )}
              <div style={{ textAlign: "center" }}>
                <RockSVG rock={rock} size={rock.id === "me" ? 72 : 58} speaking={speakingId === rock.id} />
                <div style={styles.rockLabel}>{rock.name}</div>
                <div style={{ ...styles.tag, color: rock.id === "me" ? "#8B7355" : rock.isBot ? "#4a4040" : "#4a8a5a" }}>
                  {rock.id === "me" ? "● you" : rock.isBot ? "🤖 bot" : "🟢 real"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={styles.chatLog}>
        {messages.map(m => (
          <div key={m.id} style={{ ...styles.chatLine, ...(m.system ? styles.systemLine : {}), ...(m.rockId === "me" ? styles.myLine : {}) }}>
            {!m.system && <span style={styles.chatName}>{m.rockId === "me" ? "you" : m.rockName}: </span>}
            {m.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {blockedMsg && <div style={styles.blockedBanner}>{blockedMsg}</div>}
      <div style={styles.inputRow}>
        <input style={styles.input} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="say something, rock..." maxLength={200} />
        <button style={{ ...styles.sendBtn }} onClick={sendMessage}>🪨</button>
      </div>
    </div>
  );
}

function WelcomeScreen({ onNext }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    const trimmed = val.trim();
    if (trimmed.length < 2) { setErr("needs at least 2 characters"); return; }
    if (trimmed.length > 20) { setErr("max 20 characters"); return; }
    const check = hardBlock(trimmed);
    if (check && !check.allowed) { setErr(`🚫 ${check.reason}`); return; }
    const check = hardBlock(trimmed);
    if (!check.allowed) { setErr(`🚫 ${check.reason}`); return; }
    onNext(trimmed);
  };
  return (
    <div style={styles.app}>
      <style>{globalStyles}</style>
      <div style={styles.centered}>
        <div style={{ fontSize: 80, marginBottom: 8, animation: "float 3s ease-in-out infinite" }}>🪨</div>
        <h1 style={styles.bigTitle}>rock talk</h1>
        <p style={styles.subtitle}>a social app for rocks who can't move but have a lot to say</p>
        <div style={styles.card}>
          <label style={styles.label}>pick your rock name</label>
          <input style={styles.input} value={val} onChange={e => { setVal(e.target.value); setErr(""); }} onKeyDown={e => e.key === "Enter" && submit()} placeholder="e.g. Gneiss Person" maxLength={20} autoFocus />
          <div style={{ fontSize: 10, color: val.length >= 18 ? "#c0756a" : "#5a5050", textAlign: "right", marginTop: 4 }}>{val.length}/20</div>
          {err && <div style={styles.err}>{err}</div>}
          <button style={styles.primaryBtn} onClick={submit}>become a rock →</button>
          <div style={{ fontSize: 10, color: "#5a5050", marginTop: 10, textAlign: "center" }}>names are checked for appropriateness</div>
        </div>
      </div>
    </div>
  );
}

function CustomizeScreen({ username, rock, setRock, onEnter }) {
  const [entering, setEntering] = useState(false);
  const previewRock = { ...rock, id: "preview", name: username };
  return (
    <div style={styles.app}>
      <style>{globalStyles}</style>
      <div style={styles.centered}>
        <h2 style={styles.bigTitle}>customize your rock</h2>
        <p style={styles.subtitle}>hello, {username}</p>
        <div style={{ margin: "20px 0", animation: "float 3s ease-in-out infinite" }}><RockSVG rock={previewRock} size={120} /></div>
        <div style={styles.card}>
          <label style={styles.label}>rock color</label>
          <div style={styles.colorRow}>
            {COLORS.map((c, i) => (
              <button key={c} title={COLOR_NAMES[i]} onClick={() => setRock(r => ({ ...r, color: c }))}
                style={{ ...styles.colorSwatch, background: c, border: rock.color === c ? "3px solid #fff" : "3px solid transparent", boxShadow: rock.color === c ? "0 0 0 2px #fff" : "none" }} />
            ))}
          </div>
          <label style={styles.label}>rock shape</label>
          <div style={styles.colorRow}>
            {ROCK_SHAPES.map((_, i) => (
              <button key={i} onClick={() => setRock(r => ({ ...r, shapeIndex: i }))}
                style={{ ...styles.shapeBtn, border: rock.shapeIndex === i ? "2px solid #fff" : "2px solid rgba(255,255,255,0.2)" }}>
                <svg viewBox="0 0 100 100" width={36} height={36}><path d={ROCK_SHAPES[i]} fill={rock.color} /></svg>
              </button>
            ))}
          </div>
          <label style={styles.label}>accessory <span style={{ opacity: 0.5, fontSize: 11 }}>(cosmetic shop coming soon 💰)</span></label>
          <div style={styles.colorRow}>
            {Object.entries(ACCESSORIES).map(([key, val]) => (
              <button key={key} onClick={() => setRock(r => ({ ...r, accessory: key }))}
                style={{ ...styles.accBtn, border: rock.accessory === key ? "2px solid #fff" : "2px solid rgba(255,255,255,0.2)" }}>
                {val ? val.emoji : "∅"}
              </button>
            ))}
          </div>
          <button style={{ ...styles.primaryBtn, marginTop: 20, opacity: entering ? 0.7 : 1 }} onClick={async () => { setEntering(true); await onEnter(); }} disabled={entering}>
            {entering ? "finding your room... 🪨" : "enter the rock room →"}
          </button>
        </div>
      </div>
    </div>
  );
}

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=DM+Mono:wght@300;400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1a1410; }
  @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)} }
  @keyframes pulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.06)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#1a1410}::-webkit-scrollbar-thumb{background:#4a3f35;border-radius:2px}
`;

const styles = {
  app: { height:"100dvh", background:"linear-gradient(160deg,#1a1410 0%,#1e1a14 50%,#141a18 100%)", fontFamily:"'DM Mono',monospace", color:"#e8ddd0", display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto", overflow:"hidden" },
  centered: { flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 20px", overflowY:"auto" },
  bigTitle: { fontFamily:"'Fraunces',serif", fontSize:42, fontWeight:900, color:"#e8ddd0", letterSpacing:-1, textAlign:"center" },
  subtitle: { color:"#9a8f85", fontSize:13, textAlign:"center", marginTop:8, marginBottom:20, maxWidth:280, lineHeight:1.5 },
  card: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:20, width:"100%", maxWidth:360 },
  label: { display:"block", fontSize:11, color:"#9a8f85", textTransform:"uppercase", letterSpacing:1.5, marginBottom:8, marginTop:16 },
  input: { width:"100%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"12px 14px", color:"#e8ddd0", fontFamily:"'DM Mono',monospace", fontSize:14, outline:"none" },
  err: { color:"#c0756a", fontSize:12, marginTop:6, lineHeight:1.4 },
  primaryBtn: { width:"100%", marginTop:16, background:"#8B7355", border:"none", borderRadius:10, padding:"13px", color:"#fff", fontFamily:"'DM Mono',monospace", fontSize:14, cursor:"pointer", letterSpacing:0.5 },
  colorRow: { display:"flex", flexWrap:"wrap", gap:8, marginBottom:4 },
  colorSwatch: { width:32, height:32, borderRadius:"50%", cursor:"pointer", transition:"transform 0.15s", flexShrink:0 },
  shapeBtn: { background:"rgba(255,255,255,0.05)", borderRadius:8, padding:4, cursor:"pointer", lineHeight:0 },
  accBtn: { background:"rgba(255,255,255,0.05)", borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:20, color:"#e8ddd0" },
  header: { display:"flex", alignItems:"center", padding:"12px 16px", borderBottom:"1px solid rgba(255,255,255,0.06)", gap:10, flexShrink:0 },
  logo: { fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, flex:1 },
  roomBadge: { background:"rgba(255,255,255,0.07)", borderRadius:20, padding:"4px 10px", fontSize:11, color:"#9a8f85" },
  leaveBtn: { background:"none", border:"1px solid rgba(255,255,255,0.15)", borderRadius:20, padding:"4px 12px", color:"#9a8f85", fontSize:11, cursor:"pointer", fontFamily:"'DM Mono',monospace" },
  scene: { position:"relative", height:300, flexShrink:0, overflow:"visible", padding:"0 60px" },
  ground: { position:"absolute", bottom:0, left:"-10%", right:"-10%", height:60, background:"linear-gradient(to top,#2a2018,transparent)", borderRadius:"50% 50% 0 0/30px 30px 0 0" },
  bubble: { position:"absolute", bottom:"calc(100% + 4px)", left:"50%", transform:"translateX(-50%)", background:"rgba(40,34,28,0.95)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"6px 10px", fontSize:11, color:"#e8ddd0", whiteSpace:"normal", wordBreak:"break-word", width:"max-content", maxWidth:150, textAlign:"center", animation:"fadeIn 0.2s ease", zIndex:20, boxShadow:"0 4px 12px rgba(0,0,0,0.4)" },
  myBubble: { background:"rgba(139,115,85,0.3)", border:"1px solid rgba(139,115,85,0.4)" },
  rockLabel: { fontSize:9, color:"#6a5f55", marginTop:2, textAlign:"center", maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  tag: { fontSize:8, marginTop:1, textAlign:"center" },
  chatLog: { flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:6, minHeight:0 },
  chatLine: { fontSize:12, color:"#c0b8b0", lineHeight:1.5, animation:"fadeIn 0.2s ease" },
  systemLine: { color:"#5a5050", fontStyle:"italic", textAlign:"center", fontSize:11 },
  myLine: { color:"#e8ddd0" },
  chatName: { color:"#8B7355", fontWeight:"bold" },
  blockedBanner: { margin:"0 16px 8px", background:"rgba(192,100,90,0.15)", border:"1px solid rgba(192,100,90,0.3)", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#c0756a", animation:"slideUp 0.2s ease" },
  inputRow: { display:"flex", gap:8, padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.06)", flexShrink:0 },
  sendBtn: { background:"#8B7355", border:"none", borderRadius:10, width:44, height:44, fontSize:20, cursor:"pointer", flexShrink:0 },
};
