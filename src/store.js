import { defineStore } from "pinia"

import { ref } from "vue"
import axios from "axios"

const switcherPages = [
  "Home",
  "TonkGame",
  "Calculator",
  "Tetris",
  "Collider",
  "Mapit",
  "Account",
  "Chat"
]

export const useDataStore = defineStore("store", () => {
  const error = ref("")
  const userData = ref({})
  const quickSwitcherShown = ref(false)
  const switcherItems = ref(switcherPages)

  const errorFalse = () => {
    error.value = ""
  }

  const getItemSearches = (item) => {
    if (Array.isArray(item)) {
      const id = item[0]
      return (
        userData.value.switcherHistory.find((historyItem) => {
          if (Array.isArray(historyItem.page)) {
            return historyItem.page[0] === id
          }
          return historyItem.page === id
        })?.searches || 0
      )
    }
    return (
      userData.value.switcherHistory.find((historyItem) => {
        if (Array.isArray(historyItem.page)) {
          return historyItem.page[0] === item
        }
        return historyItem.page === item
      })?.searches || 0
    )
  }
  const sortSwitcher = () => {
    switcherItems.value.sort((a, b) => {
      const searchesA = getItemSearches(a)
      const searchesB = getItemSearches(b)

      return searchesB - searchesA
    })
  }
  const getUser = () => {
    axios
      .get("/api/user")
      .then(async (res) => {
        if (typeof res.data === "object") userData.value = res.data
        if (!userData.value.saveSwitcher) {
          userData.value.switcherHistory =
            JSON.parse(localStorage.getItem("switcherHistory")) || []
        }
        sortSwitcher()
        if (userData.value.chatsList) {
          switcherItems.value.push(
            ...userData.value.chatsList.map((obj) => [
              obj.type === 1 && obj.ownerDetails.id !== userData.value.id
                ? obj.ownerDetails.username
                : obj.name,
              obj.id
            ])
          )
          loadingChats.value = false
          chatSort()
          if (
            route.path.startsWith("/chat") &&
            !userData.value.chatsList.find(
              (chat) => chat?.id === parseInt(route.params.chatId)
            )
          )
            await router.push("/chat/1")
        }
      })
      .catch((e) => {
        if (e.response?.status !== 401) {
          error.value = `Error 503, Cannot Connect to Server ${e}`
          setTimeout(errorFalse, 5000)
        }
      })
  }

  return {
    error,
    errorFalse,
    getUser,
    userData,
    quickSwitcherShown,
    switcherItems
  }
})
