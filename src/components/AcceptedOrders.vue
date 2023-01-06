<template>
    <v-card :loading="loading">
        <v-card-title>
            Accepted Orders
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
            <v-spacer></v-spacer>
            <v-btn class="mx-2" icon @click="refreshAcceptedOrders">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </v-card-title>

        <v-data-table :headers="headers" :items="acceptedOrders" :items-per-page="10" :search="search"
            class="elevation-1" dense>
            <!-- Lock Type -->
            <template v-slot:[`item.lockType`]="{ item }">
                {{ getLockType(item.lockType) }}
            </template>
            <!-- Assigned Employees -->
            <template v-slot:[`item.assignedEmployees`]="{ item }">
                <v-list dense class="py-0">
                    <ul>
                        <li v-for="(employee, i) in item.assignedEmployees" :key="i">
                            <span>
                                {{ employee.employee }}
                            </span>
                            <span>
                                × {{ employee.quantity }}
                            </span>
                        </li>
                    </ul>
                </v-list>
            </template>
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn x-small class="mr-2 success" @click="showConfirmation(item)">
                    Edit
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
            loading: false,
            headers: [
                { text: 'Order ID', value: 'id' },
                { text: 'Customer', value: 'customer' },
                { text: 'Lock Type', value: 'lockType' },
                { text: 'Quantity', value: 'quantity' },
                { text: 'Delivery Date', value: 'deliveryDate' },
                { text: 'Assigned Employees', value: 'assignedEmployees' },
                { text: "Actions", value: "actions", align: "right", sortable: false },
            ],
            acceptedOrders: [],
            search: "",

            orderAcceptanceDialog: false,

            acceptingOrder: {
                customer: "",
                deliveryDate: "",
                quantity: 0,
                product: {
                    productName: "",
                    required_raw_items: []
                },
                assignedEmployees: []
            },

            order_info: null,

            dialog: false,
            valid: true,

            employees: [],
            rawItems: [],
            factoryItems: [],

            assigningEmployees: [],

            error: null,
            timeout: 3000,
            snackbar: false,

        }
    },

    watch: {
        orderAcceptanceDialog(e) {
            if (e == false)
                this.assigningEmployees = []
        }
    },

    methods: {
        async refreshAcceptedOrders() {
            this.loading = true;
            this.acceptedOrders = await fb.getAcceptedOrders()
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
            this.acceptingOrder.assignedEmployees = this.assigningEmployees.filter(obj => obj.employee && obj.quantity !== 0)

            if (await this.validateOrder(order)) {
                await fb.acceptOrder(order)
                // console.log(order)
                this.close()
            } else {
                this.error = "Not enough raw items in stock!"
                this.snackbar = true;
            }

            this.refreshAcceptedOrders()
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
        },

        addEmployeeToAcceptingOrder() {
            var remainingQuantity = this.acceptingOrder.quantity - this.assigningEmployees.reduce((acc, curr) => acc + curr['quantity'], 0);
            if (remainingQuantity < 0)
                remainingQuantity = 0;
            this.assigningEmployees.push({ employee: "", quantity: remainingQuantity })
            this.acceptingOrder.assignedEmployees = this.assigningEmployees
        }
    },

    async mounted() {
        await this.refreshAcceptedOrders()
    }
}
</script>

<style>
.w-100 {
    width: 100px;
}
</style>