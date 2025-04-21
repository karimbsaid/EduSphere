const CHAT_URL = "http://127.0.0.1:8000/";
export const splitPdfFile = async (resourceData) => {
  const formData = new FormData();
  console.log(resourceData);
  formData.append("subheading_size", resourceData.heading_font_threshold);
  formData.append("debut_de_document", resourceData.debut_de_document);
  formData.append("space_threshold", resourceData.space_threshold);
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

export const ask = async (message) => {
  const response = await fetch(`${CHAT_URL}ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question: message }),
  });
  return response.json();
};
