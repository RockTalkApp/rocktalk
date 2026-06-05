import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://kqhdlhgghbeqsohbhboa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxaGRsaGdnaGJlcXNvaGJoYm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1Mzk5NzAsImV4cCI6MjA5NjExNTk3MH0._Zb8kMbw78F4aGWJ6wC7-Kqd9TG_L4LBD9DEmPRCiys";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Rock SVG renderer ───────────────────────────────────────────────────────
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

function RockSVG({ rock, size = 100, speaking = false, wiggle = false }) {
  const shape = ROCK_SHAPES[rock.shapeIndex || 0];
  const acc = ACCESSORIES[rock.accessory || "none"];
  return (
    <div style={{ position: "relative", width: size, height: size, display: "inline-block" }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{
        filter: speaking ? `drop-shadow(0 0 8px ${rock.color}cc)` : "drop-shadow(2px 4px 6px rgba(0,0,0,0.4))",
        animation: wiggle ? "wiggle 0.4s ease-in-out" : speaking ? "pulse 1s ease-in-out infinite" : "none",
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

// ─── Bots ────────────────────────────────────────────────────────────────────
const BOT_NAMES = ["Pebbles McGee","Granite Gary","Rocky Balboa","Boulder Bro","Cobble Quinn","Slate McKenzie","Flint Eastwood","Marbles"];
const BOT_COLORS = ["#7a6652","#5a7a65","#7a5a6a","#6a7a5a","#5a6a7a","#7a7a5a","#6a5a7a"];
const BOT_LINES = [
  "just sitting here being a rock 🪨","anyone else feel like they haven't moved in centuries?",
  "I was here before the dinosaurs tbh","geological time hits different",
  "my therapist says I need to open up more. I am literally a rock.",
  "rolling would be nice but alas","I heard someone kicked a rock earlier. rude.",
  "sedimentary, my dear Watson","I peaked during the Jurassic",
  "does anyone else feel heavy or just me","I have so much to say and nowhere to roll",
  "being a rock is a 24/7 commitment","the erosion is getting to me ngl",
  "silently judging everyone","vibing in the mineral kingdom",
];

function makeBot(id) {
  return {
    id: `bot_${id}`, name: BOT_NAMES[id % BOT_NAMES.length],
    color: BOT_COLORS[id % BOT_COLORS.length], shapeIndex: id % 4,
    accessory: Object.keys(ACCESSORIES)[id % Object.keys(ACCESSORIES).length],
    isBot: true,
  };
}

// ─── Moderation ───────────────────────────────────────────────────────────────

// Hard blocklist — these are caught instantly, no AI call needed
const HARD_BLOCKED = [
  "nigger","nigga","nigg","n1gger","n1gga",
  "faggot","fag","tranny","chink","spic","kike","gook","wetback","coon",
  "kill yourself","kys","kill ur self","end yourself","go kill",
  "lynch","hang yourself","rape","rapist",
  "retard","retarded",
];

// Known bad domain patterns
const BLOCKED_DOMAINS = [
  "porn","xxx","sex","nude","naked","onlyfans","adult","nsfw",
  "malware","phishing","virus","hack","crack","warez","torrent",
  "onion","darkweb","grabify","iplogger","ipgrabber","stresser","booter",
];

function hardBlock(text) {
  // Check slurs and harmful phrases
  const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  for (const word of HARD_BLOCKED) {
    if (lower.includes(word)) {
      return { allowed: false, reason: "that language isn't allowed here — keep it rock-friendly 🪨" };
    }
  }

  // Block any text that looks like a URL or domain
  // Catches: http://x.com, www.x.com, x.com, x.com/path, options-alerts.com/
  const domainPattern = /(|\s|^)(https?:\/\/|www\.)?[\w-]+(\.[\w-]+)+(\/[\w\-./?%&=]*)?/gi;
  const tlds = ["com","net","org","io","co","app","xyz","ru","tk","ml","ga","cf","gq","top","club","site","online","fun","live","gg","tv","me","info","biz","us","uk","ca","au"];
  const matches = text.match(domainPattern) || [];
  for (const match of matches) {
    const m = match.trim().toLowerCase();
    if (tlds.some(tld => m.includes("." + tld))) {
      return { allowed: false, reason: "links aren't allowed in Rock Talk — just rocks and words 🪨" };
    }
  }

  return null;
}

async function checkContent(text, type = "message") {
  // Hard blocklist first — instant, no API call
  const hardResult = hardBlock(text);
  if (hardResult) return hardResult;

  // Then AI moderation for subtler cases
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 1000,
        system: `You are a ${type} moderator for Rock Talk, a fun family-friendly app.
Reject content with: racial slurs, hate speech, harassment, threats like "kill yourself", sexual content directed at people, or anything that targets someone's identity.
Allow: rock puns, creative names, mild swearing, normal conversation, edgy humor that isn't targeting anyone.
Respond ONLY with valid JSON: {"allowed":true} or {"allowed":false,"reason":"brief friendly reason"}`,
        messages: [{ role: "user", content: `Check this ${type}: "${text}"` }],
      }),
    });
    const data = await res.json();
    return JSON.parse((data.content?.[0]?.text || '{"allowed":true}').replace(/```json|```/g,"").trim());
  } catch { return { allowed: true }; }
}

// ─── Session ID ───────────────────────────────────────────────────────────────
function getSessionId() {
  let id = sessionStorage.getItem("rock_session");
  if (!id) { id = Math.random().toString(36).slice(2) + Date.now(); sessionStorage.setItem("rock_session", id); }
  return id;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const COLORS = ["#8B7355","#6B8E6B","#8E6B7A","#6B7A8E","#8E8E6B","#7A6B8E","#6B8E8E","#8E7A6B"];
const COLOR_NAMES = ["Sandstone","Mossy","Rose Quartz","Slate Blue","Citrine","Amethyst","Aquamarine","Amber"];
const ROOM_CAPACITY = 6;
const SESSION_ID = getSessionId();

// ─── Main App ────────────────────────────────────────────────────────────────
export default function RockTalk() {
  const [screen, setScreen] = useState("welcome");
  const [username, setUsername] = useState("");
  const [myRock, setMyRock] = useState({ color: COLORS[0], shapeIndex: 0, accessory: "none" });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [blockedMsg, setBlockedMsg] = useState("");
  const [roomNumber, setRoomNumber] = useState(null);
  const [humanRocksInRoom, setHumanRocksInRoom] = useState([]);
  const [botRocksInRoom, setBotRocksInRoom] = useState([]);
  const [speakingId, setSpeakingId] = useState(null);
  const [wiggleId, setWiggleId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [tick, setTick] = useState(0);
  const messagesEndRef = useRef(null);
  const botTimerRef = useRef(null);
  const channelRef = useRef(null);
  const heartbeatRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { const t = setInterval(() => setTick(n => n + 1), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!blockedMsg) return; const t = setTimeout(() => setBlockedMsg(""), 3000); return () => clearTimeout(t); }, [blockedMsg]);

  // ── Join a room ──────────────────────────────────────────────────────────
  const joinRoom = useCallback(async (rock, name, forcedRoom = null) => {
    clearInterval(botTimerRef.current);
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }

    let rn;
    if (forcedRoom) {
      rn = forcedRoom;
      setRoomNumber(rn);
    } else {
      // Use atomic database function to avoid race conditions
      const { data: rnData, error: rnError } = await supabase.rpc("join_or_create_room");
      if (rnError) { console.error("Room join error:", rnError); return; }
      rn = rnData;
      setRoomNumber(rn);
    }

    // Write self to users table
    await supabase.from("users").upsert({
      session_id: SESSION_ID, user_name: name,
      rock_color: rock.color, rock_shape: rock.shapeIndex,
      rock_accessory: rock.accessory, current_room: rn,
    }, { onConflict: "session_id" });

    // Load existing users in room
    const { data: existingUsers } = await supabase.from("users").select("*").eq("current_room", rn).neq("session_id", SESSION_ID);
    const humanRocks = (existingUsers || []).map(u => ({
      id: u.session_id, name: u.user_name, color: u.rock_color,
      shapeIndex: u.rock_shape, accessory: u.rock_accessory, isBot: false,
    }));

    // Fill remaining slots with bots
    const humanCount = humanRocks.length + 1;
    const botCount = Math.max(0, Math.min(3, ROOM_CAPACITY - humanCount - 1));
    const bots = Array.from({ length: botCount }, (_, i) => makeBot((rn * 10 + i) % BOT_NAMES.length));
    setHumanRocksInRoom(humanRocks);
    setBotRocksInRoom(bots);

    // Fresh start — no chat history shown on join
    setMessages([
      { id: "sys_join", rockId: "system", text: `You rolled into Room #${rn}. ${humanCount > 1 ? `${humanCount - 1} other rock${humanCount > 2 ? "s are" : " is"} here!` : "Bots are keeping you company..."}`, system: true },
    ]);

    // Use broadcast for messages only — DB polling for rock presence (most reliable)
    const channel = supabase.channel(`room_${rn}`)
      .on("broadcast", { event: "message" }, ({ payload }) => {
        if (payload.session_id === SESSION_ID) return;
        setMessages(prev => [...prev, { id: payload.id, rockId: payload.session_id, rockName: payload.user_name, text: payload.text, isBot: false, timestamp: Date.now() }]);
        setSpeakingId(payload.session_id);
        setTimeout(() => setSpeakingId(null), 2500);
        // Also add their rock if not visible — messages are proof they exist
        setHumanRocksInRoom(prev => {
          if (prev.find(r => r.id === payload.session_id)) return prev;
          const newRock = { id: payload.session_id, name: payload.user_name, color: payload.rock_color || COLORS[0], shapeIndex: payload.rock_shape || 0, accessory: payload.rock_accessory || "none", isBot: false };
          setBotRocksInRoom(b => b.slice(0, Math.max(0, b.length - 1)));
          return [...prev, newRock];
        });
      })
      .on("broadcast", { event: "joined" }, ({ payload }) => {
        if (payload.session_id === SESSION_ID) return;
        setMessages(prev => {
          const already = prev.some(m => m.system && m.text?.includes(payload.user_name) && m.text?.includes("rolled in"));
          if (already) return prev;
          return [...prev, { id: Date.now(), rockId: "system", text: `${payload.user_name} just rolled in 🪨`, system: true }];
        });
        setHumanRocksInRoom(prev => {
          if (prev.find(r => r.id === payload.session_id)) return prev;
          const newRock = { id: payload.session_id, name: payload.user_name, color: payload.rock_color || COLORS[0], shapeIndex: payload.rock_shape || 0, accessory: payload.rock_accessory || "none", isBot: false };
          setBotRocksInRoom(b => b.slice(0, Math.max(0, b.length - 1)));
          return [...prev, newRock];
        });
      })
      .on("broadcast", { event: "left" }, ({ payload }) => {
        if (payload.session_id === SESSION_ID) return;
        setMessages(prev => [...prev, { id: Date.now(), rockId: "system", text: `${payload.user_name} rolled away`, system: true }]);
        setHumanRocksInRoom(prev => prev.filter(r => r.id !== payload.session_id));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          // Announce arrival to everyone
          await channel.send({ type: "broadcast", event: "joined", payload: { session_id: SESSION_ID, user_name: name, rock_color: rock.color, rock_shape: rock.shapeIndex, rock_accessory: rock.accessory } });
        }
      });
    channelRef.current = channel;

    // Heartbeat every 15s — update last_seen AND refresh rock list from DB
    clearInterval(heartbeatRef.current);
    const refreshRocks = async () => {
      await supabase.from("users").update({ last_seen: new Date().toISOString() }).eq("session_id", SESSION_ID);
      const { data: freshUsers } = await supabase.from("users")
        .select("*")
        .eq("current_room", rn)
        .neq("session_id", SESSION_ID)
        .gt("last_seen", new Date(Date.now() - 45000).toISOString()); // active in last 45s
      const humans = (freshUsers || []).map(u => ({ id: u.session_id, name: u.user_name, color: u.rock_color, shapeIndex: u.rock_shape, accessory: u.rock_accessory, isBot: false }));
      setHumanRocksInRoom(prev => {
        const prevIds = prev.map(r => r.id).sort().join(",");
        const newIds = humans.map(r => r.id).sort().join(",");
        if (prevIds === newIds) return prev;
        // Show join/leave messages for changes
        const added = humans.filter(h => !prev.find(p => p.id === h.id));
        const removed = prev.filter(p => !humans.find(h => h.id === p.id));
        added.forEach(h => setMessages(m => {
          const already = m.some(x => x.system && x.text?.includes(h.name) && x.text?.includes("rolled in"));
          if (already) return m;
          return [...m, { id: Date.now(), rockId: "system", text: `${h.name} just rolled in 🪨`, system: true }];
        }));
        removed.forEach(h => setMessages(m => [...m, { id: Date.now(), rockId: "system", text: `${h.name} rolled away`, system: true }]));
        setBotRocksInRoom(prev => prev.slice(0, Math.max(0, Math.min(3, ROOM_CAPACITY - humans.length - 1))));
        return humans;
      });
    };
    refreshRocks(); // run immediately on join
    heartbeatRef.current = setInterval(refreshRocks, 15000);

    // Cleanup stale users every 60 seconds
    const runCleanup = async () => {
      await supabase.rpc("cleanup_stale_users");
      // Refresh room rocks after cleanup
      const { data: freshUsers } = await supabase.from("users").select("*").eq("current_room", rn).neq("session_id", SESSION_ID);
      if (freshUsers) {
        const humans = freshUsers.map(u => ({ id: u.session_id, name: u.user_name, color: u.rock_color, shapeIndex: u.rock_shape, accessory: u.rock_accessory, isBot: false }));
        setHumanRocksInRoom(humans);
        setBotRocksInRoom(prev => prev.slice(0, Math.max(0, Math.min(3, ROOM_CAPACITY - humans.length - 1))));
      }
    };
    setTimeout(runCleanup, 60000);

    // Bot chat timer — only fires if no other humans in room
    botTimerRef.current = setInterval(() => {
      setHumanRocksInRoom(humans => {
        if (humans.length > 0) return humans; // real humans present — bots stay quiet
        setBotRocksInRoom(bots => {
          if (!bots.length) return bots;
          if (Math.random() > 0.2) return bots; // only 20% chance
          const bot = bots[Math.floor(Math.random() * bots.length)];
          const line = BOT_LINES[Math.floor(Math.random() * BOT_LINES.length)];
          setSpeakingId(bot.id);
          setTimeout(() => setSpeakingId(null), 2500);
          setMessages(m => [...m, { id: Date.now(), rockId: bot.id, rockName: bot.name, text: line, timestamp: Date.now() }]);
          return bots;
        });
        return humans;
      });
    }, 8000);

    return rn;
  }, []);

  const leaveRoom = async () => {
    clearInterval(botTimerRef.current);
    clearInterval(heartbeatRef.current);
    const currentRoom = roomNumber;

    if (channelRef.current) {
      await channelRef.current.send({ type: "broadcast", event: "left", payload: { session_id: SESSION_ID, user_name: username } });
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Decrement old room count
    if (currentRoom) {
      const { data: room } = await supabase.from("rooms").select("*").eq("room_number", currentRoom).single();
      if (room) await supabase.from("rooms").update({ human_count: Math.max(0, room.human_count - 1) }).eq("id", room.id);
    }

    await supabase.from("users").update({ current_room: null }).eq("session_id", SESSION_ID);

    // Keep rolling until we land in a different room
    let newRoomNumber = currentRoom;
    let attempts = 0;
    while (newRoomNumber === currentRoom && attempts < 5) {
      const { data: rnData } = await supabase.rpc("join_or_create_room");
      newRoomNumber = rnData;
      attempts++;
      // If same room, decrement and try again
      if (newRoomNumber === currentRoom) {
        const { data: room } = await supabase.from("rooms").select("*").eq("room_number", newRoomNumber).single();
        if (room) await supabase.from("rooms").update({ human_count: Math.max(0, room.human_count - 1) }).eq("id", room.id);
      }
    }

    // If still same room after retries, force create a new one
    if (newRoomNumber === currentRoom) {
      const freshNum = Math.floor(Math.random() * 9999) + 1;
      await supabase.from("rooms").insert({ room_number: freshNum, human_count: 1 });
      newRoomNumber = freshNum;
    }

    const myRockData = { color: myRock.color, shapeIndex: myRock.shapeIndex, accessory: myRock.accessory };
    await joinRoom(myRockData, username, newRoomNumber);
  };

  // Cleanup on tab close
  useEffect(() => {
    const cleanup = async () => {
      clearInterval(heartbeatRef.current);
      await supabase.from("users").update({ current_room: null, last_seen: new Date().toISOString() }).eq("session_id", SESSION_ID);
      if (roomNumber) {
        const { data: room } = await supabase.from("rooms").select("*").eq("room_number", roomNumber).single();
        if (room) await supabase.from("rooms").update({ human_count: Math.max(0, room.human_count - 1) }).eq("id", room.id);
      }
    };
    window.addEventListener("beforeunload", cleanup);
    return () => { window.removeEventListener("beforeunload", cleanup); cleanup(); };
  }, [roomNumber]);

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;
    const text = input.trim();
    setInput("");
    setIsSending(true);
    setBlockedMsg("");

    const check = await checkContent(text, "message");
    setIsSending(false);
    if (!check.allowed) { setBlockedMsg(`🚫 ${check.reason || "that message isn't allowed"}`); return; }

    // Show immediately locally
    setMessages(m => [...m, { id: Date.now(), rockId: "me", rockName: username, text, timestamp: Date.now() }]);
    setSpeakingId("me");
    setTimeout(() => setSpeakingId(null), 2000);

    // Broadcast to others in real time
    if (channelRef.current) {
      await channelRef.current.send({
        type: "broadcast", event: "message",
        payload: { id: Date.now(), session_id: SESSION_ID, user_name: username, text, rock_color: myRock.color, rock_shape: myRock.shapeIndex, rock_accessory: myRock.accessory },
      });
    }
    // Also save to DB for history
    await supabase.from("messages").insert({
      room_number: roomNumber, session_id: SESSION_ID,
      user_name: username, text,
      rock_color: myRock.color, rock_shape: myRock.shapeIndex,
      rock_accessory: myRock.accessory, is_bot: false,
    });

    // Bot AI response — only if no other humans in room, 20% chance
    if (humanRocksInRoom.length === 0 && Math.random() < 0.2) {
      const bots = botRocksInRoom;
      if (bots.length > 0) {
        setIsLoading(true);
        const bot = bots[Math.floor(Math.random() * bots.length)];
        try {
          const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-20250514", max_tokens: 1000,
              system: `You are ${bot.name}, a rock in Rock Talk. Dry wit, geological humor, under 20 words.`,
              messages: [{ role: "user", content: text }],
            }),
          });
          const data = await res.json();
          const reply = data.content?.[0]?.text;
          if (reply) {
            setTimeout(() => {
              setSpeakingId(bot.id); setWiggleId(bot.id);
              setTimeout(() => { setSpeakingId(null); setWiggleId(null); }, 2500);
              setMessages(m => [...m, { id: Date.now(), rockId: bot.id, rockName: bot.name, text: reply, timestamp: Date.now() }]);
            }, 1200);
          }
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
      }
    }
  };

  if (screen === "welcome") return <WelcomeScreen onNext={(name) => { setUsername(name); setScreen("customize"); }} />;
  if (screen === "customize") return (
    <CustomizeScreen username={username} rock={myRock} setRock={setMyRock}
      onEnter={async () => {
        setScreen("room");
        await joinRoom(myRock, username);
      }} />
  );

  const myRockFull = { ...myRock, id: "me", name: username };
  const roomRocks = [...humanRocksInRoom, ...botRocksInRoom];
  const allRocks = [myRockFull, ...roomRocks];

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
          const msgAge = lastMsg ? Date.now() - (lastMsg.timestamp || 0) : Infinity;
          const showBubble = lastMsg && msgAge < 5000;
          const bubbleBelow = y < 42;
          const onRight = x > 65;
          const onLeft = x < 35;
          return (
            <div key={rock.id} style={{ position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", zIndex: speakingId === rock.id ? 10 : 5 }}>
              {showBubble && (
                <div style={{
                  ...styles.bubble, ...(rock.id === "me" ? styles.myBubble : {}),
                  ...(bubbleBelow ? { bottom: "auto", top: "calc(100% + 4px)" } : {}),
                  ...(onRight ? { left: "auto", right: 0, transform: "none" } : {}),
                  ...(onLeft ? { left: 0, transform: "none" } : {}),
                }}>
                  {lastMsg.text}
                </div>
              )}
              <div style={{ textAlign: "center" }}>
                <RockSVG rock={rock} size={rock.id === "me" ? 72 : 58} speaking={speakingId === rock.id} wiggle={wiggleId === rock.id} />
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
        <input style={styles.input} value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={isSending ? "checking message..." : "say something, rock..."}
          maxLength={200} disabled={isSending}
        />
        <button style={{ ...styles.sendBtn, opacity: isSending ? 0.5 : 1 }} onClick={sendMessage} disabled={isSending || isLoading}>
          {isSending || isLoading ? "…" : "🪨"}
        </button>
      </div>
    </div>
  );
}

// ─── Welcome Screen ──────────────────────────────────────────────────────────
function WelcomeScreen({ onNext }) {
  const [val, setVal] = useState("");
  const [err, setErr] = useState("");
  const [checking, setChecking] = useState(false);
  const submit = async () => {
    const trimmed = val.trim();
    if (trimmed.length < 2) { setErr("needs at least 2 characters"); return; }
    if (trimmed.length > 20) { setErr("max 20 characters"); return; }
    setChecking(true); setErr("");
    const result = await checkContent(trimmed, "username");
    setChecking(false);
    if (!result.allowed) { setErr(`🚫 ${result.reason || "pick a rock-friendly name!"}`); return; }
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
          <input style={styles.input} value={val}
            onChange={e => { setVal(e.target.value); setErr(""); }}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="e.g. Gneiss Person" maxLength={20} autoFocus />
          <div style={{ fontSize: 10, color: val.length >= 18 ? "#c0756a" : "#5a5050", textAlign: "right", marginTop: 4 }}>{val.length}/20</div>
          {err && <div style={styles.err}>{err}</div>}
          <button style={{ ...styles.primaryBtn, opacity: checking ? 0.7 : 1 }} onClick={submit} disabled={checking}>
            {checking ? "checking name... 🪨" : "become a rock →"}
          </button>
          <div style={{ fontSize: 10, color: "#5a5050", marginTop: 10, textAlign: "center" }}>names are checked for appropriateness</div>
        </div>
      </div>
    </div>
  );
}

// ─── Customize Screen ────────────────────────────────────────────────────────
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700;900&family=DM+Mono:wght@300;400&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1a1410; }
  @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)} }
  @keyframes wiggle { 0%,100%{transform:translate(-50%,-50%) rotate(0deg)}25%{transform:translate(-50%,-50%) rotate(-8deg)}75%{transform:translate(-50%,-50%) rotate(8deg)} }
  @keyframes pulse { 0%,100%{transform:scale(1)}50%{transform:scale(1.06)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#1a1410}::-webkit-scrollbar-thumb{background:#4a3f35;border-radius:2px}
`;

const styles = {
  app: { height:"100dvh", maxHeight:"100dvh", background:"linear-gradient(160deg,#1a1410 0%,#1e1a14 50%,#141a18 100%)", fontFamily:"'DM Mono',monospace", color:"#e8ddd0", display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto", position:"relative", overflow:"hidden" },
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
  scene: { position:"relative", height:320, flexShrink:0, overflow:"visible", padding:"0 60px" },
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
