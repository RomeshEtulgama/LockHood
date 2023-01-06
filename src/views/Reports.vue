<template>
    <v-container fluid>
        <h2>Reports</h2>
        <InventoryReport />
        <OrderReport />
    </v-container>
</template>

<script>
import InventoryReport from '../components/InventoryReport.vue'
import OrderReport from '../components/OrderReport.vue'

export default {
    name: 'Reports',

    components: {
        InventoryReport,
        OrderReport,
    },

    data: () => ({
        products: null,
        rawItems: null,
    }),

    methods: {},
    async mounted() {
    }
}
</script>

<style>

</style>