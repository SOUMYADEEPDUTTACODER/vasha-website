import { API_BASE_URL } from '@/config/api';

export const chatService = {
  async getChats(limit = 50) {
    const token = localStorage.getItem("access_token")
    const res = await fetch(`${API_BASE_URL}/chats?limit=${limit}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      throw new Error(`Failed to fetch chats: ${res.status}`)
    }
    const data = await res.json()
    return data
  },

  async saveChat(text: string) {
    const token = localStorage.getItem("access_token")
    const res = await fetch(`${API_BASE_URL}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ text }),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Failed to save chat: ${res.status} ${body}`)
    }
    return await res.json()
  },
}
