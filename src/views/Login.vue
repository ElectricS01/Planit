<!--
    Login.vue contains a login form, this form takes your username and password and passes it to the login api,
    the form also has a button to go to the register page
-->

<template>
  <div class="container-flex">
    <div class="menu-grid">
      <div class="small-menu">
        <!-- Username and password inputs -->
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
        <!-- Register button takes you to the register page -->
        <div class="text-small">
          <router-link class="text-small" to="/register">Register?</router-link>
        </div>
        <!-- This button calls the submit function -->
        <button @click="submit">Enter</button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Import functions used in this file
import { useDataStore } from "../store.js"
import axios from "axios"
import { useRouter } from "vue-router"

// Define these functions to be called
const store = useDataStore()
const router = useRouter()

// These variables store the values of inputs
let username = ""
let password = ""

// This function calls the login API with the username and password inputted, if this login is
// successful then the token sent back from the API is saved to localStorage and assigned to
// axios. After this the UserData sent by the API is saved to the global varaible and the
// QuickSwitcher is sorted then the user is sent to the projects page
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
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
</script>
