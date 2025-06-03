const CHAT_URL = "http://127.0.0.1:8000/";
export const splitPdfFile = async (resourceData) => {
  console.log(resourceData.file);
  const formData = new FormData();
  if (resourceData.file) formData.append("file", resourceData.file);
  const response = await fetch(`${CHAT_URL}store-from-file`, {
    method: "POST",
    body: formData,
  });
  return response.json();
};
export const storeDocuments = async (documents) => {
  const response = await fetch(`${CHAT_URL}store`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(documents),
  });
  return response.json();
};

export const ask = async (message, onToken) => {
  const response = await fetch(`${CHAT_URL}ask/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: message }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const token = decoder.decode(value, { stream: true });
    console.log("token", token);
    onToken(token);
  }
};
