import { createRouter, createWebHistory } from "vue-router"

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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  document.title = to.meta?.title ?? "Planit Project Management"
})

export default router
