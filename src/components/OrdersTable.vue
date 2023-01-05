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
                                </v-row>
                                <v-row>
                                    <!-- Lock Type -->
                                    <v-col cols="12" sm="6" md="6" lg="6">
                                        <v-select :items="factoryItems" v-model="order_info.lockType" label="Lock Type"
                                            :rules="[() => !!order_info.lockType || 'Lock Type is required',]" required
                                            dense item-text="productName" item-value="id"></v-select>
                                    </v-col>
                                    <!-- Quantity -->
                                    <v-col cols="12" sm="6" md="6" lg="6">
                                        <v-text-field v-model="order_info.quantity" label="Quantity" type="number"
                                            :rules="[() => !!order_info.quantity || 'Quantity is required',]" required
                                            dense></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <!-- Delivery Date -->
                                    <v-col cols="12" sm="6" md="8" lg="8">
                                        <v-menu v-model="dateMenu" :close-on-content-click="false" :nudge-right="40"
                                            transition="scale-transition" offset-y min-width="auto">
                                            <template v-slot:activator="{ on, attrs }">
                                                <v-text-field v-model="order_info.deliveryDate" label="Delivery Date"
                                                    prepend-icon="mdi-calendar" readonly v-bind="attrs"
                                                    v-on="on"></v-text-field>
                                            </template>
                                            <v-date-picker v-model="order_info.deliveryDate"
                                                @input="dateMenu = false"></v-date-picker>
                                        </v-menu>
                                    </v-col>
                                </v-row>
                                <v-row v-if="order_info.lockType && order_info.quantity">
                                    <v-col>
                                        <span>{{ Math.floor(Math.random() * 20) + 1 }} </span> &nbsp; days to complete.
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
        <v-data-table :headers="headers" :items="orders" :items-per-page="10" :search="search" class="elevation-1" dense
            :loading="loading">
            <!-- Customer -->
            <template v-slot:[`item.customer`]="{ item }">
                <v-text-field v-model="item.customer" dense solo hide-details
                    @change="updateCustomer(item)"></v-text-field>
            </template>
            <!-- Lock Type -->
            <template v-slot:[`item.lockType`]="{ item }">
                <v-select v-if="!item.accepted" :items="factoryItems" v-model="item.lockType" dense
                    item-text="productName" item-value="id" hide-details @change="updateLockType(item)"></v-select>
                <span v-else>{{ getLockType(item.lockType) }}</span>
            </template>
            <!-- Quantity -->
            <template v-slot:[`item.quantity`]="{ item }">
                <v-text-field v-if="!item.accepted" type="number" class="w-100" v-model="item.quantity" dense solo
                    hide-details @change="updateQuantity(item)"></v-text-field>
                <span v-else>{{ item.quantity }}</span>
            </template>
            <!-- Delivery Date -->
            <template v-slot:[`item.deliveryDate`]="{ item }">
                <v-menu v-if="!item.accepted" v-model="editDateMenu" :close-on-content-click="false" :nudge-right="40"
                    transition="scale-transition" offset-y min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field v-model="item.deliveryDate" label="Delivery Date" prepend-icon="mdi-calendar"
                            readonly v-bind="attrs" v-on="on" hide-details></v-text-field>
                    </template>
                    <v-date-picker v-model="item.deliveryDate" @input="editDateMenu = false"
                        @change="updateDeliveryDate(item)"></v-date-picker>
                </v-menu>
                <span v-else>{{ item.deliveryDate }}</span>
            </template>
            <!-- Accepted -->
            <template v-slot:[`item.accepted`]="{ item }">
                <v-icon v-if="item.accepted" color="success">mdi-check</v-icon>
            </template>
            <!-- Progress -->
            <template v-slot:[`item.progress`]="{ item }">
                <span>{{ item.progress ? Number(item.progress) : "0%" }}</span>
            </template>
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
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
            loading: false,

            headers: [
                { text: 'Customer', value: 'customer' },
                { text: 'Lock Type', value: 'lockType' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'Delivery Date', value: 'deliveryDate' },
                { text: 'Accepted', value: 'accepted' },
                { text: 'Progress', value: 'progress' },
                { text: "Actions", value: "actions", align: "right", sortable: false },
            ],

            orders: [],
            factoryItems: [],

            search: "",

            dateMenu: false,
            editDateMenu: false,

            order_info: {
                customer: "",
                lockType: "",
                quantity: "",
                deliveryDate: ""
            },

            editOrderInfo: false,

            dialog: false,
            valid: true,

            confirmationDialog: false,
            deletingOrder: null
        }
    },

    methods: {
        async refreshOrders() {
            this.loading = true;
            this.orders = await fb.getOrders()
            this.factoryItems = await fb.getFactoryItems()
            this.loading = false;
        },

        close() {
            this.dialog = false
        },

        async save() {
            this.loading = true;
            if (this.order_info.customer && this.order_info.lockType && Number(this.order_info.quantity) && this.order_info.deliveryDate) {
                await fb.addOrder(this.order_info)
                await this.refreshOrders()
                this.close()
            }
            this.loading = false;
        },


        showConfirmation(order) {
            this.deletingOrder = order
            this.confirmationDialog = true
        },

        async deleteOrder(order) {
            this.loading = true;
            await fb.deleteOrder(order.id)
            await this.refreshOrders()
            this.confirmationDialog = false
            this.deletingOrder = null
            this.loading = false;
        },


        async updateQuantity(order) {
            this.loading = true;
            await fb.updateOrderQuantity(order.id, order.quantity)
            await this.refreshOrders()
            this.loading = false;
        },

        async updateCustomer(order) {
            this.loading = true;
            await fb.updateOrderCustomer(order.id, order.customer)
            await this.refreshOrders()
            this.loading = false;
        },

        async updateLockType(order) {
            this.loading = true;
            await fb.updateOrderLockType(order.id, order.lockType)
            await this.refreshOrders()
            this.loading = false;
        },

        async updateDeliveryDate(order) {
            this.loading = true;
            await fb.updateOrderDeliveryDate(order.id, order.deliveryDate)
            await this.refreshOrders()
            this.loading = false;
        },

        editOrder(item) {
            this.editOrderInfo = item.id
            this.order_info = item
        },

        getLockType(id) {
            const product = this.factoryItems.find(product => product.id === id);
            return product ? product.productName : null;
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