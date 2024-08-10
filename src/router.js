// Imports
import { createRouter, createWebHistory } from "vue-router"

// Define the routes, these are all Planit's pages, each page is associated with a .vue file
// some routes have a meta.title which is the title displayed in the tab bar of your browser
const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("./views/Home.vue")
  },
  {
    path: "/home",
    redirect: "/"
  },
  {
    component: () => import("./views/Login.vue"),
    name: "login",
    path: "/login",
    meta: {
      title: "Login To Planit"
    }
  },
  {
    component: () => import("./views/Register.vue"),
    name: "register",
    path: "/register",
    meta: {
      title: "Register To Planit"
    }
  },
  {
    component: () => import("./views/Verify.vue"),
    name: "verify",
    path: "/verify",
    meta: {
      title: "Verify Your Planit Account"
    }
  },
  {
    path: "/about",
    name: "about",
    component: () => import("./views/About.vue"),
    meta: {
      title: "About Planit"
    }
  },
  {
    path: "/projects",
    name: "projects",
    component: () => import("./views/Projects.vue"),
    meta: {
      title: "Planit Projects"
    }
  },
  {
    path: "/project/:id",
    name: "project",
    component: () => import("./views/Planner.vue"),
    meta: {
      title: "Planit Project"
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: () => import("./views/404.vue"),
    meta: {
      title: "404: Page Not Found"
    }
  }
]

// Create the router to be exported to main.js
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// When the route changes, update the title in the borwser tab bar
router.beforeEach((to) => {
  document.title = to.meta?.title ?? "Planit Project Management"
})

// Export the router to be used in main.js
export default router
