import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import { MESSAGES } from "@/constants/messages";

export async function importCsv(file) {
  const formData = new FormData();
  formData.append("file", file);

  let response;

  try {
    response = await fetch(API_ENDPOINTS.import, {
      method: "POST",
      body: formData,
    });
  } catch (networkError) {
    throw new Error(MESSAGES.errorNetworkFailure);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      errorBody?.error || MESSAGES.errorImportFailed(response.status)
    );
  }

  const data = await response.json().catch(() => {
    throw new Error(MESSAGES.errorUnexpectedResponse);
  });

  return data;
}

export async function checkHealth() {
  try {
    const response = await fetch(API_ENDPOINTS.health);
    return response.ok;
  } catch {
    return false;
  }
}