<template>
  <transition>
    <modal
      v-if="
        createShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      :is-active="
        createShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      @close="
        ;(createShown = false),
          (taskNameInput = ''),
          (taskDescriptionInput = ''),
          (taskIconInput = '')
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Create New Task</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="task-name">Task name</label>
          </div>
          <input
            id="task-name"
            v-model="taskNameInput"
            placeholder="Task name"
            class="modal-input"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-description">Task description</label>
          </div>
          <input
            id="task-description"
            v-model="taskDescriptionInput"
            placeholder="Task description"
            class="modal-input"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-background">Task background image</label>
          </div>
          <input
            id="task-background"
            v-model="taskIconInput"
            placeholder="Task background image"
            class="modal-input"
            @keydown.enter="createTask"
          />
        </div>
        <button @click="createTask">Create</button>
      </div>
    </modal>
  </transition>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">{{ currentProject?.name }}</p>
      <p class="title-sub">Tasks</p>
      <div class="spacer" />
      <div class="menu-section">
      </div>
    </div>
  </div>
</template>

<script setup>
import Modal from "../components/Modal.vue"

import { useRouter, useRoute } from "vue-router"
import axios from "axios"
import { useDataStore } from "../store.js"
import { ref, onMounted } from "vue"

const route = useRoute()
const router = useRouter()
const store = useDataStore()

const createShown = ref(false)
const currentProject = ref({})

let taskNameInput
let taskDescriptionInput
let taskIconInput
if (!localStorage.getItem("token")) {
  router.push("/login")
}

const createTask = () => {
  axios
    .post("/api/create-task", {
      projectId: currentProject.id,
      description: taskDescriptionInput,
      icon: taskIconInput,
      name: taskNameInput
    })
    .then((res) => {
      store.userData.projects.push(res.data.project)
      router.push(`/project/${res.data.project.id}`)
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
async function getProject(id) {
  await axios
    .get(`/api/project/${id}`)
    .then((res) => {
      currentProject.value = res.data
      currentProject.value.messages.focus = false
    })
    .catch((e) => {
      if (e.response?.status === 400) {
        router.push("/projects")
      } else if (e.response?.status !== 401) {
        store.error = `Error ${e.request.status}, ${
          e.response.data.message || e.request.statusMessage
        }`
        setTimeout(store.errorFalse, 5000)
      }
    })
}

onMounted(async () => {
  await getProject(route.params.id)
})
</script>
