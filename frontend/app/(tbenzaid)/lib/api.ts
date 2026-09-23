
// export async function sendMessage(
//   userId: string,
//   question: string,
//   locale: string
// ) {
//   const res = await fetch(
//     "http://localhost:8000/chat",
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         user_id: userId,
//         question: question,
//         locale: locale,
//       }),
//     }
//   );

//   if (!res.ok)
//     throw new Error("Failed to send message")

//   return res.json();
// }

export async function sendMessage(
  userId: string,
  question: string,
  locale: string,
  onChunk: (chunk: string) => void
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

  if (!res.ok) {
    throw new Error("Failed to send message");
  }

  if (!res.body) {
    throw new Error("No response body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    const chunk = decoder.decode(value, { stream: true });

    onChunk(chunk);
  }
}