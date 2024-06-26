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
          class="modal-input"
          @keydown.enter="submit"
        />
        <div class="text-small">
          <label for="password">Password</label>
        </div>
        <input
          id="password"
          v-model="password"
          placeholder="Password"
          class="modal-input"
          type="password"
          @keydown.enter="submit"
        />
        <div style="display: flex; justify-content: space-between">
          <div class="text-small">
            <router-link class="text-small" to="/reset">
              Forgot Password?
            </router-link>
          </div>
          <div class="text-small">
            <router-link class="text-small" to="/register">
              Register?
            </router-link>
          </div>
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
      userAgent: navigator.userAgent,
      username: username.toLowerCase().trim()
    })
    .then((res) => {
      localStorage.setItem("token", res.data.token)
      Object.assign(axios.defaults, {
        headers: { Authorization: res.data.token }
      })
      router.push("/home")
    })
    .catch((e) => {
      store.error = e.response.data.message
      setTimeout(store.errorFalse, 5000)
    })
}
</script>
