<template>
    <v-container fluid>
        <h2>Admin Dashboard</h2>

        <v-row>
            <v-col cols="12" lg="8" md="8" sm="12">
                <UsersTable />
            </v-col>
            <v-col cols="12" lg="4" md="4" sm="12">
                <UserStats />
            </v-col>
            <!-- <v-col cols="12" lg="4" md="4" sm="12">
                <InventoryStats />
            </v-col> -->
        </v-row>

    </v-container>
</template>

<script>
// import InventoryStats from '@/components/InventoryStats.vue';
import UsersTable from '@/components/UsersTable.vue';
import UserStats from '@/components/UserStats.vue';
export default {
    name: 'Dashboard',

    components: {
        UsersTable,
        UserStats,
        // InventoryStats
    },

    data: () => ({}),

    methods: {}
}
</script>

<style>

</style>