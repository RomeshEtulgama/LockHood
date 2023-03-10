<template>
    <v-card :loading="loading">
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
                                        <v-text-field v-model="item_info.itemName" label="Item Name"
                                            :rules="[() => !!item_info.itemName || 'Item Name is required']"
                                            required></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>

                                    <!-- Quantity -->
                                    <v-col cols="12" sm="6" md="6" lg="6">
                                        <v-text-field type="number" :min="0" v-model="item_info.quantity"
                                            label="Quantity" :rules="[
                                                () =>
                                                    !!item_info.quantity ||
                                                    'Item Quantity is required',
                                            ]" required></v-text-field>
                                    </v-col>
                                    <!-- Alert Quantity -->
                                    <v-col cols="12" sm="6" md="6" lg="6">
                                        <v-text-field type="number" :min="0" v-model="item_info.alertQuantity"
                                            label="Alert Quantity" :rules="[
                                                () =>
                                                    !!item_info.quantity ||
                                                    'Alert Quantity is required to send alerts when low stock',
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
        <v-data-table :headers="headers" :items="items" :items-per-page="10" :search="search" class="elevation-1" dense>
            <!-- Item Name -->
            <template v-slot:[`item.itemName`]="{ item }">
                <v-text-field v-model="item.itemName" dense hide-details solo
                    @change="updateItemName(item)"></v-text-field>
            </template>
            <!-- Quantity -->
            <template v-slot:[`item.quantity`]="{ item }">
                <v-text-field type="number" :min="0" class="w-100" v-model="item.quantity" dense hide-details solo
                    @change="updateQuantity(item)"></v-text-field>
            </template>
            <!-- Alert Quantity -->
            <template v-slot:[`item.alertQuantity`]="{ item }">
                <v-text-field type="number" :min="0" class="w-100" v-model="item.alertQuantity" dense hide-details solo
                    @change="updateAlertQuantity(item)"></v-text-field>
            </template>
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn class="error" x-small @click="showConfirmation(item)">Delete</v-btn>
            </template>
        </v-data-table>
        <v-dialog v-model="confirmationDialog" max-width="290">
            <v-card>
                <v-card-title class="headline">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete this item?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="deleteItem(deletingItem)">Delete</v-btn>
                    <v-btn text @click="confirmationDialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
import * as fb from '@/firebase'

export default {
    data() {
        return {
            loading: true,

            headers: [
                { text: 'Item Name', value: 'itemName' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'Alert Quantity', value: 'alertQuantity' },
                { text: "Actions", value: "actions", align: "right", sortable: false },
            ],

            items: [],
            search: "",

            item_info: { itemName: "", quantity: "", alertQuantity: "" },
            dialog: false,
            valid: true,

            confirmationDialog: false,
            deletingItem: null
        }
    },

    methods: {
        async refreshItems() {
            this.loading = true
            this.items = await fb.getRawItems()
            this.loading = false
        },

        close() {
            this.dialog = false
        },

        async save() {
            this.loading = true
            await fb.addRawItem(this.item_info.itemName, Number(this.item_info.quantity), Number(this.item_info.alertQuantity))
            await this.refreshItems()
            this.close()
            this.loading = false
        },

        showConfirmation(item) {
            this.deletingItem = item
            this.confirmationDialog = true
        },

        async deleteItem(item) {
            this.loading = true
            fb.deleteRawItem(item.id)
            await this.refreshItems()
            this.confirmationDialog = false
            this.deletingItem = null
            this.loading = false
        },

        async updateQuantity(item) {
            this.loading = true
            await fb.updateRawItemQuantity(item.id, item.quantity)
            this.loading = false
        },

        async updateAlertQuantity(item) {
            this.loading = true
            await fb.updateRawItemAlertQuantity(item.id, item.alertQuantity)
            this.loading = false
        },

        async updateItemName(item) {
            this.loading = true
            await fb.updateRawItemName(item.id, item.itemName)
            this.loading = false
        }
    },

    async mounted() {
        await this.refreshItems()
    }
}
</script>

<style>
.w-100 {
    width: 100px;
}
</style>