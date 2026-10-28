import { useEffect, useRef, useState } from 'react'
import { ArrowRight, BookOpen, Calculator, Database, Plus, Send, ShieldCheck, SlidersHorizontal, Sparkles, TrendingUp } from 'lucide-react'
import { EvidenceTag } from '@/components/app/EvidenceTag'
import { useWorkspace } from '@/context/workspace-context'
import { useGo } from '@/hooks/use-go'
import { mockPromptChips, mockTopics } from '@/data/mock-data'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function prepareAiResponse(text: string) {
  return text
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\r\n/g, '\n')
}
const topicIcons = { diagnose: TrendingUp, compare: SlidersHorizontal, numbers: Calculator }

export default function MentorView() {
  const go = useGo()
  const { messages, chatLoading, sendMessage, openNewAction } = useWorkspace()
  const [input, setInput] = useState('')
  const chatEnd = useRef<HTMLDivElement>(null)

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, chatLoading])

  const send = (preset?: string) => {
    const text = (preset ?? input).trim()
    if (!text || chatLoading) return
    sendMessage(text)
    setInput('')
  }

  return (
    <section className="view mentor-view">
      <div className="page-heading compact">
        <div><p className="date-line">YOUR BUSINESS MENTOR</p><h1>Think it through, together.</h1><p>Advice grounded in your numbers, your context, and what is still unknown.</p></div>
        <EvidenceTag>Context connected</EvidenceTag>
      </div>
      <div className="mentor-layout">
        <div className="conversation">
          <div className="conversation-context"><Database size={15} /><span>Using September financials, business profile & active goals</span><button onClick={() => go('business')}>Inspect context</button></div>
          <div className="messages">
            {messages.map(m => (
              <div className={`message ${m.from}`} key={m.id}>
                {m.from === 'lumini' && <span className="mentor-seal"><Sparkles size={16} /></span>}
                <div>
                  {m.from === 'lumini' ? (
  <div className="message-content markdown-content">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {prepareAiResponse(m.text)}
    </ReactMarkdown>
  </div>
) : (
  <p>{m.text}</p>
)}
                  {m.detail && <small><BookOpen size={13} />{m.detail}</small>}
                  {m.from === 'lumini' && m.id !== 1 && <button className="message-action" onClick={() => openNewAction(m.text.split('.')[0])}><Plus size={14} />Turn into an action</button>}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="message lumini">
                <span className="mentor-seal"><Sparkles size={16} /></span>
                <div className="thinking"><i /><i /><i /><span>Reviewing your business context</span></div>
              </div>
            )}
            <div ref={chatEnd} />
          </div>
          <div className="prompt-chips">{mockPromptChips.map(p => <button key={p} onClick={() => send(p)}>{p}</button>)}</div>
          <form className="chat-form" onSubmit={e => { e.preventDefault(); send() }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="Ask about a decision, challenge, or opportunity…" aria-label="Message Lumini" rows={2} />
            <div>
              <span>Enter to send · Shift + Enter for a new line</span>
              <button className="send-btn" type="submit" disabled={!input.trim() || chatLoading} aria-label="Send message"><Send size={18} /></button>
            </div>
          </form>
          <p className="ai-note">Lumini can make mistakes. Review assumptions before consequential decisions.</p>
        </div>
        <aside className="mentor-aside">
          <p className="eyebrow">A BETTER CONVERSATION</p>
          <h3>Start with what matters.</h3>
          {mockTopics.map(x => {
            const Icon = topicIcons[x.key]
            return (
              <button className="topic-link" key={x.key} onClick={() => send(x.q)}>
                <Icon size={19} /><span><strong>{x.title}</strong><small>{x.desc}</small></span><ArrowRight size={15} />
              </button>
            )
          })}
          <div className="mentor-principle"><ShieldCheck size={20} /><p><strong>Context before advice.</strong><br />Lumini asks when a missing fact could change the answer.</p></div>
        </aside>
      </div>
    </section>
  )
}
