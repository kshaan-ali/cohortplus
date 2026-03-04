import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { chatApi } from '@/services/api';
import { supabase } from '@/lib/supabase';
import type { ChatMessage } from '@/types';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import {
    MessageCircle,
    Send,
    ShieldCheck,
    Users,
    ChevronDown,
    Zap,
    Hash,
    Search,
    X,
} from 'lucide-react';

/* ─────────────── Styles ─────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  :root {
    --blue:#2563EB; --blue-bright:#3B82F6; --blue-glow:#60A5FA;
    --black:#020408; --surface:#060C14; --surface2:#0A1220; --surface3:#0F1A2E;
    --border:rgba(37,99,235,0.18); --border-h:rgba(59,130,246,0.45);
    --text:#E8F0FF; --muted:#6B86A8; --grid:rgba(37,99,235,0.06);
  }
  .dc-root { font-family:'DM Sans',sans-serif; background:var(--black); color:var(--text); height:calc(100vh - 80px); display:flex; overflow:hidden; }
  /* Sidebar */
  .dc-sidebar { width:260px; min-width:260px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; }
  .dc-sidebar-header { padding:16px; border-bottom:1px solid var(--border); }
  .dc-sidebar-title { font-family:'Syne',sans-serif; font-weight:800; font-size:15px; color:var(--text); margin-bottom:10px; display:flex;align-items:center;gap:8px;}
  .dc-search { background:var(--surface3); border:1px solid var(--border); border-radius:8px; display:flex; align-items:center; padding:0 10px; transition:border-color .2s; }
  .dc-search:focus-within { border-color:rgba(59,130,246,0.5); }
  .dc-search input { background:transparent; border:none; outline:none; color:var(--text); font-size:13px; padding:7px 8px; flex:1; }
  .dc-search input::placeholder { color:var(--muted); }
  .dc-chat-list { flex:1; overflow-y:auto; padding:8px; }
  .dc-chat-list::-webkit-scrollbar { width:4px; }
  .dc-chat-list::-webkit-scrollbar-thumb { background:rgba(37,99,235,0.2); border-radius:4px; }
  .dc-channel { display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:8px; cursor:pointer; transition:background .15s; color:var(--muted); font-size:14px; font-weight:500; text-decoration:none; border:none; background:transparent; width:100%; text-align:left; }
  .dc-channel:hover { background:rgba(255,255,255,0.05); color:var(--text); }
  .dc-channel.active { background:rgba(37,99,235,0.18); color:var(--text); }
  .dc-channel-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
  .dc-ch-avatar { width:32px; height:32px; border-radius:8px; display:flex;align-items:center;justify-content:center; font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:white;flex-shrink:0; }
  /* Main */
  .dc-main { flex:1; display:flex; flex-direction:column; overflow:hidden; }
  .dc-header { padding:14px 20px; border-bottom:1px solid var(--border); background:rgba(6,12,20,0.8); backdrop-filter:blur(16px); display:flex; align-items:center; gap:14px; flex-shrink:0; }
  .dc-messages { flex:1; overflow-y:auto; padding:24px 20px; background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px); background-size:40px 40px; }
  .dc-messages::-webkit-scrollbar { width:6px; }
  .dc-messages::-webkit-scrollbar-thumb { background:rgba(37,99,235,0.2); border-radius:4px; }
  .dc-msg-row { display:flex; align-items:flex-start; gap:12px; margin-top:20px; }
  .dc-msg-row.compact { margin-top:2px; }
  .dc-avatar { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-family:'Syne',sans-serif; font-weight:800; font-size:13px; color:white; flex-shrink:0; }
  .dc-avatar.ghost { visibility:hidden; }
  .dc-bubble { padding:10px 14px; border-radius:12px; font-size:15px; line-height:1.5; word-break:break-word; white-space:pre-wrap; max-width:70%; }
  .dc-bubble.own { background:var(--blue); border:1px solid rgba(255,255,255,0.12); box-shadow:0 8px 20px -4px rgba(37,99,235,0.35); border-bottom-right-radius:3px; }
  .dc-bubble.other { background:rgba(255,255,255,0.04); border:1px solid var(--border); border-bottom-left-radius:3px; }
  .dc-date-sep { display:flex; align-items:center; justify-content:center; margin:24px 0 8px; }
  .dc-date-chip { background:rgba(255,255,255,0.05); border:1px solid var(--border); color:var(--muted); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; padding:4px 12px; border-radius:8px; }
  .dc-input-area { padding:16px 20px; border-top:1px solid var(--border); background:rgba(0,0,0,0.5); backdrop-filter:blur(20px); flex-shrink:0; }
  .dc-input-wrap { display:flex; gap:12px; align-items:center; background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:4px 4px 4px 16px; transition:border-color .2s; }
  .dc-input-wrap:focus-within { border-color:rgba(59,130,246,0.5); }
  .dc-input { flex:1; background:transparent; border:none; outline:none; color:var(--text); font-size:15px; padding:10px 0; font-family:'DM Sans',sans-serif; }
  .dc-input::placeholder { color:var(--muted); }
  .dc-send { width:40px; height:40px; border-radius:10px; background:var(--blue); border:none; display:flex;align-items:center;justify-content:center; cursor:pointer; flex-shrink:0; transition:all .2s; }
  .dc-send:hover:not(:disabled) { background:var(--blue-bright); transform:scale(1.05); }
  .dc-send:disabled { opacity:.4; cursor:not-allowed; }
  .dc-unread-dot { width:7px; height:7px; border-radius:50%; background:var(--blue-glow); flex-shrink:0; }
  .dc-live-dot { width:7px; height:7px; border-radius:50%; background:#34d399; animation:livePulse 2s infinite; display:inline-block; }
  @keyframes livePulse { 0%,100%{opacity:1;} 50%{opacity:.4;} }
  /* Participants modal */
  .dc-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); backdrop-filter:blur(6px); z-index:100; display:flex; align-items:center; justify-content:center; animation:fadeIn .15s ease; }
  .dc-modal { background:var(--surface); border:1px solid var(--border); border-radius:20px; width:380px; max-height:70vh; display:flex; flex-direction:column; box-shadow:0 24px 64px -16px rgba(0,0,0,0.7); animation:slideUp .2s ease; }
  .dc-modal-header { padding:20px 24px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; }
  .dc-modal-body { flex:1; overflow-y:auto; padding:8px 12px; }
  .dc-modal-body::-webkit-scrollbar { width:4px; }
  .dc-modal-body::-webkit-scrollbar-thumb { background:rgba(37,99,235,0.2); border-radius:4px; }
  .dc-participant { display:flex; align-items:center; gap:12px; padding:10px 12px; border-radius:12px; transition:background .15s; }
  .dc-participant:hover { background:rgba(255,255,255,0.04); }
  .dc-header-clickable { cursor:pointer; flex:1; min-width:0; border-radius:8px; padding:4px 8px; margin:-4px -8px; transition:background .15s; }
  .dc-header-clickable:hover { background:rgba(255,255,255,0.05); }
  @keyframes fadeIn { from{opacity:0;} to{opacity:1;} }
  @keyframes slideUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
`;

/* ─────────────── Helpers ─────────────── */
const AVATAR_GRADIENTS = [
    'linear-gradient(135deg,#2563EB,#1E3A8A)',
    'linear-gradient(135deg,#7c3aed,#4c1d95)',
    'linear-gradient(135deg,#0891b2,#164e63)',
    'linear-gradient(135deg,#059669,#064e3b)',
    'linear-gradient(135deg,#d97706,#78350f)',
];
const colorFor = (str: string) => AVATAR_GRADIENTS[str.charCodeAt(0) % AVATAR_GRADIENTS.length];
const initials = (email: string) => email.split('@')[0].slice(0, 2).toUpperCase();

function hashGradient(id: string): string {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_GRADIENTS[Math.abs(h) % AVATAR_GRADIENTS.length];
}

/* ─────────────── Component ─────────────── */
export function BatchChat() {
    const { batchId } = useParams<{ batchId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth?.() ?? {};

    /* sidebar state */
    const [chats, setChats] = useState<any[]>([]);
    const [sidebarSearch, setSidebarSearch] = useState('');

    /* chat state */
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [batchInfo, setBatchInfo] = useState<any>(null);
    const [showScrollDown, setShowScrollDown] = useState(false);

    /* participants state */
    const [showParticipants, setShowParticipants] = useState(false);
    const [participants, setParticipants] = useState<Array<{ id: string; name: string; role: string; joined_at: string | null }>>([]);
    const [participantsTotal, setParticipantsTotal] = useState(0);
    const [loadingParticipants, setLoadingParticipants] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    }, []);

    /* fetch sidebar chats */
    useEffect(() => {
        chatApi.getUserChats().then(setChats).catch(console.error);
    }, []);

    /* fetch this batch's messages */
    useEffect(() => {
        if (!batchId) return;
        setLoading(true);
        setMessages([]);
        const init = async () => {
            try {
                const accessData = await chatApi.checkAccess(batchId);
                setHasAccess(accessData.hasAccess);
                setBatchInfo(accessData.batchInfo);
                if (accessData.hasAccess) {
                    const msgs = await chatApi.getMessages(batchId);
                    setMessages(msgs);
                    setTimeout(() => scrollToBottom('instant'), 100);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load chat');
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [batchId, scrollToBottom]);

    /* realtime */
    useEffect(() => {
        if (!batchId || !hasAccess) return;
        const channel = supabase
            .channel(`chat:${batchId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `batch_id=eq.${batchId}` },
                (payload) => {
                    const newMsg = payload.new as ChatMessage;
                    setMessages((prev) => {
                        if (prev.find((m) => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                    const c = messagesContainerRef.current;
                    if (c && (c.scrollHeight - c.scrollTop - c.clientHeight < 150 || newMsg.sender_id === user?.id)) {
                        setTimeout(() => scrollToBottom(), 50);
                    }
                })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [batchId, hasAccess, user?.id, scrollToBottom]);

    const handleScroll = () => {
        const c = messagesContainerRef.current;
        if (!c) return;
        setShowScrollDown(c.scrollHeight - c.scrollTop - c.clientHeight > 150);
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !batchId || sending) return;
        const text = newMessage.trim();
        setNewMessage('');
        setSending(true);
        try {
            await chatApi.sendMessage(batchId, text);
        } catch {
            setError('Failed to send message');
            setNewMessage(text);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const groupedMessages = messages.reduce<Record<string, ChatMessage[]>>((g, msg) => {
        const d = new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        if (!g[d]) g[d] = [];
        g[d].push(msg);
        return g;
    }, {});

    const filteredChats = chats.filter(c => c.course_name.toLowerCase().includes(sidebarSearch.toLowerCase()));

    /* ── Render ── */
    return (
        <div className="dc-root">
            <style>{STYLES}</style>

            {/* ── LEFT SIDEBAR ── */}
            <aside className="dc-sidebar">
                <div className="dc-sidebar-header">
                    <div className="dc-sidebar-title">
                        <MessageCircle size={16} color="var(--blue-glow)" />
                        Community
                    </div>
                    <div className="dc-search">
                        <Search size={13} color="var(--muted)" />
                        <input
                            placeholder="Search..."
                            value={sidebarSearch}
                            onChange={(e) => setSidebarSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="dc-chat-list">
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', padding: '8px 10px 4px', marginBottom: 4 }}>
                        Batch Channels
                    </div>
                    {filteredChats.length === 0 && (
                        <div style={{ padding: '20px 10px', color: 'var(--muted)', fontSize: 13, textAlign: 'center' }}>
                            No chats found
                        </div>
                    )}
                    {filteredChats.map((chat) => (
                        <button
                            key={chat.id}
                            className={`dc-channel ${chat.id === batchId ? 'active' : ''}`}
                            onClick={() => navigate(`/community/${chat.id}`)}
                        >
                            <div className="dc-ch-avatar" style={{ background: chat.role === 'tutor' ? 'linear-gradient(135deg,#d97706,#78350f)' : colorFor(chat.course_name) }}>
                                {chat.course_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="dc-channel-name" title={chat.course_name}>{chat.course_name}</span>
                            {chat.id === batchId && <span className="dc-live-dot" style={{ marginLeft: 'auto' }} />}
                            {chat.last_message && chat.id !== batchId && (
                                <span className="dc-unread-dot" style={{ marginLeft: 'auto', opacity: 0.5 }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* User footer */}
                <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: hashGradient(user?.id || ''), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                        {user?.email ? initials(user.email) : '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email?.split('@')[0] || 'You'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Online</div>
                    </div>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
                </div>
            </aside>

            {/* ── RIGHT MAIN ── */}
            <main className="dc-main">
                {loading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <LoadingSpinner size="lg" />
                    </div>
                ) : !hasAccess ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                        <div style={{ maxWidth: 440, textAlign: 'center' }}>
                            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                <ShieldCheck size={36} color="#EF4444" />
                            </div>
                            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 12 }}>Access Denied</h2>
                            <p style={{ color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28 }}>
                                You must be enrolled in this batch or be the course tutor to join this community.
                            </p>
                            <button
                                onClick={() => navigate('/my-enrollments')}
                                style={{ background: 'var(--blue)', color: 'white', border: 'none', borderRadius: 10, padding: '12px 28px', fontFamily: 'Syne, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
                            >
                                View My Enrollments
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <header className="dc-header">
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Hash size={18} color="var(--blue-glow)" />
                            </div>
                            <div className="dc-header-clickable" onClick={async () => {
                                setShowParticipants(true);
                                if (participants.length === 0 && batchId) {
                                    setLoadingParticipants(true);
                                    try {
                                        const data = await chatApi.getParticipants(batchId);
                                        setParticipants(data.participants);
                                        setParticipantsTotal(data.total);
                                    } catch { /* ignore */ }
                                    finally { setLoadingParticipants(false); }
                                }
                            }}>
                                <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {batchInfo?.course_name || 'Community Chat'}
                                </h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                                    <Users size={12} />
                                    <span>Tap to see participants · {batchInfo?.start_date ? new Date(batchInfo.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Active'}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#34d399' }}>
                                <span className="dc-live-dot" /> LIVE
                            </div>
                        </header>

                        {/* Participants Modal */}
                        {showParticipants && (
                            <div className="dc-overlay" onClick={() => setShowParticipants(false)}>
                                <div className="dc-modal" onClick={e => e.stopPropagation()}>
                                    <div className="dc-modal-header">
                                        <div>
                                            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, margin: 0 }}>Participants</h2>
                                            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{participantsTotal} member{participantsTotal !== 1 ? 's' : ''}</p>
                                        </div>
                                        <button onClick={() => setShowParticipants(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', transition: 'all .15s' }}>
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="dc-modal-body">
                                        {loadingParticipants ? (
                                            <div style={{ padding: 40, display: 'flex', justifyContent: 'center' }}>
                                                <LoadingSpinner size="md" />
                                            </div>
                                        ) : participants.length === 0 ? (
                                            <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>No participants found.</div>
                                        ) : (
                                            participants.map(p => (
                                                <div key={p.id} className="dc-participant">
                                                    <div className="dc-avatar" style={{ background: hashGradient(p.id), width: 40, height: 40, fontSize: 14 }}>
                                                        {p.name.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {p.name}
                                                            </span>
                                                            {p.role === 'tutor' && (
                                                                <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(37,99,235,0.12)', color: 'var(--blue-glow)', border: '1px solid rgba(37,99,235,0.25)', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '.04em', flexShrink: 0 }}>Tutor</span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                                                            {p.role === 'tutor' ? 'Course Instructor' : p.joined_at ? `Joined ${new Date(p.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Enrolled'}
                                                        </div>
                                                    </div>
                                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', flexShrink: 0, opacity: 0.6 }} />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div ref={messagesContainerRef} className="dc-messages" onScroll={handleScroll} style={{ position: 'relative' }}>
                            {messages.length === 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: 40 }}>
                                    <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(37,99,235,0.08)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                                        <Zap size={28} color="var(--muted)" />
                                    </div>
                                    <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, marginBottom: 10 }}>Start the Conversation</h3>
                                    <p style={{ color: 'var(--muted)', maxWidth: 340 }}>Be the first to share insights or ask questions in this community!</p>
                                </div>
                            ) : (
                                Object.entries(groupedMessages).map(([date, msgs]) => (
                                    <div key={date}>
                                        <div className="dc-date-sep">
                                            <span className="dc-date-chip">{date}</span>
                                        </div>
                                        {msgs.map((msg, idx) => {
                                            const isOwn = msg.sender_id === user?.id;
                                            const isTutor = msg.sender_role === 'tutor';
                                            const showMeta = idx === 0 || msgs[idx - 1].sender_id !== msg.sender_id;
                                            return (
                                                <div key={msg.id} className={`dc-msg-row${showMeta ? '' : ' compact'}`} style={{ flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                                                    <div className={`dc-avatar${showMeta ? '' : ' ghost'}`} style={{ background: hashGradient(msg.sender_id) }}>
                                                        {initials(msg.sender_email)}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', gap: 3 }}>
                                                        {showMeta && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, padding: '0 4px' }}>
                                                                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'rgba(232,240,255,0.75)' }}>
                                                                    {msg.sender_email.split('@')[0]}
                                                                </span>
                                                                {isTutor && (
                                                                    <span style={{ fontSize: 10, fontWeight: 700, background: 'rgba(37,99,235,0.12)', color: 'var(--blue-glow)', border: '1px solid rgba(37,99,235,0.25)', padding: '2px 8px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Tutor</span>
                                                                )}
                                                                <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 500 }}>
                                                                    {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className={`dc-bubble ${isOwn ? 'own' : 'other'}`}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />

                            {/* Scroll-to-bottom FAB */}
                            {showScrollDown && (
                                <button
                                    onClick={() => scrollToBottom()}
                                    style={{ position: 'sticky', bottom: 16, left: '50%', transform: 'translateX(-50%)', width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 10, marginLeft: '50%' }}
                                >
                                    <ChevronDown size={18} />
                                </button>
                            )}
                        </div>

                        {/* Error bar */}
                        {error && (
                            <div style={{ padding: '8px 20px', background: 'rgba(239,68,68,0.1)', color: '#EF4444', borderTop: '1px solid rgba(239,68,68,0.2)', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                                <span>{error}</span>
                                <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>✕</button>
                            </div>
                        )}

                        {/* Input */}
                        <div className="dc-input-area">
                            <div className="dc-input-wrap">
                                <input
                                    ref={inputRef}
                                    className="dc-input"
                                    type="text"
                                    placeholder={`Message #${batchInfo?.course_name || 'channel'}...`}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={sending}
                                />
                                <button className="dc-send" onClick={handleSend} disabled={!newMessage.trim() || sending}>
                                    {sending ? <LoadingSpinner size="sm" /> : <Send size={17} color="white" style={{ marginLeft: 2 }} />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
