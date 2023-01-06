<template>
    <v-container fluid>
        <h2>Reports</h2>
        {{ rawItems? rawItems: "" }}
    </v-container>
</template>

<script>
import * as fb from '@/firebase'

export default {
    name: 'Reports',

    components: {
    },

    data: () => ({
        rawItems: null
    }),

    methods: {

    },

    async mounted() {
        this.rawItems = await fb.getFactoryItems()
    }
}
</script>

<style>

</style>