<template>
  <div class="container-flex">
    <div class="menu-grid">
      <div class="small-menu">
        <p>Login</p>
        <div class="text-small">
          <label for="username">Username</label>
        </div>
        <input
          id="username"
          v-model="username"
          placeholder="Username"
          @keydown.enter="submit"
        />
        <div class="text-small">
          <label for="password">Password</label>
        </div>
        <input
          id="password"
          v-model="password"
          placeholder="Password"
          type="password"
          @keydown.enter="submit"
        />
        <div class="text-small">
          <router-link class="text-small" to="/register">Register?</router-link>
        </div>
        <button @click="submit">Enter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDataStore } from "../store.js"
import axios from "axios"
import { useRouter } from "vue-router"

const store = useDataStore()
const router = useRouter()

let username = ""
let password = ""

const submit = () => {
  store.error = ""
  axios
    .post("/api/login", {
      password: password.trim(),
      username: username.toLowerCase().trim()
    })
    .then((res) => {
      localStorage.setItem("token", res.data.token)
      Object.assign(axios.defaults, {
        headers: { Authorization: res.data.token }
      })
      store.userData = res.data
      if (!store.userData.saveSwitcher) {
        store.userData.switcherHistory =
          JSON.parse(localStorage.getItem("switcherHistory")) || []
      }
      store.sortSwitcher()
      if (store.userData.projects) {
        store.switcherItems.push(
          ...store.userData.projects.map((obj) => [
            obj.type === 1 && obj.ownerDetails.id !== store.userData.id
              ? obj.ownerDetails.username
              : obj.name,
            obj.id
          ])
        )
        store.loadingProjects = false
        store.sortProjects()
      }
      router.push("/projects")
    })
    .catch((e) => {
      store.error = e.response.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
</script>
