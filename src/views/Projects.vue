<template>
  <transition>
    <modal
      v-if="createShown && !store.quickSwitcherShown"
      :is-active="createShown && !store.quickSwitcherShown"
      @close="
        ;(createShown = false),
          (projectNameInput = ''),
          (projectDescriptionInput = ''),
          (projectIconInput = '')
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Create New Project</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="project-name">Project name</label>
          </div>
          <input
            id="project-name"
            v-model="projectNameInput"
            placeholder="Project name"
            class="modal-input"
            @keydown.enter="createProject"
          />
          <div class="text-small">
            <label for="project-description">Project description</label>
          </div>
          <input
            id="project-description"
            v-model="projectDescriptionInput"
            placeholder="Project description"
            class="modal-input"
            @keydown.enter="createProject"
          />
          <div class="text-small">
            <label for="project-background">Project background image</label>
          </div>
          <input
            id="project-background"
            v-model="projectIconInput"
            placeholder="Project background image"
            class="modal-input"
            @keydown.enter="createProject"
          />
        </div>
        <div class="text-small">
          <label for="add-user">Add a user</label>
        </div>
        <input
          id="add-user"
          v-model="projectUserInput"
          placeholder="Add a user"
          class="modal-input"
          @keydown.enter="projectUserEnter"
        />
        <button @click="createProject">Create</button>
      </div>
    </modal>
  </transition>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">Projects</p>
      <p class="title-sub">Your projects</p>
      <div class="spacer" />
      <div class="menu-section">
        <div class="box">
          <div class="project-item" @click="createShown = true">
            <img
              src="https://i.electrics01.com/i/d81dabf74c88.png"
              alt="Create a new project"
              class="grid-image"
            />
            <div class="small-container">
              <p class="text-medium">Create a New Project</p>
              <div class="spacer" />
              <p class="text-medium-grey">
                Create a New Planit Project, Customise Permissions, Add Graphs
              </p>
            </div>
          </div>
        </div>
        <div
          v-for="(project, index) in store.userData.projects"
          :id="'project-' + index"
          :key="project.id"
          class="box"
        >
          <router-link class="project-item" :to="`/projects/${project.id}`">
            <img
              src="https://i.electrics01.com/i/d81dabf74c88.png"
              alt="Create a new project"
              class="grid-image"
            />
            <div class="small-container">
              <p class="text-medium">
                {{ project.name }}
              </p>
              <div class="spacer" />
              <p class="text-medium-grey">{{ project.description }}</p>
              <div class="date-container">
                <p class="text-medium-grey">
                  Next task: {{ displayTime(project.latest, false) }}
                </p>
                <p class="text-medium-grey">
                  Last task: {{ displayTime(project.end, true) }}
                </p>
              </div>
            </div>
          </router-link>
        </div>
      </div>
      <p class="title-sub">Shared with you</p>
      <div class="spacer" />
      <div class="menu-section">
        <p v-if="!store.userData.projects?.length">
          You don't have any projects shared with you
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Modal from "../components/Modal.vue"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useRouter } from "vue-router"
import axios from "axios"
import { useDataStore } from "../store.js"
import { ref } from "vue"

const router = useRouter()
const store = useDataStore()

const createShown = ref(false)
const projectUserInput = ref("")

let projectNameInput
let projectDescriptionInput
let projectIconInput
let projectUsers = []

dayjs.extend(relativeTime)

if (!localStorage.getItem("token")) {
  router.push("/login")
}

const createProject = () => {
  axios
    .post("/api/create-project", {
      description: projectDescriptionInput,
      icon: projectIconInput,
      name: projectNameInput
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
const projectUserEnter = async () => {
  const userId = await getUserByName(projectUserInput.value)
  projectUserInput.value = ""
  if (projectUsers.indexOf(userId.id) === -1) {
    projectUsers.push(userId.id)
  } else {
    store.error = "This user is already apart of this group"
    setTimeout(store.errorFalse, 2500)
  }
}
const getUserByName = async (username) => {
  try {
    const response = await axios.post("/api/get-user", {
      username
    })
    return response.data
  } catch (e) {
    store.error = e.response?.data || e.message
    setTimeout(store.errorFalse, 5000)
  }
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
</script>
