<template>
  <header :class="isDarkMode === 'true' ? 'dark-mode' : 'light-mode'">
    <div id="mobile-navbar" class="navbar">
      <router-link
        to="/"
        :class="{ active: active('/') }"
        @click="responsiveNavbar()"
      >
        Home
      </router-link>
      <router-link
        to="/about"
        :class="{ active: active('/about') }"
        @click="responsiveNavbar()"
      >
        About
      </router-link>
      <icons
        :icon="isDarkMode === 'true' ? 'sun' : 'moon'"
        class="mode-switch"
        @click="toggleMode()"
      />
      <div class="icon-mobile" @click="responsiveNavbar()">☰</div>
    </div>
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
import { ref } from "vue"

const route = useRoute()

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
