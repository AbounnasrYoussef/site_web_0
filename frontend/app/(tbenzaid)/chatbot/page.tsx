"use client"

import { useState, useEffect, useRef } from "react"
import { sendMessage } from "../lib/api"
import ReactMarkdown from "react-markdown"
import { useLocale,useTranslations } from "next-intl"
import { useAuth } from "@/app/(zguellou)/providers/AuthProvider"
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch"
import { useMediaQuery } from "@/app/(zguellou)/hooks/useMediaQuery"

const AnimatedMessage = ({ text }: { text: string }) => {
  const [displayed, setDisplayed] = useState<string>("")

  useEffect(() => {
    setDisplayed("")

    let i = 0

    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else
        clearInterval(interval)
    }, 15)

    return () => clearInterval(interval)
  }, [text])

  return <ReactMarkdown>{displayed}</ReactMarkdown>
}

export default function ChatbotPage() {

const locale = useLocale()
const isArabic = locale === "ar"
const { user, accessToken, isInitialized } = useAuth()
const authFetch = useAuthFetch()

const [user_Id, setUser_Id] = useState<string | null>(null)
const [userName, setUserName] = useState<string | null>(null)

const t = useTranslations("chatbot")

const [messages, setMessages] = useState<{ role: string ,content: string }[]>([
  {
    role: "assistant",
    content: t("greeting", { userId: user_Id ?? "" }),
  },
])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (chatRef.current)
    chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, isLoading])

  useEffect(() => {
  if (!isInitialized)
    return
  if (!user || !accessToken)
    return

  const fetchProfile = async () => {
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/profile`, {
        method: 'GET',
      })

      if (!res.ok)
        throw new Error('Failed to fetch profile')

      const data = await res.json()
      setUser_Id(data.user.id)
      setUserName(`${data.user.first_name} ${data.user.last_name}`)
    } catch (error) {
      console.error('Profile fetch error:', error)
    }
  }

  fetchProfile()
}, [isInitialized, user, accessToken])


useEffect(() => {
  if (!user_Id) return

  const savedMessages = localStorage.getItem(`chat_messages_${user_Id}`)

  if (savedMessages) {
    setMessages(JSON.parse(savedMessages))
  } else {
    setMessages([
      { role: "assistant", content: t("greeting", { userId: user_Id ?? "" }),},
    ])
  }
}, [user_Id, userName])


async function handleSend()
{
  if (!input.trim() || !user_Id)
    return
  setMessages((prev) => [
    ...prev,
    {role: "user",content: input,},
  ])
  setInput("")
  setIsLoading(true)
  try {
    const data = await sendMessage(user_Id,input, locale)
    setMessages((prev) => [
      ...prev,
      {role: "assistant",content: data.answer ?? "No answer received.",},
    ])
  } catch (error) {
    setMessages((prev) => [
      ...prev,
      {role: "assistant",content: "Something went wrong.",},
    ])
  } finally {
    setIsLoading(false)
  }
}

async function resetChat() {
  try {
    const res = await fetch(`http://localhost:8000/chat/${user_Id}`, {
      method: "DELETE",
    })

    if (!res.ok)
      throw new Error("Failed to reset chat")

    setMessages([
      {
        role: "assistant",
        content: t("greeting", { userId: user_Id ?? "" }),
      },
    ])

    setInput("")
    setIsLoading(false)
  } catch (error) {
    console.error("Failed to reset", error)
  }
}

  const isMobile = useMediaQuery("768px")

  return (
    <main  dir={isArabic ? "rtl" : "ltr"}  className="flex min-h-full items-center justify-center bg-[#f7f7f7] bg-[radial-gradient(#d6d6d6_1px,transparent_1px)] [background-size:24px_24px] p-3 sm:p-8 h-[90vh] w-full ">
      <div className="container h-full flex flex-col">
        <div className="w-full flex overflow-hidden border-[3px] border-black bg-white shadow-[8px_8px_0px_#000]">
          {isMobile 
          ?  (<div className={`border-2 border-black p-6`}>
            <h2 className="w-48 text-2xl font-black tracking-wide">
              KHARITA  AI
            </h2>

            <p className="mt-2 text-xs uppercase tracking-[0.25em] text-gray-500">
              {t("moroccanOrientation")}
            </p>
          </div>)
          : ""
          }
          <header className={`border-2  border-black bg-[#0f7c82] p-3 sm:px-10 sm:py-8 flex-1`}>
            <h1 className="text-2xl sm:text-4xl font-black text-white">
              {t("title")}
            </h1>

            <p className="mt-2 sm:mt-3 text-[10px] sm:text-base uppercase tracking-[0.14em] sm:tracking-[0.18em] text-white/80">
              {t("subtitle")}
            </p>
          </header>
        </div>
        <div className="w-full flex-1 min-h-0 flex overflow-hidden border-[3px] border-black bg-white shadow-[8px_8px_0px_#000]"> {/* content */}
          {isMobile 
            ? (<>
              <aside className="flex flex-col border-x-[4px] border-black bg-white">

                <div className="py-9">
                  <p className="mb-9 text-center text-base font-black uppercase tracking-wide">
                    {t("title_sug")}
                  </p>

                  <div className="flex flex-col items-center gap-6">
                      {(t.raw("questions") as string[]).map((question) => (
                      <button
                        key={question}
                        onClick={() => setInput(question)}
                        className="w-59.5 cursor-pointer border-[2px] border-black bg-[#0f7c82] px-3 py-2 text-xs font-bold text-white shadow-[3px_3px_0px_#000] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                        >
                        {question}
                      </button>
                      ))}
						      </div>
                </div>

                <div className="flex-1" />

                <div className="invisible border-black p-6">
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-gray-500">
                    {t("moroccanOrientation")}
                  </p>
                </div>

                <div className="p-5">
                  <button
                    onClick={resetChat}
                    className="w-full cursor-pointer border-[2px] border-black bg-[#DFFF00] p-3 px-5 font-bold uppercase shadow-[4px_4px_0px_#000] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  >
                    {t("reset")}
                  </button>
                </div>

              </aside>
            </>
            )
            : ""
          }

          <div className="flex flex-1 flex-col">

            <section ref={chatRef} className="flex-1 overflow-y-auto bg-[#fafafa] p-8">
            <div className="space-y-6">
              {messages.map((message, index) => {
              const isLastMessage = index === messages.length - 1

              return (
                <div
                  key={index}
                  dir={isArabic ? "rtl" : "ltr"}
                  className={
                  message.role === "user"
                    ? `${isArabic ? 'mr-auto' : 'ml-auto'} w-fit max-w-[85%] sm:max-w-[70%] border-[2px] sm:border-[3px] border-black bg-[#0f7c82] p-3 sm:p-5 text-sm sm:text-base text-white shadow-[4px_4px_0px_#000] sm:shadow-[5px_5px_0px_#000]`
                    : "w-fit max-w-[85%] sm:max-w-[70%] border-[2px] sm:border-[3px] border-black bg-white p-3 sm:p-5 text-sm sm:text-base shadow-[4px_4px_0px_#000] sm:shadow-[5px_5px_0px_#000]"
                }
                >
                  {message.role === "assistant" ? (
                  isLastMessage ? (
                    <AnimatedMessage text={message.content} />
                  ) : (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  )
                ) : (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                )}
                </div>
              )
            })}
            {isLoading && (
            <div className="w-fit max-w-[85%] sm:max-w-[70%] bg-[#fafafa] p-3 sm:p-5">
              <div className="flex items-center gap-2 h-8">
                <span className="h-3.5 w-3.5 rounded-full bg-[#0f7c82] border-[1.5px] border-black animate-bounce [animation-delay:-0.45s]" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#0f7c82] border-[1.5px] border-black animate-bounce [animation-delay:-0.3s]" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#0f7c82] border-[1.5px] border-black animate-bounce [animation-delay:-0.15s]" />
                <span className="h-3.5 w-3.5 rounded-full bg-[#0f7c82] border-[1.5px] border-black animate-bounce" />
              </div>
            </div>
          )}
            </div>
          </section>
          { !isMobile && (
           <div className="p-2" >
                  <button onClick={resetChat} className="cursor-pointer w-full border-[2px] border-black bg-[#DFFF00] p-2 sm:p-3 px-4 sm:px-5 text-sm sm:text-base font-bold uppercase shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
                    {t("reset")}
                  </button>
            </div>
          )
          }

            <footer className="border-t-[3px] border-black bg-white p-6">

              <div className="flex gap-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleSend()
                    }
                  }}
                  placeholder={t("placeholder")}
                  className="h-11 sm:h-14 flex-1 border-[2px] sm:border-[3px] border-black bg-white px-3 sm:px-5 text-sm sm:text-base outline-none focus:border-[#0f7c82]"
                />

                <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`border-[2px] sm:border-[3px] border-black px-4 sm:px-8 text-sm sm:text-base font-black text-white shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none ${(isLoading || !input.trim()) ? 'bg-gray-500 cursor-not-allowed' : "bg-[#0f7c82] cursor-pointer"}`}
              >
                {t("send")}
              </button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  )
}