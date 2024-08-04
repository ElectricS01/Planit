import { defineStore } from "pinia"

import { ref } from "vue"
import axios from "axios"
import { useRoute, useRouter } from "vue-router"

const switcherPages = ["Home", "Projects"]

export const useDataStore = defineStore("store", () => {
  const route = useRoute()
  const router = useRouter()

  const error = ref("")
  const loadingProjects = ref(true)
  const userData = ref({})
  const quickSwitcherShown = ref(false)
  const notificationsShown = ref(false)
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
  const sortProjects = () => {
    userData.value.projects.sort((a, b) => {
      if (a?.latest && b?.latest) {
        return new Date(b.latest) - new Date(a.latest)
      } else if (a?.latest) {
        return -1
      } else if (b?.latest) {
        return 1
      }
      return 0
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
        if (userData.value.projects) {
          switcherItems.value.push(
            ...userData.value.projects.map((obj) => [
              obj.type === 1 && obj.ownerDetails.id !== userData.value.id
                ? obj.ownerDetails.username
                : obj.name,
              obj.id
            ])
          )
          loadingProjects.value = false
          sortProjects()
          if (
            route.params.id &&
            !userData.value.projects.find(
              (project) => project?.id === parseInt(route.params.id)
            )
          )
            await router.push("/projects")
        }
      })
      .catch((e) => {
        if (e.response?.status === 401) {
          router.push("/login")
        } else {
          error.value = `Error 503, Cannot Connect to Server ${e}`
          setTimeout(errorFalse, 5000)
        }
      })
  }

  return {
    error,
    errorFalse,
    getUser,
    loadingProjects,
    notificationsShown,
    quickSwitcherShown,
    sortProjects,
    sortSwitcher,
    switcherItems,
    userData
  }
})
