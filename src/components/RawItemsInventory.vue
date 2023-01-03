<template>
    <v-card>
        <v-card-title>
            Raw Items
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="400px">
                <template v-slot:activator="{ on, attrs }">
                    <!-- Add New Item -->
                    <v-btn color="success" dark v-bind="attrs" v-on="on" class="mx-2" small>
                        Add Item
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Add Item</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <!-- Basic Details -->
                            <v-form ref="form" v-model="valid" lazy-validation>
                                <v-row>
                                    <!-- Name -->
                                    <v-col cols="12" sm="6" md="8" lg="8">
                                        <v-text-field v-model="item_info.itemName" label="Item Name" :rules="[
    () =>
        !!item_info.itemName || 'Item Name is required',
]" required></v-text-field>
                                    </v-col>
                                    <!-- Address -->
                                    <v-col cols="12" sm="6" md="4" lg="4">
                                        <v-text-field type="number" v-model="item_info.quantity" label="Quantity"
                                            :rules="[
    () =>
        !!item_info.quantity ||
        'Item Quantity is required',
]" required></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                        <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-btn class="mx-2" icon @click="refreshItems">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </v-card-title>
        <v-data-table :headers="headers" :items="items" :items-per-page="5" :search="search" class="elevation-1" dense>
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn class="error" x-small @click="deleteItem(item)">
                    Delete
                </v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import * as fb from '@/firebase'

export default {
    data() {
        return {
            headers: [
                { text: 'Item Name', value: 'itemName' },
                { text: 'Quantity', value: 'quantity' },
                { text: "Actions", value: "actions", align: "right", sortable: false },
            ],
            items: [],
            search: "",

            item_info: { itemName: "", quantity: "" },
            dialog: false,
            valid: true,
        }
    },

    methods: {
        async refreshItems() {
            this.items = await fb.getItems()
        },

        close() {
            this.dialog = false
        },

        async save() {
            await fb.addItem(this.item_info.itemName, Number(this.item_info.quantity))
            await this.refreshItems()
            this.close()
        },

        async deleteItem(item) {
            console.log(item.id)
        }
    },

    async mounted() {
        await this.refreshItems()
    }
}
</script>

<style>

</style>