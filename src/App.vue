<template>
  <v-app v-if="user && user.approved">
    <!-- <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <h2>Lock Hood Admin</h2>
      </div>

      <v-spacer></v-spacer>
      <v-avatar size="35" class="mx-4">
        <v-img :src="user.photoURL" />
      </v-avatar>
      <span>
        {{ user.displayName }}
        <br />
        <v-btn @click="logout" class="text-caption" x-small>
          Logout
        </v-btn>
      </span>
    </v-app-bar> -->

    <v-navigation-drawer class="deep-purple accent-4" permanent expand-on-hover dark mini-variant app>

      <v-list>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-img :src="user.photoURL"></v-img>
          </v-list-item-avatar>
        </v-list-item>

        <v-list-item link>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              {{ user.displayName }}
            </v-list-item-title>
            <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-list-item v-for="item in items" :key="item.title" router :to="item.route">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-3">
          <v-btn block rounded large @click="logout">
            <v-icon left>
              mdi-logout
            </v-icon>
            Logout
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>
  </v-app>

  <v-app v-else>
    <login />
    <v-snackbar v-model="signedInNotApproved" color="red accent-2">
      User is not approved, please contact the administrator.
    </v-snackbar>
  </v-app>
</template>

<script>
import * as fb from '@/firebase'
import { getAuth, signOut } from "@firebase/auth";

import login from "@/views/Login.vue"
// import NotAuthorized from "@/views/NotAuthorized"

export default {
  name: 'App',

  components: {
    login,
    // NotAuthorized
  },

  data: () => ({
    user: null,

    items: [
      { title: "Dashboard", icon: "mdi-view-dashboard", route: "/" },
    ],
  }),

  methods: {
    logout() {
      signOut(getAuth())
    }
  },

  computed: {
    signedInNotApproved: {
      get: function () {
        var notApproved = false
        if (this.user) {
          if (!this.user.approved)
            notApproved = true
        }
        return notApproved
      },

      set: function () {

      }
    }
  },

  async beforeCreate() {
    this.user = await fb.getUser()
  },
};
</script>
