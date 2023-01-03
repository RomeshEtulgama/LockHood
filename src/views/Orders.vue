<template>
    <v-container fluid>
        <h2>Orders</h2>

        <v-row>
            <v-col cols="12" lg="12" md="12" sm="12">
                <OrdersTable />
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import OrdersTable from '@/components/OrdersTable.vue';
export default {
    name: 'Orders',

    components: {
        OrdersTable,
    },

    data: () => ({}),

    methods: {}
}
</script>

<style>

</style>