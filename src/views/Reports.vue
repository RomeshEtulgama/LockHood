<template>
    <v-container fluid>
        <h2>Reports</h2>
        <InventoryReport />
        <OrderReport />
        <EmployeePerformance />
    </v-container>
</template>

<script>
import EmployeePerformance from '@/components/EmployeePerformance.vue';
import InventoryReport from '../components/InventoryReport.vue'
import OrderReport from '../components/OrderReport.vue'

export default {
    name: 'Reports',

    components: {
        InventoryReport,
        OrderReport,
        EmployeePerformance
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