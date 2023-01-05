<template>
    <v-card :loading="loading">
        <v-card-title>
            Pending Orders
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
            <v-spacer></v-spacer>
            <v-btn class="mx-2" icon @click="refreshPendingOrders">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </v-card-title>

        <v-data-table :headers="headers" :items="pendingOrders" :items-per-page="10" :search="search"
            class="elevation-1" dense>
            <!-- Lock Type -->
            <template v-slot:[`item.lockType`]="{ item }">
                {{ getLockType(item.lockType) }}
            </template>
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn x-small class="mr-2 success" @click="showConfirmation(item)">
                    Accept
                </v-btn>
            </template>
        </v-data-table>

        <v-dialog v-model="orderAcceptanceDialog" max-width="1000">
            <v-card v-if="acceptingOrder.product">
                <v-card-title>{{ acceptingOrder.customer }}</v-card-title>
                <v-card-subtitle>Delivery Date : {{ acceptingOrder.deliveryDate }}</v-card-subtitle>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" lg="4" md="4" sm="4">
                            <v-text-field label="Product Name" :value="acceptingOrder.product.productName" readonly
                                hide-details />
                        </v-col>
                        <v-col cols="12" lg="2" md="2" sm="2">
                            <v-text-field label="Quantity" :value="acceptingOrder.quantity" readonly hide-details />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" lg="6" md="12" sm="12">
                            <v-card>
                                <v-card-title>
                                    Required Raw Items List
                                </v-card-title>
                                <v-card-text>
                                    <v-list subheader two-line>
                                        <v-list-item v-for="rawItem in acceptingOrder.product.required_raw_items"
                                            :key="rawItem.id">
                                            <v-list-item-content>
                                                <v-list-item-title v-text="rawItem.rawItem"></v-list-item-title>

                                                <v-list-item-subtitle
                                                    v-text="'Each lock needs ' + rawItem.quantity + ' ' + rawItem.rawItem"></v-list-item-subtitle>
                                            </v-list-item-content>

                                            <v-list-item-action>

                                                <v-tooltip
                                                    v-if="Number(rawItem.available_quantity) >= Number(rawItem.quantity) * Number(acceptingOrder.quantity)"
                                                    bottom color="success">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <span v-bind="attrs" v-on="on" class="text-h6">{{
                                                            Number(rawItem.quantity) * Number(acceptingOrder.quantity)
                                                        }}
                                                        </span>
                                                    </template>
                                                    <span>{{ rawItem.available_quantity + ' ' + rawItem.rawItem }}
                                                        available
                                                        in
                                                        stock.</span>
                                                </v-tooltip>
                                                <v-tooltip v-else bottom color="error">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <span v-bind="attrs" v-on="on" class="error--text text-h6">{{
                                                            Number(rawItem.quantity) * Number(acceptingOrder.quantity)
                                                        }}</span>
                                                    </template>
                                                    <span>Only {{ rawItem.available_quantity + ' ' + rawItem.rawItem }}
                                                        available in
                                                        stock!</span>
                                                </v-tooltip>

                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-list>
                                </v-card-text>
                            </v-card>
                        </v-col>
                        <v-col cols="12" lg="6" md="12" sm="12">
                            <v-card>
                                <v-card-title>Assign Employees</v-card-title>
                                <v-card-text>
                                    <v-list subheader two-line>
                                        <v-list-item v-for="employee in employees" :key="employee.id">
                                            <v-list-item-content>
                                                <v-list-item-title v-text="employee.displayName"></v-list-item-title>

                                                <v-list-item-subtitle
                                                    v-text="'Currently assigned in ' + Math.floor(Math.random() * 10) + ' projects.'"></v-list-item-subtitle>
                                            </v-list-item-content>

                                            <v-list-item-action>
                                                <v-btn class="success" small>Assign</v-btn>
                                            </v-list-item-action>
                                        </v-list-item>
                                    </v-list>
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="acceptOrder(acceptingOrder)">Accept</v-btn>
                    <v-btn text @click="orderAcceptanceDialog = false">Cancel</v-btn>
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
                { text: 'Order ID', value: 'id' },
                { text: 'Customer', value: 'customer' },
                { text: 'Lock Type', value: 'lockType' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'Delivery Date', value: 'deliveryDate' },
                { text: "Actions", value: "actions", align: "right", sortable: false },
            ],
            pendingOrders: [],
            search: "",

            orderAcceptanceDialog: false,
            acceptingOrder: {
                customer: "",
                deliveryDate: "",
                quantity: 0,
                product: {
                    productName: "",
                    required_raw_items: []
                }
            },

            order_info: null,

            dialog: false,
            valid: true,

            employees: [],
            rawItems: [],
            factoryItems: [],

        }
    },

    methods: {
        async refreshPendingOrders() {
            this.loading = true;
            this.pendingOrders = await fb.getPendingOrders()
            this.employees = await fb.getEmployees()
            this.rawItems = await fb.getRawItems()
            this.factoryItems = await fb.getFactoryItems()
            this.loading = false;
        },

        close() {
            this.orderAcceptanceDialog = false
        },

        async acceptOrder(order) {
            this.loading = true;
            if (await this.validateOrder(order)) {
                await fb.acceptOrder(order)
            }
            this.close()
            this.loading = false;
        },

        async validateOrder(order) {
            var valid = true;
            await this.assignAcceptingOrder(order)
            this.acceptingOrder.product.required_raw_items.forEach(rawItem => {
                if (!(Number(rawItem.available_quantity) >= Number(rawItem.quantity) * Number(this.acceptingOrder.quantity)))
                    valid = false;
            })
            return valid
        },

        async showConfirmation(order) {
            await this.assignAcceptingOrder(order)
            this.orderAcceptanceDialog = true
        },

        async assignAcceptingOrder(order) {
            this.acceptingOrder = order
            this.acceptingOrder.product = await fb.getFactoryItem(this.acceptingOrder.lockType)
            await Promise.all(
                this.acceptingOrder.product.required_raw_items.map(async (item) => {
                    var raw_Item = await fb.getRawItem(item.rawItem);
                    item.rawItem = raw_Item.itemName;
                    item.available_quantity = raw_Item.quantity;
                })
            );
        },

        addRequiredItem() {
            this.kanBan_info.required_raw_items.push({ item: "", quantity: "" })
        },

        getLockType(id) {
            const product = this.factoryItems.find(product => product.id === id);
            return product ? product.productName : null;
        }
    },

    async mounted() {
        await this.refreshPendingOrders()
    }
}
</script>

<style>
.w-100 {
    width: 100px;
}
</style>