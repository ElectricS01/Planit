<template>
  <transition>
    <modal
      v-if="
        createShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createResourceShown &&
        !editResourceShown
      "
      :is-active="
        createShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
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
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-description">Task description</label>
          </div>
          <input
            id="task-description"
            v-model="taskDescriptionInput"
            placeholder="Task description"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-background">Task background image</label>
          </div>
          <input
            id="task-background"
            v-model="taskIconInput"
            placeholder="Task background URL"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-start">Task start date</label>
          </div>
          <input
            id="task-start"
            v-model="taskStartInput"
            placeholder="Task start date"
            @keydown.enter="createTask"
          />
          <div class="text-small">
            <label for="task-end">Task end date</label>
          </div>
          <input
            id="task-end"
            v-model="taskEndInput"
            placeholder="Task end date"
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
        editShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !createShown &&
        !createResourceShown &&
        !editResourceShown
      "
      :is-active="
        editShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !createShown &&
        !createResourceShown &&
        !editResourceShown
      "
      @close="
        ;(editShown = false),
          (taskNameInput = ''),
          (taskDescriptionInput = ''),
          (taskIconInput = ''),
          (taskStartInput = ''),
          (taskEndInput = '')
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Edit {{ editingTask.name }}</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="task-name">Task name</label>
          </div>
          <input
            id="task-name"
            v-model="taskNameInput"
            placeholder="Task name"
            @keydown.enter="editTask"
          />
          <div class="text-small">
            <label for="task-description">Task description</label>
          </div>
          <input
            id="task-description"
            v-model="taskDescriptionInput"
            placeholder="Task description"
            @keydown.enter="editTask"
          />
          <div class="text-small">
            <label for="task-background">Task background image</label>
          </div>
          <input
            id="task-background"
            v-model="taskIconInput"
            placeholder="Task background URL"
            @keydown.enter="editTask"
          />
          <div class="text-small">
            <label for="task-start">Task start date</label>
          </div>
          <input
            id="task-start"
            v-model="taskStartInput"
            placeholder="Task start date"
            @keydown.enter="editTask"
          />
          <div class="text-small">
            <label for="task-end">Task end date</label>
          </div>
          <input
            id="task-end"
            v-model="taskEndInput"
            placeholder="Task end date"
            @keydown.enter="editTask"
          />
        </div>
        <button @click="editTask">Edit</button>
      </div>
    </modal>
  </transition>
  <transition>
    <modal
      v-if="
        createResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createShown &&
        !editResourceShown
      "
      :is-active="
        createResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createShown &&
        !editResourceShown
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
            @keydown.enter="createResource"
          />
          <div class="text-small">
            <label for="task-description">Resource description</label>
          </div>
          <input
            id="task-description"
            v-model="resourceDescriptionInput"
            placeholder="Task description"
            @keydown.enter="createResource"
          />
          <div class="text-small">
            <label for="task-background">Resource background image</label>
          </div>
          <input
            id="task-background"
            v-model="resourceIconInput"
            placeholder="Task background URL"
            @keydown.enter="createResource"
          />
        </div>
        <button @click="createResource">Create</button>
      </div>
    </modal>
  </transition>
  <transition>
    <modal
      v-if="
        editResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createShown &&
        !createResourceShown
      "
      :is-active="
        editResourceShown &&
        !store.quickSwitcherShown &&
        !store.notificationsShown &&
        !editShown &&
        !createShown &&
        !createResourceShown
      "
      @close="
        ;(editResourceShown = false),
          (resourceNameInput = ''),
          (resourceDescriptionInput = ''),
          (resourceIconInput = '')
      "
    >
      <div class="modal-menu">
        <div class="selector">
          <p>Edit {{ editingResource.name }}</p>
        </div>
        <div>
          <div class="text-small">
            <label class="text-small" for="task-name">Resource name</label>
          </div>
          <input
            id="task-name"
            v-model="resourceNameInput"
            placeholder="Task name"
            @keydown.enter="editResource"
          />
          <div class="text-small">
            <label for="task-description">Resource description</label>
          </div>
          <input
            id="task-description"
            v-model="resourceDescriptionInput"
            placeholder="Task description"
            @keydown.enter="editResource"
          />
          <div class="text-small">
            <label for="task-background">Resource background image</label>
          </div>
          <input
            id="task-background"
            v-model="resourceIconInput"
            placeholder="Task background URL"
            @keydown.enter="editResource"
          />
        </div>
        <button @click="editResource">Edit</button>
      </div>
    </modal>
  </transition>
  <div class="container-flex">
    <div class="menu">
      <p class="title-menu">{{ currentProject?.name }}</p>
      <p class="title-sub">Tasks</p>
      <div class="spacer" />
      <div v-if="!loadingProject" class="menu-section">
        <div class="toggle-container">
          <p>Filters:</p>
          <div class="checkbox-container">
            <input
              type="checkbox"
              id="pending"
              :checked="pendingTasks"
              @click="toggle('pending')"
            />
            <label for="pending">Pending</label>
          </div>
          <div class="checkbox-container">
            <input
              type="checkbox"
              id="ongoing"
              :checked="ongoingTasks"
              @click="toggle('ongoing')"
            />
            <label for="ongoing">Ongoing</label>
          </div>
          <div class="checkbox-container">
            <input
              type="checkbox"
              id="complete"
              :checked="completedTasks"
              @click="toggle('complete')"
            />
            <label for="complete">Complete</label>
          </div>
          <div class="checkbox-container">
            <input
              type="checkbox"
              id="hidden"
              :checked="hiddenTasks"
              @click="toggle('hidden')"
            />
            <label for="hidden">Hidden</label>
          </div>
        </div>
        <div
          v-if="
            currentProject.permissions.find(
              (permissions) => permissions.userId === store.userData.id
            )?.type !== 2
          "
          class="task-item"
          @click="(createShown = true), (typeOpen = -1), (addOpen = -1)"
        >
          <div class="task-sub">
            <img
              src="https://i.electrics01.com/i/55bae440a2b3.png"
              alt="Create a new task"
              class="task-image"
            />
            <p class="text-medium">Create a New Task</p>
          </div>
          <div class="task-container">
            <p class="text-medium-grey">
              Create a New Planit Task, Customise Description, Add Resources
            </p>
          </div>
        </div>
        <p v-if="!currentProject.tasks?.length">This project has no tasks</p>
        <p v-else-if="!currentTasks?.length">No tasks match your filters</p>
        <div
          v-for="(task, index) in currentTasks"
          :id="'task-' + index"
          :key="task.id"
          class="task-item"
          @click.self="
            (editShown = true),
              (typeOpen = -1),
              (addOpen = -1),
              (editingTask = task),
              (taskNameInput = task.name),
              (taskDescriptionInput = task.description),
              (taskIconInput = task.icon),
              (taskStartInput = dayjs(task.startAt).format('DD/MM/YYYY')),
              (taskEndInput = dayjs(task.dueAt).format('DD/MM/YYYY'))
          "
        >
          <div class="task-sub">
            <img
              :src="task.icon || 'https://i.electrics01.com/i/55bae440a2b3.png'"
              alt="Task background"
              class="task-image"
            />
            <p class="text-medium">
              {{ task.name }}
            </p>
          </div>
          <div class="task-container">
            <p class="text-medium-grey">{{ task.description }}</p>
            <div class="date-container">
              <p class="text-medium-grey" style="margin-right: 8px">
                {{ displayTime(task.startAt, false) }}
              </p>
              <p class="text-medium-grey">
                {{ displayTime(task.dueAt, true) }}
              </p>
            </div>
          </div>
          <div class="task-sub">
            <p v-if="task.resources.length">Resources:</p>
            <div v-for="resource in task.resources">
              <button
                @click="
                  removeResource(resource.resourceId, resource.id, task.id)
                "
              >
                {{
                  currentProject.resources.find(
                    (res) => res.id === resource.resourceId
                  ).name
                }}
              </button>
            </div>
            <div
              class="dropdown"
              v-if="
                currentProject.permissions.find(
                  (permissions) => permissions.userId === store.userData.id
                )?.type !== 2
              "
            >
              <div
                class="dropdown-toggle"
                @click.stop="
                  (addOpen = addOpen === index ? -1 : index), (typeOpen = -1)
                "
              >
                Add
              </div>
              <ul v-if="addOpen === index" class="dropdown-menu">
                <input />
                <li
                  v-for="(option, index) in currentProject.resources"
                  :key="option"
                  @click.stop="addResource(task.id, option.id)"
                >
                  {{ option.name }}
                </li>
              </ul>
            </div>
          </div>
          <div class="dropdown-fixed">
            <div
              class="dropdown-toggle"
              @click.stop="
                (typeOpen = typeOpen === index ? -1 : index), (addOpen = -1)
              "
              v-if="
                currentProject.permissions.find(
                  (permissions) => permissions.userId === store.userData.id
                )?.type !== 2
              "
            >
              {{ typeOptions[task.type] }}
            </div>
            <p v-else>{{ typeOptions[task.type] }}</p>
            <ul v-if="typeOpen === index" class="dropdown-menu">
              <li
                v-for="(option, index) in typeOptions"
                :key="option"
                @click.stop="changeType(task, index)"
              >
                {{ option }}
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-else class="menu-section">
        <div class="center">
          <div style="text-align: center" class="loader" />
        </div>
      </div>
      <p class="title-sub">Resources</p>
      <div class="spacer" />
      <div v-if="!loadingProject" class="menu-section">
        <div
          v-if="
            currentProject.permissions.find(
              (permissions) => permissions.userId === store.userData.id
            )?.type !== 2
          "
          class="task-item"
          @click="(createResourceShown = true), (typeOpen = -1), (addOpen = -1)"
        >
          <div class="task-sub">
            <img
              src="https://i.electrics01.com/i/124bd47c48c7.png"
              alt="Create a new resource"
              class="task-image"
            />
            <p class="text-medium">Create a New Resource</p>
          </div>
          <div class="task-container">
            <p class="text-medium-grey">
              Create a New Planit Resource, Customise Name and Description
            </p>
          </div>
        </div>
        <p v-if="!currentProject.resources?.length">
          This project has no resources
        </p>
        <div
          v-for="(resource, index) in currentProject.resources"
          :id="'resource-' + index"
          :key="resource.id"
          class="task-item"
          @click="
            (editResourceShown = true),
              (typeOpen = -1),
              (addOpen = -1),
              (editingResource = resource),
              (resourceNameInput = resource.name),
              (resourceDescriptionInput = resource.description),
              (resourceIconInput = resource.icon)
          "
        >
          <div class="task-sub">
            <img
              :src="
                resource.icon || 'https://i.electrics01.com/i/124bd47c48c7.png'
              "
              alt="Resource background"
              class="task-image"
            />
            <p class="text-medium">
              {{ resource.name }}
            </p>
          </div>
          <div class="task-container">
            <p class="text-medium-grey">{{ resource.description }}</p>
          </div>
        </div>
      </div>
      <div v-else class="menu-section">
        <div class="center">
          <div style="text-align: center" class="loader" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Modal from "../components/Modal.vue"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import localizedFormat from "dayjs/plugin/localizedFormat"
import { useRouter, useRoute } from "vue-router"
import axios from "axios"
import { useDataStore } from "../store.js"
import { ref, onMounted, computed } from "vue"

const route = useRoute()
const router = useRouter()
const store = useDataStore()

const createShown = ref(false)
const editShown = ref(false)
const createResourceShown = ref(false)
const editResourceShown = ref(false)
const currentProject = ref({})
const editingTask = ref({})
const editingResource = ref({})
const loadingProject = ref(true)
const typeOpen = ref(-1)
const addOpen = ref(-1)

const pendingTasks = ref(true)
const ongoingTasks = ref(true)
const completedTasks = ref(false)
const hiddenTasks = ref(false)

const taskStartInput = ref("")
const taskEndInput = ref("")

let taskNameInput
let taskDescriptionInput
let taskIconInput
let resourceNameInput
let resourceDescriptionInput
let resourceIconInput

const typeOptions = ["hidden", "complete", "open"]

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)

if (!localStorage.getItem("token")) {
  router.push("/login")
}

const currentTasks = computed(() =>
  currentProject.value.tasks.filter(
    (task) =>
      (task.type === 2 &&
        pendingTasks.value &&
        dayjs(task.startAt) > dayjs()) ||
      (task.type === 2 &&
        ongoingTasks.value &&
        dayjs(task.startAt) < dayjs()) ||
      (task.type === 1 && completedTasks.value) ||
      (task.type === 0 && hiddenTasks.value)
  )
)

const addResource = (taskId, resourceId) => {
  axios
    .post("/api/add-resource", {
      id: currentProject.value.id,
      resourceId,
      taskId
    })
    .then((res) => {
      currentProject.value.tasks[
        currentProject.value.tasks.indexOf(
          currentProject.value.tasks.find((task) => task.id === taskId)
        )
      ].resources.push(res.data.association)
      typeOpen.value = -1
      addOpen.value = -1
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
const removeResource = (resourceId, associationId, taskId) => {
  axios
    .post("/api/remove-resource", {
      id: currentProject.value.id,
      resourceId,
      associationId
    })
    .then((res) => {
      currentProject.value.tasks[
        currentProject.value.tasks.indexOf(
          currentProject.value.tasks.find((task) => task.id === taskId)
        )
      ].resources = currentProject.value.tasks[
        currentProject.value.tasks.indexOf(
          currentProject.value.tasks.find((task) => task.id === taskId)
        )
      ].resources.filter((resource) => resource.id !== associationId)
      typeOpen.value = -1
      addOpen.value = -1
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
const changeType = (task, type) => {
  axios
    .patch("/api/edit-task", {
      id: task.id,
      projectId: currentProject.value.id,
      description: task.description,
      icon: task.icon,
      name: task.name,
      start: task.startAt,
      end: task.endAt,
      type
    })
    .then((res) => {
      currentProject.value.tasks[
        currentProject.value.tasks.indexOf(
          currentProject.value.tasks.find(
            (task) => task.id === res.data.task.id
          )
        )
      ] = res.data.task
      typeOpen.value = -1
      addOpen.value = -1
    })
    .catch((e) => {
      store.error = e.response?.data || e.message
      setTimeout(store.errorFalse, 5000)
    })
}
const toggle = (type) => {
  typeOpen.value = -1
  addOpen.value = -1
  if (type === "pending") {
    pendingTasks.value = !pendingTasks.value
  } else if (type === "ongoing") {
    ongoingTasks.value = !ongoingTasks.value
  } else if (type === "complete") {
    completedTasks.value = !completedTasks.value
  } else if (type === "hidden") {
    hiddenTasks.value = !hiddenTasks.value
  }
}
const editTask = () => {
  let start
  let end

  if (taskStartInput.value?.trim()) {
    start =
      dayjs(
        taskStartInput.value
          .replace(/(\d+)(th|st|nd|rd)/gi, "$1")
          .replace(/\bof\b/gi, "")
          .trim()
      ).toISOString() || Date.now()
  }
  if (taskEndInput.value?.trim()) {
    end = dayjs(
      taskEndInput.value
        .replace(/(\d+)(th|st|nd|rd)/gi, "$1")
        .replace(/\bof\b/gi, "")
        .trim()
    ).toISOString()
  }
  if (
    editShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !createShown.value
  )
    axios
      .patch("/api/edit-task", {
        id: editingTask.value.id,
        projectId: currentProject.value.id,
        description: taskDescriptionInput,
        icon: taskIconInput,
        name: taskNameInput,
        start,
        end
      })
      .then((res) => {
        currentProject.value.tasks[
          currentProject.value.tasks.indexOf(
            currentProject.value.tasks.find(
              (task) => task.id === res.data.task.id
            )
          )
        ] = res.data.task
        editShown.value = false
        taskNameInput = ""
        taskDescriptionInput = ""
        taskIconInput = ""
        taskStartInput.value = ""
        taskEndInput.value = ""
        editingTask.value = {}
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
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

    if (taskStartInput.value?.trim()) {
      if (!dayjs(taskStartInput.value.trim()).isValid()) {
        store.error = "Invalid date"
        setTimeout(store.errorFalse, 5000)
        return
      }
      start =
        dayjs(
          taskStartInput.value
            .replace(/(\d+)(th|st|nd|rd)/gi, "$1")
            .replace(/\bof\b/gi, "")
            .trim()
        ).toISOString() || Date.now()
    }
    if (taskEndInput.value?.trim()) {
      if (!dayjs(taskEndInput.value.trim()).isValid()) {
        store.error = "Invalid date"
        setTimeout(store.errorFalse, 5000)
        return
      }
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
        start,
        end
      })
      .then((res) => {
        currentProject.value.tasks.push(res.data.task)
        createShown.value = false
        taskNameInput = ""
        taskDescriptionInput = ""
        taskIconInput = ""
        taskStartInput.value = ""
        taskEndInput.value = ""
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
  }
}
const editResource = () => {
  if (
    editResourceShown.value &&
    !store.quickSwitcherShown &&
    !store.notificationsShown &&
    !createResourceShown.value
  )
    axios
      .patch("/api/edit-resource", {
        id: editingResource.value.id,
        projectId: currentProject.value.id,
        description: resourceDescriptionInput,
        icon: resourceIconInput,
        name: resourceNameInput
      })
      .then((res) => {
        currentProject.value.resources[
          currentProject.value.resources.indexOf(
            currentProject.value.resources.find(
              (task) => task.id === res.data.resource.id
            )
          )
        ] = res.data.resource
        editResourceShown.value = false
        resourceNameInput = ""
        resourceDescriptionInput = ""
        resourceIconInput = ""
        editingResource.value = {}
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
        currentProject.value.resources.push(res.data.resource)
        createResourceShown.value = false
      })
      .catch((e) => {
        store.error = e.response?.data || e.message
        setTimeout(store.errorFalse, 5000)
      })
}
const displayTime = (date, end) => {
  if (!date) return "No due date"
  const hoursDifference = dayjs(date).diff(dayjs(), "hour")
  if (dayjs(date) > dayjs()) {
    if (hoursDifference > 24) {
      if (end) {
        return `Ends on ${dayjs(date).format("DD/MM/YYYY")}`
      } else {
        return `Starts on ${dayjs(date).format("DD/MM/YYYY")}`
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
    return `Task started on ${dayjs(date).format("DD/MM/YYYY")}`
  }
}
async function getProject(id) {
  await axios
    .get(`/api/project/${id}`)
    .then((res) => {
      currentProject.value = res.data.project
      currentProject.value.messages.focus = false
      loadingProject.value = false
    })
    .catch((e) => {
      if (e.response?.status === 400 || e.response?.status === 401) {
        router.push("/projects")
      } else {
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
