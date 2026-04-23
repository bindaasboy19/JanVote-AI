export async function askJanVote(prompt: string, userType: string, language: string = 'en', history: any[] = []) {
  try {
    const isBroadcast = history.length === 0 && userType === 'volunteer' && prompt.includes('Generate an awareness script');

    const endpoint = isBroadcast ? '/api/broadcast' : '/api/chat';

    const body = isBroadcast
      ? JSON.stringify({ prompt: prompt.replace('Generate an awareness script for: ', '').split('.')[0], userType, language })
      : JSON.stringify({ prompt, userType, language, history });

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Error communicating with AI backend:", error);
    throw error;
  }
}
