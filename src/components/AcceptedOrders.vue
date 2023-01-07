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
            <!-- Progress -->
            <template v-slot:[`item.finishedQuantity`]="{ item }">
                {{
                    item.finishedQuantity ? Math.floor(item.finishedQuantity / item.quantity * 100) + '% (' +
                        item.finishedQuantity + '/' +
                        item.quantity + ')' : '-'
                }}
            </template>
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn v-if="item.progress == 0" x-small class="mr-2 error" @click="unacceptOrder(item)">
                    Unaccept
                </v-btn>
                <v-btn x-small class="mr-2 success" @click="showConfirmation(item)">
                    Edit
                </v-btn>
                <v-btn x-small class="mr-2 warning" @click="showProgressDialog(item)">
                    Update Progress
                </v-btn>
            </template>
        </v-data-table>

        <v-dialog v-model="orderAcceptanceDialog" max-width="1200">
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
                                    <!-- <span v-for="(employee, i) in assigningEmployees" :key="i">{{
                                                employee
                                            }}</span> -->
                                    <v-list subheader two-line>
                                        <v-list-item v-for="(employee, i) in assigningEmployees" :key="i">
                                            <v-select v-model="employee.uid" :items="employees" item-value="uid"
                                                item-text="displayName"></v-select>

                                            <v-list-item-action>
                                                <v-text-field type="number" label="Assigned Quantity"
                                                    v-model="employee.quantity" :max="acceptingOrder.quantity" :min="0"
                                                    style="min-width: 200px" hide-details single-line></v-text-field>
                                            </v-list-item-action>
                                        </v-list-item>
                                        <v-list-item>
                                            <v-list-item-action>
                                                <v-btn @click="addEmployeeToAcceptingOrder()">Add Employee</v-btn>
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
                    <v-btn color="green darken-1" text @click="updateOrder(acceptingOrder)">Update</v-btn>
                    <v-btn text @click="orderAcceptanceDialog = false">Cancel</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog v-model="progressDialog" max-width="800">
            <v-card v-if="progress_info">
                <v-card-title>{{ progress_info.customer }}</v-card-title>
                <v-card-subtitle>Delivery Date : {{ progress_info.deliveryDate }}</v-card-subtitle>
                <v-card-text>
                    <v-row>
                        <v-col cols="12" lg="6" md="6" sm="6">
                            <v-text-field label="Product Name" :value="getLockType(progress_info.lockType)" readonly
                                hide-details />
                        </v-col>
                        <v-col cols="12" lg="2" md="2" sm="2">
                            <v-text-field label="Quantity" :value="progress_info.quantity" readonly hide-details />
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="12" lg="8" md="8" sm="12">
                            <v-card>
                                <v-card-title>Assigned Employees</v-card-title>
                                <v-card-text>
                                    <v-row v-for="(employee, i) in progress_info.assignedEmployees" :key="i">
                                        <v-col cols="12" lg="4" md="4" sm="4">
                                            <v-text-field readonly v-model="employee.employee"
                                                hide-details></v-text-field>
                                        </v-col>
                                        <v-col cols="12" lg="3" md="3" sm="3">
                                            <v-text-field label="Assigned Quantity" readonly v-model="employee.quantity"
                                                type="number" hide-details></v-text-field>
                                        </v-col>
                                        <v-col cols="12" lg="5" md="5" sm="5">
                                            <v-text-field label="Quantity Finished Today"
                                                v-model="employee.finishedQuantity" type="number"
                                                hide-details></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-card-text>
                            </v-card>
                        </v-col>

                        <v-col cols="12" lg="4" md="4" sm="12">
                            <v-card>
                                <v-card-title>Progress {{ progressPercentage }}%</v-card-title>
                                <v-card-text>
                                    <div>
                                        Order Quantity : {{ progress_info.quantity }}
                                    </div>
                                    <div>
                                        Finished Quantity : {{ finishedQuantity }}
                                    </div>
                                </v-card-text>
                            </v-card>
                        </v-col>


                    </v-row>

                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="updateFinishedQuantity(progress_info)">Update</v-btn>
                    <v-btn text @click="progressDialog = false">Cancel</v-btn>
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
                { text: 'Assigned Employees', value: 'assignedEmployees' },
                { text: 'Progress', value: 'finishedQuantity' },
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

            progressDialog: false,

            progress_info: {
                assignedEmployees: []
            }

        }
    },

    watch: {
        orderAcceptanceDialog(e) {
            if (e == false)
                this.assigningEmployees = []
        }
    },

    computed: {
        finishedQuantity() {
            var sum = this.progress_info.assignedEmployees.reduce((total, employee) => total + (Number(employee.finishedQuantity) ? Number(employee.finishedQuantity) : 0), 0);
            var finishedQuantity = Number(Number(sum) ? Number(sum) : 0) + Number(Number(this.progress_info.finishedQuantity) ? Number(this.progress_info.finishedQuantity) : 0)
            if (finishedQuantity)
                return finishedQuantity
            else
                return 0
        },

        progressPercentage() {
            return Math.floor(this.finishedQuantity / this.progress_info.quantity * 100)
        }
    },

    methods: {
        async refreshAcceptedOrders() {
            this.loading = true;
            this.acceptedOrders = await fb.getAcceptedOrders()
            this.employees = await fb.getEmployees()
            this.rawItems = await fb.getRawItems()
            this.factoryItems = await fb.getFactoryItems()
            const orderCountPromises = this.employees.map(async employee => {
                employee.orderCount = await fb.getNumberOfAssignedOrders(employee.uid)
            })
            await Promise.all(orderCountPromises)
            this.loading = false;
        },

        close() {
            this.orderAcceptanceDialog = false
            this.progressDialog = false;
        },

        async updateOrder(order) {
            this.loading = true;
            this.acceptingOrder.assignedEmployees = this.assigningEmployees.filter(obj => obj.uid && Number(obj.quantity) !== 0)
            await fb.updateOrder(order)
            this.refreshAcceptedOrders()
            this.close()
            this.loading = false;
        },

        async unacceptOrder(order) {
            this.loading = true;
            await fb.unacceptOrder(order)
            await this.refreshAcceptedOrders()
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
            this.assigningEmployees = this.acceptingOrder.assignedEmployees
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
            this.assigningEmployees.push({ uid: null, quantity: remainingQuantity })
            this.acceptingOrder.assignedEmployees = this.assigningEmployees
        },

        async showProgressDialog(item) {
            this.progress_info = item
            this.progressDialog = true;
        },

        async updateFinishedQuantity() {
            this.loading = true;
            await fb.updateFinishedQuantity(this.progress_info)
            this.close()
            this.refreshAcceptedOrders()
            this.loading = false;
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