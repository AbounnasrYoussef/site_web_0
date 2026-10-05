"use client"

import { useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useLocale, useTranslations } from "next-intl"

import { sendMessage } from "../lib/api"
import { useAuth } from "@/app/(zguellou)/providers/AuthProvider"
import { useAuthFetch } from "@/app/(zguellou)/hooks/useAuthFetch"
import { useMediaQuery } from "@/app/(zguellou)/hooks/useMediaQuery"

export default function ChatbotPage() {
  const locale = useLocale()
  const isArabic = locale === "ar"

  const { user, accessToken, isInitialized } = useAuth()
  const authFetch = useAuthFetch()

  const t = useTranslations("chatbot")

  const [user_Id, setUser_Id] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null)

  const isMobile = useMediaQuery("768px")

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, isLoading])

useEffect(() => {
  if (!user_Id) {
    return
  }

  const savedMessages = localStorage.getItem(
    `chat_messages_${user_Id}`
  )

  if (savedMessages) {
    const parsedMessages = JSON.parse(savedMessages)

    if (
      parsedMessages.length <= 1 &&
      (parsedMessages.length === 0 || parsedMessages[0].role === "assistant")
    ) {
      setMessages([
        {
          role: "assistant",
          content: t("greeting", {
            userId: userName ?? "",
          }),
        },
      ])
    } else {
      setMessages(parsedMessages)
    }

    return
  }

  setMessages([
    {
      role: "assistant",
      content: t("greeting", {
        userId: userName ?? "",
      }),
    },
  ])
}, [user_Id, userName, locale])

  useEffect(() => {
    if (!isInitialized) {
      return
    }

    if (user && accessToken) {
      const fetchProfile = async () => {
        try {
          const res = await authFetch(
            `${process.env.NEXT_PUBLIC_AUTH_API_URL}/api/auth/profile`,
            {
              method: "GET",
            }
          )

          if (!res.ok) {
            throw new Error("Failed to fetch profile")
          }

          const data = await res.json()

          setUser_Id(data.user.id)
          setUserName(
  `${data.user.first_name === null ? "" : data.user.first_name} ${data.user.last_name === null ? "" : data.user.last_name}`.trim()
)
        } catch (error) {
          console.error("Profile fetch error:", error)
        }
      }

      fetchProfile()
      return
    }

    let guestId = localStorage.getItem("chatbot_guest_id")

    if (!guestId) {
      guestId = crypto.randomUUID()
      localStorage.setItem("chatbot_guest_id", guestId)
    }

    setUser_Id(guestId)
    setUserName(null)
  }, [isInitialized, user, accessToken])

  useEffect(() => {
    if (!user_Id || messages.length === 0) {
      return
    }

    localStorage.setItem(
      `chat_messages_${user_Id}`,
      JSON.stringify(messages)
    )
  }, [messages, user_Id])

  async function handleSend() {
    if (!input.trim() || !user_Id) {
      return
    }

    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      { role: "assistant", content: "" },
    ])

    setInput("")
    setIsLoading(true)
    setIsThinking(true)

    try {
      let answer = ""

      await sendMessage(user_Id, input, locale, (chunk) => {
        setIsThinking(false)

        answer += chunk

        setMessages((prev) => {
          const updated = [...prev]

          updated[updated.length - 1] = {
            role: "assistant",
            content: answer,
          }

          return updated
        })
      })
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev]

        updated[updated.length - 1] = {
          role: "assistant",
          content: "Something went wrong.",
        }

        return updated
      })
    } finally {
      setIsThinking(false)
      setIsLoading(false)
    }
  }

  async function resetChat() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/${user_Id}`,
        {
          method: "DELETE",
        }
      )

      if (!res.ok) {
        throw new Error("Failed to reset chat")
      }

      localStorage.removeItem(`chat_messages_${user_Id}`)

      setMessages([
        {
          role: "assistant",
          content: t("greeting", {
            userId: userName ?? "",
          }),
        },
      ])

      setInput("")
      setIsLoading(false)
    } catch (error) {
      console.error("Failed to reset", error)
    }
  }

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="flex h-[90vh] min-h-full w-full items-center justify-center bg-[#f7f7f7] bg-[radial-gradient(#d6d6d6_1px,transparent_1px)] [background-size:24px_24px] p-3 sm:p-8"
    >
      <div className="container flex h-full flex-col">
        <div className="flex w-full overflow-hidden border-[3px] border-black bg-white shadow-[8px_8px_0px_#000]">
          {isMobile ? (
            <div className="border-2 border-black p-6">
              <h2 className="w-48 text-2xl font-black tracking-wide">
                KHARITA AI
              </h2>

              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-gray-500">
                {t("moroccanOrientation")}
              </p>
            </div>
          ) : null}

          <header className="flex-1 border-2 border-black bg-[#0f7c82] p-3 sm:px-10 sm:py-8">
            <h1 className="text-2xl font-black text-white sm:text-4xl">
              {t("title")}
            </h1>

            <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-white/80 sm:mt-3 sm:text-base sm:tracking-[0.18em]">
              {t("subtitle")}
            </p>
          </header>
        </div>

        <div className="flex min-h-0 w-full flex-1 overflow-hidden border-[3px] border-black bg-white shadow-[8px_8px_0px_#000]">
          {isMobile ? (
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
          ) : null}

          <div className="flex flex-1 flex-col">
            <section
              ref={chatRef}
              className="flex-1 overflow-y-auto bg-[#fafafa] p-8"
            >
              <div className="space-y-6">
                {messages.map((message, index) => {
                  if (message.role === "assistant" && !message.content) {
                    return null
                  }

                  return (
                    <div
                      key={index}
                      dir={isArabic ? "rtl" : "ltr"}
                      className={
                        message.role === "user"
                          ? `${
                              isArabic ? "mr-auto" : "ml-auto"
                            } w-fit max-w-[85%] border-[2px] border-black bg-[#0f7c82] p-3 text-sm text-white shadow-[4px_4px_0px_#000] sm:max-w-[70%] sm:border-[3px] sm:p-5 sm:text-base sm:shadow-[5px_5px_0px_#000]`
                          : "w-fit max-w-[85%] border-[2px] border-black bg-white p-3 text-sm shadow-[4px_4px_0px_#000] sm:max-w-[70%] sm:border-[3px] sm:p-5 sm:text-base sm:shadow-[5px_5px_0px_#000]"
                      }
                    >
                      <ReactMarkdown>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )
                })}

                {isThinking && (
                  <div className="w-fit max-w-[85%] bg-[#fafafa] p-3 sm:max-w-[70%] sm:p-5">
                    <div className="flex h-8 items-center gap-2">
                      <span className="h-3.5 w-3.5 animate-bounce rounded-full border-[1.5px] border-black bg-[#0f7c82] [animation-delay:-0.45s]" />
                      <span className="h-3.5 w-3.5 animate-bounce rounded-full border-[1.5px] border-black bg-[#0f7c82] [animation-delay:-0.3s]" />
                      <span className="h-3.5 w-3.5 animate-bounce rounded-full border-[1.5px] border-black bg-[#0f7c82] [animation-delay:-0.15s]" />
                      <span className="h-3.5 w-3.5 animate-bounce rounded-full border-[1.5px] border-black bg-[#0f7c82]" />
                    </div>
                  </div>
                )}
              </div>
            </section>

            {!isMobile && (
              <div className="p-2">
                <button
                  onClick={resetChat}
                  className="w-full cursor-pointer border-[2px] border-black bg-[#DFFF00] p-2 px-4 text-sm font-bold uppercase shadow-[3px_3px_0px_#000] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:border-[3px] sm:p-3 sm:px-5 sm:text-base sm:shadow-[4px_4px_0px_#000]"
                >
                  {t("reset")}
                </button>
              </div>
            )}

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
                  className="h-11 flex-1 border-[2px] border-black bg-white px-3 text-sm outline-none focus:border-[#0f7c82] sm:h-14 sm:border-[3px] sm:px-5 sm:text-base"
                />

                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`border-[2px] border-black px-4 text-sm font-black text-white shadow-[3px_3px_0px_#000] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:border-[3px] sm:px-8 sm:text-base sm:shadow-[4px_4px_0px_#000] ${
                    isLoading || !input.trim()
                      ? "cursor-not-allowed bg-gray-500"
                      : "cursor-pointer bg-[#0f7c82]"
                  }`}
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