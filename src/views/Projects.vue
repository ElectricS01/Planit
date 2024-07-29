<template>
  <Transition>
    <modal
      v-if="
        createShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      :is-active="
        createShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      @close="
        ;(createShown = false),
          (projectNameInput = ''),
          (projectDescriptionInput = ''),
          (projectIconInput = ''),
          (projectUsers = [])
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
        <div
          v-for="(user, index) in projectUsers"
          :key="user.type"
          class="switcher-item"
        >
          {{ user.user.username }}
          <button @click="swapPermission(index)">
            {{ user.type === 2 ? "Viewer" : "Editor" }}
          </button>
          <button @click="removePermission(index)">Remove</button>
        </div>
        <button @click="createProject">Create</button>
      </div>
    </modal>
  </Transition>
  <Transition>
    <modal
      v-if="
        editShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !deleteShown
      "
      :is-active="
        editShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !deleteShown
      "
      @close="
        ;(editShown = false),
          (projectNameInput = ''),
          (projectDescriptionInput = ''),
          (projectIconInput = ''),
          (projectUsers = [])
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Edit {{ editingProject.name }}</p>
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
            @keydown.enter="editProject"
          />
          <div class="text-small">
            <label for="project-description">Project description</label>
          </div>
          <input
            id="project-description"
            v-model="projectDescriptionInput"
            placeholder="Project description"
            class="modal-input"
            @keydown.enter="editProject"
          />
          <div class="text-small">
            <label for="project-background">Project background image</label>
          </div>
          <input
            id="project-background"
            v-model="projectIconInput"
            placeholder="Project background image"
            class="modal-input"
            @keydown.enter="editProject"
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
        <div
          v-for="(user, index) in projectUsers"
          :key="user.type"
          class="switcher-item"
        >
          {{ user.user.username }}
          <button
            v-if="user.userId !== store.userData.id"
            @click="swapPermission(index)"
          >
            {{ user.type === 2 ? "Viewer" : "Editor" }}
          </button>
          <button
            v-if="user.userId !== store.userData.id"
            @click="removePermission(index)"
          >
            Remove
          </button>
        </div>
        <button @click="editProject">Save</button>
        <button
          v-if="editingProject.owner === store.userData.id"
          style="color: red"
          @click="deleteShown = true"
        >
          Delete
        </button>
      </div>
    </modal>
  </Transition>
  <Transition>
    <modal
      v-if="
        deleteShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      :is-active="
        deleteShown && !store.quickSwitcherShown && !store.notificationsShown
      "
      @close="deleteShown = false"
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Delete {{ editingProject.name }}</p>
        </div>
        <div>
          <div class="text-small">
            <label for="project-description">
              Enter your password to delete {{ editingProject.name }}
            </label>
          </div>
          <input
            id="project-description"
            v-model="password"
            placeholder="Password"
            class="modal-input"
            type="password"
            @keydown.enter="deleteProject"
          />
        </div>
        <button @click="deleteShown = false">Cancel</button>
        <button style="color: red" @click="deleteProject">Delete</button>
      </div>
    </modal>
  </Transition>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">Projects</p>
      <p class="title-sub">Your projects</p>
      <div class="spacer" />
      <div class="menu-section">
        <div class="menu-container" v-if="!store.loadingProjects">
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
            v-for="(project, index) in myProjects"
            :id="'project-' + index"
            :key="project.id"
            class="box"
          >
            <router-link class="project-item" :to="`/project/${project.id}`">
              <img
                :src="
                  project.icon || 'https://i.electrics01.com/i/d81dabf74c88.png'
                "
                alt="Project background"
                class="grid-image"
              />
              <div class="small-container">
                <div style="display: inline-flex">
                  <p class="text-medium">
                    {{ project.name }}
                  </p>
                  <icons
                    class="edit-button"
                    :size="16"
                    icon="edit"
                    @click.prevent="
                      (editShown = true),
                        (editingProject = project),
                        (projectNameInput = project.name),
                        (projectDescriptionInput = project.description),
                        (projectIconInput = project.icon),
                        (projectUsers = project.permissions.slice())
                    "
                  />
                </div>
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
        <div v-else class="center">
          <div style="text-align: center" class="loader" />
        </div>
      </div>
      <p class="title-sub">Shared with you</p>
      <div class="spacer" />
      <div class="menu-section">
        <div class="menu-container" v-if="!store.loadingProjects">
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
            v-for="(project, index) in sharedProjects"
            :id="'project-' + index"
            :key="project.id"
            class="box"
          >
            <router-link class="project-item" :to="`/project/${project.id}`">
              <img
                :src="
                  project.icon || 'https://i.electrics01.com/i/d81dabf74c88.png'
                "
                alt="Project background"
                class="grid-image"
              />
              <div class="small-container">
                <div style="display: inline-flex">
                  <p class="text-medium">
                    {{ project.name }}
                  </p>
                  <icons
                    class="edit-button"
                    :size="16"
                    icon="edit"
                    @click.prevent="
                      (editShown = true),
                        (editingProject = project),
                        (projectNameInput = project.name),
                        (projectDescriptionInput = project.description),
                        (projectIconInput = project.icon),
                        (projectUsers = project.permissions)
                    "
                  />
                </div>
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
        <div v-else class="center">
          <div style="text-align: center" class="loader" />
        </div>
        <p v-if="!store.userData.projects?.length">
          You don't have any projects shared with you
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Modal from "../components/Modal.vue"
import Icons from "../components/Icons.vue"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { useRouter } from "vue-router"
import axios from "axios"
import { useDataStore } from "../store.js"
import { computed, ref } from "vue"

const router = useRouter()
const store = useDataStore()

const createShown = ref(false)
const editShown = ref(false)
const deleteShown = ref(false)
const editingProject = ref({})
const projectUserInput = ref("")
const projectUsers = ref([])

let projectNameInput
let projectDescriptionInput
let projectIconInput
let password

dayjs.extend(relativeTime)

if (!localStorage.getItem("token")) {
  router.push("/login")
}

const swapPermission = (index) => {
  projectUsers.value[index].type = projectUsers.value[index].type === 1 ? 2 : 1
}
const removePermission = (index) => {
  projectUsers.value.splice(index, 1)
}
const deleteProject = () => {
  console.log(editingProject.value.id)
  axios
    .post("/api/delete-project", {
      id: editingProject.value.id,
      password
    })
    .then((res) => {
      store.userData.projects.splice(
        store.userData.projects.indexOf(
          store.userData.projects.find(
            (project) => project.id === editingProject.value.id
          )
        ),
        1
      )
      deleteShown.value = false
      editShown.value = false
      password = ""
      projectNameInput = ""
      projectDescriptionInput = ""
      projectIconInput = ""
      projectUsers.value = []
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
const editProject = () => {
  axios
    .patch("/api/edit-project", {
      id: editingProject.value.id,
      description: projectDescriptionInput,
      icon: projectIconInput,
      name: projectNameInput,
      users: projectUsers.value
    })
    .then((res) => {
      store.userData.projects[
        store.userData.projects.indexOf(
          store.userData.projects.find(
            (project) => project.id === res.data.project.id
          )
        )
      ] = res.data.project
      editShown.value = false
      projectNameInput = ""
      projectDescriptionInput = ""
      projectIconInput = ""
      projectUsers.value = []
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}

const createProject = () => {
  axios
    .post("/api/create-project", {
      description: projectDescriptionInput,
      icon: projectIconInput,
      name: projectNameInput,
      users: projectUsers.value
    })
    .then((res) => {
      store.userData.projects.push(res.data.project)
      store.sortProjects()
      router.push(`/project/${res.data.project.id}`)
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
const projectUserEnter = async () => {
  if (projectUserInput.value === store.userData.username) {
    store.error = "You cannot add yourself"
    setTimeout(store.errorFalse, 2500)
    projectUserInput.value = ""
    return
  }
  const userId = await getUserByName(projectUserInput.value)
  if (!userId) return
  if (projectUsers.value.find((user) => user.userId === userId.id)) {
    store.error = "This user is already apart of this group"
    setTimeout(store.errorFalse, 2500)
    projectUserInput.value = ""
    return
  }
  projectUsers.value.push({
    userId: userId.id,
    type: 2,
    user: { username: projectUserInput.value }
  })
  projectUserInput.value = ""
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

const myProjects = computed(() =>
  store.userData.projects.filter(
    (project) => project?.owner === store.userData.id
  )
)
const sharedProjects = computed(() =>
  store.userData.projects.filter(
    (project) => project?.owner !== store.userData.id
  )
)
</script>
