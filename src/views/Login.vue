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
const store = useDataStore()

let username = ""
let password = ""

const submit = () => {
}
</script>
