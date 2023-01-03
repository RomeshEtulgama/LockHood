<template>
    <v-container fluid>
        <h2>KanBan</h2>

        <v-row>
            <v-col cols="12" lg="5" md="6" sm="12">
                <RawItems />
            </v-col>
        </v-row>

    </v-container>
</template>

<script>
import RawItems from '@/components/RawItemsInventory.vue';
export default {
    name: 'KanBan',

    components: {
        RawItems,
    },

    data: () => ({}),

    methods: {}
}
</script>

<style>

</style>