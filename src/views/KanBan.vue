<template>
    <v-container fluid>
        <h2>KanBan</h2>

        <v-row>
            <v-col cols="12" lg="6" md="12" sm="12">
                <PendingOrders />
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12" lg="12" md="12" sm="12">
                <AcceptedOrders />
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import PendingOrders from '@/components/PendingOrders.vue';
import AcceptedOrders from '@/components/AcceptedOrders.vue';
export default {
    name: 'KanBan',

    components: {
        PendingOrders,
        AcceptedOrders,
    },

    data: () => ({}),

    methods: {}
}
</script>

<style>

</style>