<template>
    <v-container fluid>
        <h2>Inventory</h2>

        <v-row>
            <v-col cols="12" lg="5" md="6" sm="12">
                <RawItems />
            </v-col>
            <v-col cols="12" lg="7" md="6" sm="12">
                <FactoryItems />
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import RawItems from '@/components/RawItemsInventory.vue';
import FactoryItems from '@/components/FactoryItemsInventory.vue';
export default {
    name: 'Inventory',

    components: {
        RawItems,
        FactoryItems
    },

    data: () => ({}),

    methods: {}
}
</script>

<style>

</style>