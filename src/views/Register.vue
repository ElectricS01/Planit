<!--
    Register.vue contains a registration form, this form takes your username, email, and password and
    passes it to the register api, the form also has a button to go back to the login page
-->

<template>
  <div class="container-flex">
    <div class="menu-grid">
      <div class="small-menu">
        <!-- Username, email, and password inputs -->
        <p>Register</p>
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
          <label for="email">Email</label>
        </div>
        <input
          id="email"
          v-model="email"
          placeholder="Email"
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
          type="password"
          @keydown.enter="submit"
        />
        <!-- Back to Login button takes you to the login page -->
        <div class="text-small">
          <router-link class="text-small" to="/login">
            Back to Login
          </router-link>
        </div>
        <!-- This button calls the submit function -->
        <button @click="submit">Enter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import functions used in this file
import axios from "axios"
import { useDataStore } from "../store.js"
import { useRouter } from "vue-router"

// Define these functions to be called
const store = useDataStore()
const router = useRouter()

// These variables store the values of inputs
let username = ""
let email = ""
let password = ""

// This function calls the register API with the username, email, and password inputted,
// if this login is successful then the token sent back from the API is saved to localStorage
// and assigned to axios. Afterwards, the UserData sent by the API is saved to the global
// varaible and the QuickSwitcher is sorted then the user is sent to the projects page
const submit = async () => {
  store.error = ""
  axios
    .post("/api/register", {
      email: email.toLowerCase().trim(),
      password: password.trim(),
      username: username.trim()
    })
    .then((res) => {
      localStorage.setItem("token", res.data.token)
      Object.assign(axios.defaults, {
        headers: { Authorization: res.data.token }
      })
      store.userData = res.data
      store.userData.projects = []
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
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
</script>
