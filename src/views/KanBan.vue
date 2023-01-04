<template>
    <v-container fluid>
        <h2>KanBan</h2>

        <v-row>
            <v-col cols="12" lg="6" md="6" sm="12">
                <PendingOrders />
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import PendingOrders from '@/components/PendingOrders.vue';
export default {
    name: 'KanBan',

    components: {
        PendingOrders,
    },

    data: () => ({}),

    methods: {}
}
</script>

<style>

</style>