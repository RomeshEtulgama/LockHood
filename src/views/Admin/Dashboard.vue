<template>
    <v-container fluid>
        <h2>Admin Dashboard</h2>

        <v-row>
            <v-col cols="12" lg="8" md="8" sm="12">
                <UsersTable />
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import UsersTable from '@/components/UsersTable.vue';
export default {
    name: 'Dashboard',

    components: {
        UsersTable,
    },

    data: () => ({}),

    methods: {}
}
</script>

<style>

</style>