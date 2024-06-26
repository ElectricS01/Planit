<template>
  <div class="container-flex">
    <div class="menu-grid">
      <div class="small-menu">
        <p>Register</p>
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
          <label for="email">Email</label>
        </div>
        <input
          id="email"
          v-model="email"
          placeholder="Email"
          class="modal-input"
          type="email"
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
        <div class="text-small">
          <router-link class="text-small" to="/login">
            Back to Login
          </router-link>
        </div>
        <button @click="submit">Enter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios"
import { useDataStore } from "../store.js"
import { useRouter } from "vue-router"

const store = useDataStore()
const router = useRouter()

let username = ""
let email = ""
let password = ""

const submit = async () => {
  store.error = ""
  axios
    .post("/api/register", {
      email: email.toLowerCase().trim(),
      password: password.trim(),
      userAgent: navigator.userAgent,
      username: username.trim()
    })
    .then((res) => {
      localStorage.setItem("token", res.data.token)
      Object.assign(axios.defaults, {
        headers: { Authorization: res.data.token }
      })
      router.push("/home")
    })
    .catch((e) => {
      console.log(e)
      store.error = `Error ${e.request.status}, ${
        e.response.data.message || e.request.statusMessage
      }`
      setTimeout(store.errorFalse, 5000)
    })
}
</script>
