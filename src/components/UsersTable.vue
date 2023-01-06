<template>
    <v-card :loading="loading">
        <v-card-title>
            Employee Management
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="users" :items-per-page="5" :search="search" class="elevation-1">
            <template v-slot:[`item.class`]="{ item }">
                <v-select :items="userClasses" v-model="item.class" solo dense hide-details
                    style="max-width: 150px !important" @change="changeUserClass(item)" :rules="[
                        () =>
                            !!item.class || 'User class is required',
                    ]" required></v-select>
                <v-snackbar v-model="snackbar" :timeout="timeout">
                    Please select the user class.
                </v-snackbar>
            </template>
            <template v-slot:[`item.approved`]="{ item }">
                <v-btn v-if="item.approved" x-small @click="disapproveUser(item)">Disapprove</v-btn>
                <v-btn v-else color="green" x-small @click="approveUser(item)">Approve</v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import * as fb from '@/firebase'

export default {
    data() {
        return {
            loading: true,
            headers: [
                { text: 'Display Name', value: 'displayName' },
                { text: 'Email', value: 'email' },
                { text: 'Class', value: 'class' },
                { text: 'Approved', value: 'approved' },
            ],
            users: [],
            userClasses: ['Admin', 'Employee', 'HR', 'Supervisor'],
            search: "",

            snackbar: false,
            timeout: 3000,
        }
    },

    computed: {},

    methods: {
        async approveUser(user) {
            this.loading = true
            if (user.class)
                await fb.approveUser(user.uid)
            else
                this.snackbar = true
            await this.refreshUsers()
            this.loading = false
        },

        async disapproveUser(user) {
            this.loading = true
            await fb.disapproveUser(user.uid)
            await this.refreshUsers()
            this.loading = false
        },

        async changeUserClass(user) {
            this.loading = true
            await fb.changeUserClass(user.uid, user.class)
            await this.refreshUsers()
            this.loading = false
        },

        async refreshUsers() {
            this.loading = true
            this.users = await fb.getUsers()
            this.loading = false
        }
    },

    async mounted() {
        await this.refreshUsers()
    }
}
</script>

<style>

</style>