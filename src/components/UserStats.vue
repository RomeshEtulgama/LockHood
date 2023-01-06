<template>
    <v-card>
        <v-card-title>User Stats</v-card-title>
        <v-card-text>
            <h3>You have</h3>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>{{ countByClass.Admin ? Number(countByClass.Admin) : 0 }}
                        Admins</v-list-item-title>
                </v-list-item-content>
                <v-list-item-content>
                    <v-list-item-title>{{ countByClass.HR ? Number(countByClass.HR) : 0 }}
                        HRs</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
            <v-list-item>
                <v-list-item-content>
                    <v-list-item-title>{{ countByClass.Supervisor ? Number(countByClass.Supervisor) : 0 }}
                        Supervisors</v-list-item-title>
                </v-list-item-content>
                <v-list-item-content>
                    <v-list-item-title>{{ countByClass.Employee ? Number(countByClass.Employee) : 0 }}
                        Employees</v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-card-text>
    </v-card>
</template>

<script>
import * as fb from '@/firebase'

export default {
    data() {
        return {
            users: null,
            countByClass: {
                Admin: 0, HR: 0,
                Supervisor: 0,
                Employee: 0,
            },
        }
    },

    methods: {
        setCounts() {
            const countByClass = this.users.reduce((counts, user) => {
                if (counts[user.class]) {
                    counts[user.class]++;
                } else {
                    counts[user.class] = 1;
                }
                return counts;
            }, {});

            return countByClass
        }
    },

    async mounted() {
        this.users = await fb.getUsers();
        this.countByClass = this.setCounts();
    }
}


</script>

<style>

</style> 