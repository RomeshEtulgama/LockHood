import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '@/firebase'
import { ref, onChildChanged } from "firebase/database";
import * as fb from '@/firebase'

Vue.config.productionTip = false

const createVueInstance = () => {

  const user = auth.currentUser;

  if (user) {
    // User is signed in.
    onChildChanged(ref(fb.rtd, 'users/' + user.uid), createVueInstance);
  }

  new Vue({
    store,
    router,
    vuetify,
    render: h => h(App)
  }).$mount('#app')
}

onAuthStateChanged(auth, createVueInstance);
