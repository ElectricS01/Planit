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
          (taskIconInput = ''),
          (taskStartInput = ''),
          (taskEndInput = '')
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
            placeholder="Task background URL"
            class="modal-input"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-start">Task start date</label>
          </div>
          <input
            id="task-start"
            v-model="taskStartInput"
            placeholder="Task start date"
            class="modal-input"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-end">Task end date</label>
          </div>
          <input
            id="task-end"
            v-model="taskEndInput"
            placeholder="Task end date"
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
            placeholder="Task background URL"
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
            src="https://i.electrics01.com/i/55bae440a2b3.png"
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
            src="https://i.electrics01.com/i/55bae440a2b3.png"
            alt="Task background"
            class="task-image"
          />
          <p class="text-medium">
            {{ task.name }}
          </p>
          <div class="task-container">
            <p class="text-medium-grey">{{ task.description }}</p>
            <p v-if="isComplete(task.dueAt)" class="text-medium-grey">
              There are no upcoming tasks
            </p>
            <div class="date-container">
              <p class="text-medium-grey">
                Starts at: {{ displayTime(task.startsAt, false) }}
              </p>
              <p class="text-medium-grey">
                Ends at: {{ displayTime(task.dueAt, true) }}
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
            src="https://i.electrics01.com/i/124bd47c48c7.png"
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
            src="https://i.electrics01.com/i/124bd47c48c7.png"
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

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
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

const taskStartInput = ref("")
const taskEndInput = ref("")

let taskNameInput
let taskDescriptionInput
let taskIconInput
let resourceNameInput
let resourceDescriptionInput
let resourceIconInput

dayjs.extend(relativeTime)

if (!localStorage.getItem("token")) {
  router.push("/login")
}

const createTask = () => {
  if (
    createShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !editShown.value
  ) {
    let start
    let end

    // if (taskStartInput.value?.trim()) {
    //   start =
    //     dayjs(
    //       taskStartInput.value
    //         .replace(/(\d+)(th|st|nd|rd)/gi, "$1")
    //         .replace(/\bof\b/gi, "")
    //         .trim()
    //     ).toISOString() || Date.now()
    // }
    if (taskEndInput.value?.trim()) {
      end = dayjs(
        taskEndInput.value
          .replace(/(\d+)(th|st|nd|rd)/gi, "$1")
          .replace(/\bof\b/gi, "")
          .trim()
      ).toISOString()
    }
    axios
      .post("/api/create-task", {
        id: currentProject.value.id,
        description: taskDescriptionInput,
        icon: taskIconInput,
        name: taskNameInput,
        start: taskStartInput.value,
        end
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
}
const createResource = () => {
  if (
    createResourceShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !editResourceShown.value
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
const displayTime = (date, end) => {
  const hoursDifference = dayjs(date).diff(dayjs(), "hour")
  if (dayjs(date) > dayjs()) {
    if (hoursDifference > 24) {
      if (end) {
        return `Ends on ${dayjs(date).format("DD/MM/YYYY HH:mm:ss")}`
      } else {
        return `Starts on ${dayjs(date).format("DD/MM/YYYY HH:mm:ss")}`
      }
    } else {
      if (end) {
        return `Ends in ${dayjs(date).fromNow(true)}`
      } else {
        return `Starts in ${dayjs(date).fromNow(true)}`
      }
    }
  } else if (!end && dayjs(end) > dayjs()) {
    return "Currently Occurring"
  } else {
    return "Project is complete"
  }
}
async function getProject(id) {
  await axios
    .get(`/api/project/${id}`)
    .then((res) => {
      currentProject.value = res.data.project
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
