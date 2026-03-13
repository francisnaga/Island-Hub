"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Send, User, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  body: string
  sender_id: string
  created_at: string
}

interface Conversation {
  id: string
  participant_one: string
  participant_two: string
  profiles: {
    id: string
    full_name: string
    avatar_url: string
  }
}

export default function MessagesView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [user, setUser] = useState<any>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function setup() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Fetch conversations
        const { data: convs } = await supabase
          .from('conversations')
          .select(`
            *,
            profiles_one:participant_one(id, full_name, avatar_url),
            profiles_two:participant_two(id, full_name, avatar_url)
          `)
          .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)

        const processed = convs?.map(c => ({
          ...c,
          profiles: c.participant_one === user.id ? c.profiles_two : c.profiles_one
        })) as any

        setConversations(processed || [])
      }
    }
    setup()
  }, [])

  useEffect(() => {
    if (!activeId) return

    // Fetch messages
    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', activeId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
    }
    fetchMessages()

    // Subscribe
    const channel = supabase
      .channel(`room:${activeId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `conversation_id=eq.${activeId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeId])

  async function sendMessage() {
    if (!newMessage.trim() || !activeId || !user) return

    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeId,
        sender_id: user.id,
        body: newMessage
      })

    if (!error) setNewMessage("")
  }

  const activeConv = conversations.find(c => c.id === activeId)

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[#050505] rounded-3xl border border-white/5 overflow-hidden">
      {/* Sidebar */}
      <div className={cn(
        "w-full md:w-80 border-r border-white/5 bg-[#0A0A0A]",
        activeId && "hidden md:block"
      )}>
        <div className="p-6 border-b border-white/5">
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Messages</h1>
        </div>
        <ScrollArea className="h-full">
          {conversations.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                "w-full p-4 flex items-center gap-3 transition-colors hover:bg-white/5 border-b border-white/5 text-left",
                activeId === c.id && "bg-white/5"
              )}
            >
              <Avatar className="h-12 w-12 border border-white/10">
                <AvatarImage src={c.profiles.avatar_url} />
                <AvatarFallback className="bg-ocean text-white font-bold">
                  {c.profiles.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{c.profiles.full_name}</p>
                <p className="text-xs text-white/40 truncate">Click to chat</p>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="p-10 text-center text-white/20 uppercase font-black text-[10px] tracking-widest">
              No conversations yet
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-[#050505]",
        !activeId && "hidden md:flex items-center justify-center"
      )}>
        {activeId ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-[#0A0A0A] flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setActiveId(null)}
              >
                <ChevronLeft />
              </Button>
              <Avatar className="h-8 w-8 border border-white/10">
                <AvatarImage src={activeConv?.profiles.avatar_url} />
                <AvatarFallback className="bg-ocean text-white font-bold text-xs">
                  {activeConv?.profiles.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="font-bold text-sm">{activeConv?.profiles.full_name}</p>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="flex flex-col gap-4">
                {messages.map((m) => {
                  const isMe = m.sender_id === user?.id
                  return (
                    <div
                      key={m.id}
                      className={cn(
                        "flex flex-col max-w-[80%]",
                        isMe ? "self-end items-end" : "self-start items-start"
                      )}
                    >
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-sm font-medium",
                        isMe 
                          ? "bg-ocean text-white rounded-tr-none" 
                          : "bg-white/5 text-white/90 rounded-tl-none border border-white/5"
                      )}>
                        {m.body}
                      </div>
                      <span className="text-[10px] text-white/20 mt-1 uppercase font-bold tracking-tighter">
                        {format(new Date(m.created_at), 'HH:mm')}
                      </span>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-6 bg-[#0A0A0A] border-t border-white/5">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="rounded-2xl border-white/5 bg-white/5 focus:border-gold/30 h-11"
                />
                <Button 
                  onClick={sendMessage}
                  className="rounded-2xl bg-gold hover:bg-gold/90 text-black font-black active:scale-95 transition-all w-11 h-11 p-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5 text-white/20">
              <Send className="h-8 w-8" />
            </div>
            <p className="uppercase font-black text-[10px] tracking-[0.3em] text-white/20">
              Select a chat to begin
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
