import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { chatApi } from '@/services/api';
import { LoadingSpinner } from '@/components/ui-custom/LoadingSpinner';
import {
    MessageCircle,
    ChevronRight,
    Search,
    Users,
} from 'lucide-react';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  :root {
    --blue: #2563EB; --blue-bright: #3B82F6; --blue-glow: #60A5FA;
    --black: #020408; --surface: #060C14; --surface2: #0A1220; --surface3: #0F1A2E;
    --border: rgba(37,99,235,0.18); --border-hover: rgba(59,130,246,0.45);
    --text: #E8F0FF; --muted: #6B86A8; --grid-color: rgba(37,99,235,0.06);
  }
  .comm-root * { box-sizing: border-box; }
  .comm-root { font-family: 'DM Sans', sans-serif; background: var(--black); color: var(--text); min-height: 100vh; }
  .grid-bg { background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); background-size: 60px 60px; }
  .grid-bg-sm { background-image: linear-gradient(var(--grid-color) 1px, transparent 1px), linear-gradient(90deg, var(--grid-color) 1px, transparent 1px); background-size: 30px 30px; }
  .search-bar { background: var(--surface2); border: 1px solid var(--border); border-radius: 14px; display: flex; align-items: center; padding: 0 16px; transition: border-color .25s, box-shadow .25s; }
  .search-bar:focus-within { border-color: rgba(59,130,246,0.5); box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
  .search-input { background: transparent; border: none; outline: none; color: var(--text); font-size: 15px; padding: 14px 10px; flex: 1; font-family: 'DM Sans', sans-serif; }
  .search-input::placeholder { color: var(--muted); }
  .chat-row {
    display: flex; align-items: center; gap: 16px;
    padding: 16px 20px; border-bottom: 1px solid rgba(37,99,235,0.08);
    text-decoration: none; color: inherit;
    transition: background .2s, border-color .2s;
    position: relative;
  }
  .chat-row::before {
    content: '';
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: var(--blue);
    border-radius: 0 3px 3px 0;
    opacity: 0;
    transition: opacity .2s;
  }
  .chat-row:hover { background: rgba(37,99,235,0.06); }
  .chat-row:hover::before { opacity: 1; }
  .chat-row:last-child { border-bottom: none; }
  .avatar { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px; color: white; flex-shrink: 0; position: relative; }
  .tutor-badge { position: absolute; bottom: -4px; right: -4px; background: var(--surface); border: 1px solid rgba(245,158,11,0.4); border-radius: 6px; padding: 2px 4px; }
  .chevron-box { width: 32px; height: 32px; border-radius: 8px; background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.15); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .2s; }
  .chat-row:hover .chevron-box { background: rgba(37,99,235,0.18); border-color: rgba(59,130,246,0.4); }
  .empty-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 40px; text-align: center; }
  .role-chip { display: inline-flex; align-items: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; padding: 3px 9px; border-radius: 6px; flex-shrink: 0; }
`;

export function CommunityList() {
    const [chats, setChats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const data = await chatApi.getUserChats();
                setChats(data);
            } catch (err) {
                console.error('Failed to fetch chats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchChats();
    }, []);

    const filteredChats = chats.filter(chat =>
        chat.course_name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="comm-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <style>{STYLES}</style>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Unique color per initial letter
    const avatarColors = [
        'linear-gradient(135deg,#2563EB,#1E3A8A)',
        'linear-gradient(135deg,#7c3aed,#4c1d95)',
        'linear-gradient(135deg,#0891b2,#164e63)',
        'linear-gradient(135deg,#059669,#064e3b)',
        'linear-gradient(135deg,#d97706,#78350f)',
    ];
    const getColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

    return (
        <div className="comm-root">
            <style>{STYLES}</style>

            <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 120px' }}>
                {/* Section header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--blue) 0%, #1E3A8A 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
                        <MessageCircle size={22} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, margin: 0 }}>Community</h1>
                        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '3px 0 0' }}>
                            {chats.length} batch {chats.length === 1 ? 'group' : 'groups'}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="search-bar" style={{ marginBottom: 16 }}>
                    <Search size={18} color="var(--muted)" />
                    <input
                        className="search-input"
                        type="text"
                        placeholder="Search batches or courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                        <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>✕</button>
                    )}
                </div>

                {/* Chat list card */}
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }} className="grid-bg-sm">
                    {filteredChats.length === 0 ? (
                        <div className="empty-box">
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <MessageCircle size={28} color="var(--muted)" />
                            </div>
                            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>
                                {search ? `No results for "${search}"` : 'No conversations yet'}
                            </h3>
                            <p style={{ color: 'var(--muted)', maxWidth: 360, lineHeight: 1.6, fontSize: 14 }}>
                                When you enroll in courses or start teaching, your community groups will appear here.
                            </p>
                        </div>
                    ) : (
                        filteredChats.map((chat) => {
                            const isTutor = chat.role === 'tutor';
                            const timeStr = chat.last_message
                                ? new Date(chat.last_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '';

                            return (
                                <Link
                                    key={chat.id}
                                    to={`/community/${chat.id}`}
                                    className="chat-row"
                                >
                                    {/* Avatar */}
                                    <div className="avatar" style={{ background: isTutor ? 'linear-gradient(135deg,#d97706,#78350f)' : getColor(chat.course_name) }}>
                                        {chat.course_name.charAt(0).toUpperCase()}
                                        {isTutor && (
                                            <div className="tutor-badge">
                                                <Users size={10} color="#f59e0b" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Text */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                                                {chat.course_name}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                {isTutor && (
                                                    <span className="role-chip" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}>
                                                        Tutor
                                                    </span>
                                                )}
                                                {timeStr && (
                                                    <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{timeStr}</span>
                                                )}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: 13, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                                            {chat.last_message ? (
                                                <>
                                                    <span style={{ color: 'rgba(232,240,255,0.7)', fontWeight: 600 }}>
                                                        {chat.last_message.sender_email.split('@')[0]}:
                                                    </span>
                                                    {' '}{chat.last_message.message}
                                                </>
                                            ) : (
                                                <span style={{ color: 'var(--blue-glow)', fontStyle: 'italic' }}>No messages yet — start a conversation!</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Chevron */}
                                    <div className="chevron-box">
                                        <ChevronRight size={16} color="var(--blue-glow)" />
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
