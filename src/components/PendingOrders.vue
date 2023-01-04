<template>
    <v-card>
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
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn x-small class="mr-2 success" @click="showConfirmation(item)">
                    Accept
                </v-btn>
            </template>
        </v-data-table>

        <v-dialog v-model="orderAcceptanceDialog" max-width="600">
            <v-card>
                <v-card-title class="headline">Accept Order - {{ acceptingOrder ? acceptingOrder.lockType :
        ""
}}</v-card-title>
                <v-card-text>
                    <v-row v-if="acceptingOrder">
                        <v-col>
                            <v-textarea rows="1" outlined label="Description" :value="acceptingOrder.description"
                                readonly auto-grow></v-textarea>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-select v-model="kanBan_info.assigned_employees" :items="employees"
                                item-text="displayName" item-value="uid" label="Assigned Employees" dense
                                multiple></v-select>
                        </v-col>
                    </v-row>
                    <v-row v-for="(item, i) in kanBan_info.required_raw_items" :key="i">
                        <v-col cols="12" lg="8" md="6" sm="12">
                            <v-select v-model="item.item" :items="rawItems" item-text="itemName" item-value="id"
                                label="Raw Item" dense></v-select>
                        </v-col>
                        <v-col cols="12" lg="4" md="6" sm="12">
                            <v-text-field v-model="item.quantity" type="number" label="Quantity" dense></v-text-field>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col>
                            <v-btn @click="addRequiredItem()">Add Item</v-btn>
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
            headers: [
                { text: 'Order ID', value: 'id' },
                { text: 'Lock Type', value: 'lockType' },
                { text: 'Description', value: 'description' },
                { text: 'Quantity', value: 'quantity' },
                { text: "Actions", value: "actions", align: "right", sortable: false },
            ],
            pendingOrders: [],
            search: "",

            kanBan_info: {
                assigned_employees: [],
                required_raw_items: [{ item: "", quantity: "" }],
            },

            empty_kanBan_info: {
                assigned_employees: [],
                required_raw_items: [{ item: "", quantity: "" }],
            },

            orderAcceptanceDialog: false,
            acceptingOrder: null,

            dialog: false,
            valid: true,

            employees: [],
            rawItems: []
        }
    },

    methods: {
        async refreshPendingOrders() {
            this.pendingOrders = await fb.getPendingOrders()
            this.employees = await fb.getEmployees()
            this.rawItems = await fb.getRawItems()
        },

        close() {
            this.orderAcceptanceDialog = false
        },

        async acceptOrder(item) {
            item.kanBan_info = this.kanBan_info
            await fb.acceptOrder(item)
            this.kanBan_info = this.empty_kanBan_info
            this.close()
        },

        showConfirmation(order) {
            this.acceptingOrder = order
            this.orderAcceptanceDialog = true
        },

        addRequiredItem() {
            this.kanBan_info.required_raw_items.push({ item: "", quantity: "" })
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