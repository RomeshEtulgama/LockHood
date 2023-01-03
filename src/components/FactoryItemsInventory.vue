<template>
    <v-card>
        <v-card-title>
            Factory Items
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
        </v-card-title>
        <v-data-table :headers="headers" :items="users" :items-per-page="5" :search="search" class="elevation-1">
            <template v-slot:[`item.class`]="{ item }">
                <v-select :items="userClasses" v-model="item.class" solo dense hide-details
                    style="max-width: 150px !important" @change="changeUserClass(item)"></v-select>
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
            headers: [
                { text: 'Item Name', value: 'itemName' },
                { text: 'Quantity', value: 'quantity' },
            ],
            users: [],
            userClasses: ['Admin', 'Employee', 'HR', 'Supervisor'],
            search: ""
        }
    },

    methods: {
        async approveUser(user) {
            await fb.approveUser(user.uid)
            await this.refreshUsers()
        },

        async disapproveUser(user) {
            await fb.disapproveUser(user.uid)
            await this.refreshUsers()
        },

        async changeUserClass(user) {
            await fb.changeUserClass(user.uid, user.class)
            await this.refreshUsers()
        },

        async refreshUsers() {
            this.users = await fb.getUsers()
        }
    },

    async mounted() {
        await this.refreshUsers()
    }
}
</script>

<style>

</style>