<template>
  <transition>
    <modal
      v-if="
        createShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !createResourceShown &&
        !editResourceShown
      "
      :is-active="
        createShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !createResourceShown &&
        !editResourceShown
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
  <transition>
    <modal
      v-if="
        createResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown
      "
      :is-active="
        createResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown
      "
      @close="
        ;(createResourceShown = false),
          (resourceNameInput = ''),
          (resourceDescriptionInput = ''),
          (resourceIconInput = '')
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Create New Resource</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="task-name">Resource name</label>
          </div>
          <input
            id="task-name"
            v-model="resourceNameInput"
            placeholder="Task name"
            class="modal-input"
            @keydown.enter="createResource"
          />
          <div class="text-small">
            <label for="task-description">Resource description</label>
          </div>
          <input
            id="task-description"
            v-model="resourceDescriptionInput"
            placeholder="Task description"
            class="modal-input"
            @keydown.enter="createResource"
          />
          <div class="text-small">
            <label for="task-background">Resource background image</label>
          </div>
          <input
            id="task-background"
            v-model="resourceIconInput"
            placeholder="Task background image"
            class="modal-input"
            @keydown.enter="createResource"
          />
        </div>
        <button @click="createResource">Create</button>
      </div>
    </modal>
  </transition>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">{{ currentProject?.name }}</p>
      <p class="title-sub">Tasks</p>
      <div class="spacer" />
      <div class="menu-section">
        <div class="task-item" @click="createShown = true">
          <img
            src="https://i.electrics01.com/i/d81dabf74c88.png"
            alt="Create a new task"
            class="task-image"
          />
          <p class="text-medium">Create a New Task</p>
          <div class="task-container">
            <p class="text-medium-grey">
              Create a New Planit Task, Customise Description, Add Resources
            </p>
          </div>
        </div>
        <div
          v-for="(task, index) in currentProject.tasks"
          :id="'task-' + index"
          :key="task.id"
          class="task-item"
        >
          <img
            src="https://i.electrics01.com/i/d81dabf74c88.png"
            alt="Task background"
            class="task-image"
          />
          <p class="text-medium">
            {{ task.name }}
          </p>
          <div class="task-container">
            <p class="text-medium-grey">{{ task.description }}</p>
            <div class="date-container">
              <p class="text-medium-grey">
              </p>
              <p class="text-medium-grey">
              </p>
            </div>
          </div>
        </div>
      </div>
      <p class="title-sub">Resources</p>
      <div class="spacer" />
      <div class="menu-section">
        <div class="task-item" @click="createResourceShown = true">
          <img
            src="https://i.electrics01.com/i/d81dabf74c88.png"
            alt="Create a new resource"
            class="task-image"
          />
          <p class="text-medium">Create a New Resource</p>
          <div class="task-container">
            <p class="text-medium-grey">
              Create a New Planit Resource, Customise Name and Description
            </p>
          </div>
        </div>
        <div
          v-for="(resources, index) in currentProject.resources"
          :id="'task-' + index"
          :key="task.id"
          class="task-item"
        >
          <img
            src="https://i.electrics01.com/i/d81dabf74c88.png"
            alt="Task background"
            class="task-image"
          />
          <p class="text-medium">
            {{ resources.name }}
          </p>
          <div class="task-container">
            <p class="text-medium-grey">{{ resources.description }}</p>
          </div>
        </div>
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
const editShown = ref(false)
const createResourceShown = ref(false)
const editResourceShown = ref(false)
const currentProject = ref({})

let taskNameInput
let taskDescriptionInput
let taskIconInput
let taskStartInput
let taskEndInput
let resourceNameInput
let resourceDescriptionInput
let resourceIconInput

if (!localStorage.getItem("token")) {
  router.push("/login")
}

const createTask = () => {
  if (
    createShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !deleteShown.value
  )
    axios
      .post("/api/create-task", {
        id: currentProject.value.id,
        description: taskDescriptionInput,
        icon: taskIconInput,
        name: taskNameInput,
        start: taskStartInput || Date.now(),
        end: taskEndInput
      })
      .then((res) => {
        currentProject.value.tasks.push(res.data.task)
        createShown.value = false
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
}
const createResource = () => {
  if (
    createResourceShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !deleteShown.value
  )
    axios
      .post("/api/create-resource", {
        id: currentProject.value.id,
        description: resourceDescriptionInput,
        icon: resourceIconInput,
        name: resourceNameInput
      })
      .then((res) => {
        currentProject.value.resources.push(res.data.task)
        createResourceShown.value = false
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
}
const isComplete = (latest) => {
  if (dayjs(latest) < dayjs()) return true
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
