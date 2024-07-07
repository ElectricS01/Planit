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
        class="right chat-button"
        to="/login"
        title="Login to Planit"
      >
        Login
      </router-link>
      <icons
        :icon="isDarkMode === 'true' ? 'sun' : 'moon'"
        class="mode-switch"
        @click="toggleMode()"
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
      <router-view />
    </div>
  </main>
</template>

<script setup>
import Icons from "./components/Icons.vue"
import { useRoute } from "vue-router"
import { useDataStore } from "./store.js"
import { ref } from "vue"
import axios from "axios"

const route = useRoute()
const store = useDataStore()

const isDarkMode = ref("true")
const loaded = ref(false)

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
    console.log(isDarkMode.value === "true" ? "sun" : "moon")
  } else {
    localStorage.setItem("isDarkMode", "false")
    document.body.style.backgroundColor = "white"
    console.log(isDarkMode.value === "true" ? "sun" : "moon")
  }
  isDarkMode.value = localStorage.getItem("isDarkMode")
}
</script>
