<!-- Comment -->

<template>
  <header :class="isDarkMode === 'true' ? 'dark-mode' : 'light-mode'">
    <div id="mobile-navbar" class="navbar">
      <router-link
        to="/"
        :class="{ active: active('/') }"
        title="Planit Home Page"
        @click="responsiveNavbar()"
      >
        Home
      </router-link>
      <router-link
        to="/about"
        :class="{ active: active('/about') }"
        title="About Planit"
        @click="responsiveNavbar()"
      >
        About
      </router-link>
      <router-link
        v-if="store.userData.id"
        class="right"
        to="/projects"
        title="Settings"
      >
        Projects
      </router-link>
      <router-link
        v-else
        class="right"
        to="/login"
        :class="{ active: active('/login') }"
        title="Login to Planit"
      >
        Login
      </router-link>
      <icons
        :icon="isDarkMode === 'true' ? 'sun' : 'moon'"
        class="mode-switch"
        @click="toggleMode()"
      />
      <icons
        style="right: 88px"
        icon="bell"
        :class="{ active: store.notificationsShown == true }"
        class="mode-switch"
        @click="
          (store.notificationsShown = !store.notificationsShown),
            (store.quickSwitcherShown = false)
        "
      />
      <div class="icon-mobile" @click="responsiveNavbar()">☰</div>
    </div>
    <transition>
      <p v-if="store.error" class="error-banner">
        {{ store.error }}
      </p>
    </transition>
  </header>
  <main :class="isDarkMode === 'true' ? 'dark-mode' : 'light-mode'">
    <div class="background-container">
      <img
        class="background"
        :style="{ opacity: loaded ? 1 : 0 }"
        alt="background"
        src="/src/assets/background.webp"
        @load="loaded = true"
      />
      <transition>
        <modal-simple
          v-if="store.quickSwitcherShown"
          :is-active="store.quickSwitcherShown"
          @close="store.quickSwitcherShown = false"
        >
          <div class="switcher-modal">
            <input
              id="quick-switcher"
              v-model="switcherInput"
              placeholder="Quick switcher"
              class="switcher-input"
              @keydown.enter="activateItem(highlightedIndex)"
              @keydown.down.prevent="moveHighlight(1)"
              @keydown.up.prevent="moveHighlight(-1)"
            />
            <div class="switch-container scroll-bar">
              <div
                v-for="(item, index) in searchedItems"
                :key="item"
                class="switcher-item"
                :class="{ highlighted: index === highlightedIndex }"
                @click="activateItem(index)"
              >
                {{ typeof item === "string" ? item : item[0] }}
              </div>
            </div>
          </div>
        </modal-simple>
      </transition>
      <transition>
        <modal-simple
          v-if="store.notificationsShown && !store.quickSwitcherShown"
          :is-active="store.notificationsShown"
          @close="store.notificationsShown = false"
        >
          <div class="switcher-modal">
            <div class="switch-container scroll-bar">
              <p class="title-sub" style="text-align: center">Notifications</p>
              <div v-if="store.userData.notifications.length">
                <div
                  v-for="(item, index) in store.userData.notifications"
                  :key="item"
                  class="switcher-item"
                  :class="{ highlighted: index === highlightedIndex }"
                  @click="
                    router.push('/project/' + item.otherId),
                      (store.notificationsShown = false)
                  "
                >
                  {{
                    item.type
                      ? `You have been invited to ${store.userData.projects.find((project) => project.id == item.otherId)?.name}`
                      : ""
                  }}
                </div>
              </div>
              <div v-else>No new notifications</div>
            </div>
          </div>
        </modal-simple>
      </transition>
      <router-view />
    </div>
  </main>
</template>

<script setup>
import ModalSimple from "./components/ModalSimple.vue"
import Icons from "./components/Icons.vue"

import { useRoute, useRouter } from "vue-router"
import { useDataStore } from "./store.js"
import { nextTick, ref, watch } from "vue"
import axios from "axios"

const route = useRoute()
const router = useRouter()
const store = useDataStore()

const highlightedIndex = ref(0)
const switcherInput = ref()
const isDarkMode = ref("true")
const loaded = ref(false)

let searchedItems = store.switcherItems

if (localStorage.getItem("isDarkMode")) {
  isDarkMode.value = localStorage.getItem("isDarkMode")
} else {
  localStorage.setItem("isDarkMode", "true")
  isDarkMode.value = "true"
}
if (localStorage.getItem("isDarkMode") !== "true") {
  document.body.style.backgroundColor = "white"
}
Object.assign(axios.defaults, {
  headers: { Authorization: localStorage.getItem("token") }
})
if (localStorage.getItem("token")) {
  store.getUser()
} else {
  store.userData.switcherHistory =
    JSON.parse(localStorage.getItem("switcherHistory")) || []
  store.sortSwitcher()
}

const active = (routePattern) => {
  return route.path === routePattern
}
const responsiveNavbar = () => {
  const responsiveNavbar = document.getElementById("mobile-navbar")
  if (responsiveNavbar.className === "navbar") {
    responsiveNavbar.className += " responsive"
  } else {
    responsiveNavbar.className = "navbar"
  }
}
let toggleMode = () => {
  if (localStorage.getItem("isDarkMode") !== "true") {
    localStorage.setItem("isDarkMode", "true")
    document.body.style.backgroundColor = "#181a1b"
  } else {
    localStorage.setItem("isDarkMode", "false")
    document.body.style.backgroundColor = "white"
  }
  isDarkMode.value = localStorage.getItem("isDarkMode")
}

const toggleQuickSwitcher = ({ repeat, metaKey, ctrlKey, key }) => {
  if (repeat) return
  if ((metaKey || ctrlKey) && (key === "k" || key === "/")) {
    store.quickSwitcherShown = !store.quickSwitcherShown
    searchedItems = store.switcherItems
    if (store.quickSwitcherShown) {
      nextTick(() => {
        const quickSwitcher = document.getElementById("quick-switcher")
        quickSwitcher?.focus()
      })
    }
  }
}
const searchItems = () => {
  if (store.quickSwitcherShown) {
    const lastSearchedItems = searchedItems
    searchedItems = store.switcherItems.filter((item) =>
      typeof item === "string"
        ? item.toLowerCase().includes(switcherInput.value.toLowerCase())
        : item[0].toLowerCase().includes(switcherInput.value.toLowerCase())
    )
    searchedItems.sort((a, b) => {
      const aStartsWithSearch =
        typeof a === "string"
          ? a.toLowerCase().startsWith(switcherInput.value.toLowerCase())
          : a[0].toLowerCase().startsWith(switcherInput.value.toLowerCase())
      const bStartsWithSearch =
        typeof b === "string"
          ? b.toLowerCase().startsWith(switcherInput.value.toLowerCase())
          : b[0].toLowerCase().startsWith(switcherInput.value.toLowerCase())
      if (aStartsWithSearch && !bStartsWithSearch) {
        return -1
      } else if (!aStartsWithSearch && bStartsWithSearch) {
        return 1
      }
      return 0
    })
    if (JSON.stringify(lastSearchedItems) !== JSON.stringify(searchedItems)) {
      highlightedIndex.value = 0
    }
  }
}
const moveHighlight = (step) => {
  if (Object.keys(searchedItems).length === 0) return
  if (highlightedIndex.value === -1 && step === -1) {
    highlightedIndex.value = searchedItems.length - 1
  } else if (
    highlightedIndex.value === searchedItems.length - 1 &&
    step === 1
  ) {
    highlightedIndex.value = 0
  } else {
    highlightedIndex.value =
      (highlightedIndex.value + step + searchedItems.length) %
      searchedItems.length
  }
  nextTick(() => {
    const highlightedElement = document.getElementsByClassName("highlighted")
    if (highlightedElement) {
      highlightedElement[0].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest"
      })
    }
  })
}
const activateItem = (id) => {
  if (id !== -1 && searchedItems.length && store.quickSwitcherShown) {
    store.quickSwitcherShown = false
    router.push(
      typeof searchedItems[id] === "string"
        ? `/${searchedItems[id]}`
        : `/project/${searchedItems[id][1]}`
    )
    const existingPage = store.userData.switcherHistory.find((page) => {
      if (typeof page.page === "string") {
        return page.page === searchedItems[id]
      }
      return page.page[1] === searchedItems[id][1]
    })
    if (existingPage) {
      existingPage.searches++
    } else {
      store.userData.switcherHistory.push({
        page:
          typeof searchedItems[id] === "string"
            ? searchedItems[id]
            : [searchedItems[id][0], searchedItems[id][1]],
        searches: 1
      })
    }
    switcherInput.value = ""
    if (store.userData.saveSwitcher) {
      axios
        .post("/api/history", {
          history: store.userData.switcherHistory
        })
        .catch((e) => {
          console.log(e)
        })
    } else {
      localStorage.setItem(
        "switcherHistory",
        JSON.stringify(store.userData.switcherHistory)
      )
    }
    store.sortSwitcher()
  }
}
const escPressed = ({ key }) => {
  if (key === "Escape") {
    store.quickSwitcherShown = false
  }
}

document.addEventListener("keydown", toggleQuickSwitcher)
document.addEventListener("keydown", escPressed)

watch(switcherInput, () => {
  searchItems()
})
</script>
