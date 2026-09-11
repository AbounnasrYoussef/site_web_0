
export async function sendMessage(
  userId: string,
  question: string,
  locale: string
) {
  const res = await fetch(
    "http://localhost:8000/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        question: question,
        locale: locale,
      }),
    }
  );

  if (!res.ok)
    throw new Error("Failed to send message")

  return res.json();
}