<template>
    <v-card>
        <v-card-title>
            Current Orders
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="600px">
                <template v-slot:activator="{ on, attrs }">
                    <!-- Add New Order -->
                    <v-btn color="success" dark v-bind="attrs" v-on="on" class="mx-2" small>
                        Add Order
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Add New Order</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <!-- Basic Details -->
                            <v-form ref="form" v-model="valid" lazy-validation>
                                <v-row>
                                    <!-- Customer Name -->
                                    <v-col cols="12" sm="12" md="12" lg="12">
                                        <v-text-field v-model="order_info.customer" label="Customer Name"
                                            :rules="[() => !!order_info.customer || 'Customer Name is required',]"
                                            required dense></v-text-field>
                                    </v-col>
                                    <!-- Lock Type -->
                                    <v-col cols="12" sm="4" md="6" lg="6">
                                        <v-select :items="lockTypes" v-model="order_info.lockType" label="Lock Type"
                                            :rules="[() => !!order_info.lockType || 'Lock Type is required',]" required
                                            dense></v-select>
                                    </v-col>
                                    <!-- Custom Lock Type -->
                                    <v-col cols="12" sm="8" md="6" lg="6">
                                        <v-text-field v-if="order_info.lockType == 'Custom'"
                                            v-model="order_info.customLockType" label="Custom Lock Type"
                                            :rules="[() => !!order_info.lockType || 'Lock Type is required',]" required
                                            dense></v-text-field>
                                    </v-col>
                                    <!-- Description -->
                                    <v-col cols="12" sm="6" md="8" lg="8" class="py-0">
                                        <v-textarea filled v-model="order_info.description" label="Description"
                                            dense></v-textarea>
                                    </v-col>
                                    <!-- Quantity -->
                                    <v-col cols="12" sm="6" md="8" lg="8">
                                        <v-text-field v-model="order_info.quantity" label="Quantity" type="number"
                                            :rules="[() => !!order_info.quantity || 'Quantity is required',]" required
                                            dense></v-text-field>
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
            <v-btn class="mx-2" icon @click="refreshOrders">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </v-card-title>
        <v-data-table :headers="headers" :items="orders" :items-per-page="10" :search="search" class="elevation-1"
            dense>
            <!-- Quantity -->
            <template v-slot:[`item.quantity`]="{ item }">
                <v-text-field type="number" class="w-100" v-model="item.quantity" dense solo hide-details
                    @change="updateQuantity(item)"></v-text-field>
            </template>
            <!-- Progress -->
            <template v-slot:[`item.progress`]="{ item }">
                <span>{{ item.progress ? Number(item.progress) : "0%" }}</span>
            </template>
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="editOrder(item)">
                    mdi-pencil
                </v-icon>
                <v-icon small @click="showConfirmation(item)">
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>
        <v-dialog v-model="confirmationDialog" max-width="290">
            <v-card>
                <v-card-title class="headline">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete this order?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="deleteOrder(deletingOrder)">Delete</v-btn>
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
            headers: [
                { text: 'Customer', value: 'customer' },
                { text: 'Lock Type', value: 'lockType' },
                { text: 'Description', value: 'description' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'Progress', value: 'progress' },
                { text: "Actions", value: "actions", align: "right", sortable: false },
            ],
            orders: [],
            lockTypes: ['Custom'],
            search: "",

            order_info: {
                customer: "",
                lockType: "",
                customLockType: "",
                description: "",
                quantity: "",
            },

            dialog: false,
            valid: true,

            confirmationDialog: false,
            deletingOrder: null
        }
    },

    methods: {
        async refreshOrders() {
            this.orders = await fb.getOrders()
            this.lockTypes = await fb.getLockTypes()
        },

        close() {
            this.dialog = false
        },

        async save() {
            await fb.addOrder(this.order_info.customer, this.order_info.lockType, this.order_info.customLockType, this.order_info.description, Number(this.order_info.quantity))
            await this.refreshOrders()
            this.close()
        },

        showConfirmation(order) {
            this.deletingOrder = order
            this.confirmationDialog = true
        },

        async deleteOrder(order) {
            fb.deleteOrder(order.id)
            await this.refreshOrders()
            this.confirmationDialog = false
            this.deletingOrder = null
        },

        async updateQuantity(order) {
            fb.updateOrderQuantity(order.id, order.quantity)
        },

        editOrder(item) {
            console.log("Edit order", item)
        }
    },

    async mounted() {
        await this.refreshOrders()
    }
}
</script>

<style>
.w-100 {
    width: 100px;
}
</style>