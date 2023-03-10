<template>
    <v-container fluid>
        <v-btn @click="generateOrderReport()">Generate Order Report</v-btn>
        <vue-html2pdf :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="true"
            :paginate-elements-by-height="1400" filename="Order Report" :pdf-quality="2" :manual-pagination="false"
            pdf-format="a4" pdf-orientation="landscape" pdf-content-width="1100px" ref="html2Pdf">
            <section slot="pdf-content">
                <div style="margin: 20px;">
                    <h1>Orders Report</h1>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Lock Type</th>
                                <th>Quantity</th>
                                <th>Delivery Date</th>
                                <th>Accepted</th>
                                <th>Assigned Employees</th>
                                <th>Progress</th>
                                <th>Time to complete</th>
                                <th>Delivery Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in orders" v-bind:key="order.id">
                                <td>{{ order.id }}</td>
                                <td>{{ order.customer }}</td>
                                <td>{{ getProduct(order.lockType) }}</td>
                                <td>{{ order.quantity }}</td>
                                <td>{{ order.deliveryDate }}</td>
                                <td>{{ order.accepted ? "Accepted" : "Pending" }}</td>
                                <td>
                                    <template v-if="order.assignedEmployees">
                                        <span v-for="assignedEmployee in order.assignedEmployees"
                                            v-bind:key="assignedEmployee.uid">
                                            {{ getUser(assignedEmployee.uid) }} ({{ assignedEmployee.quantity }}) <br />
                                        </span>
                                    </template>
                                </td>
                                <td>{{
                                    order.finishedQuantity ? (order.finishedQuantity / order.quantity >= 1 ? "Finished"
                                        :
                                        order.finishedQuantity + ' / ' + order.quantity) : ''
                                }}</td>
                                <td>{{
                                    order.quantity * getTimeRequirement(order.lockType) > 24 ? Math.floor(order.quantity
                                        *
                                        getTimeRequirement(order.lockType) / 24) + ' days' : Math.floor(order.quantity *
                                            getTimeRequirement(order.lockType)) + ' hours'
                                }}</td>
                                <td>{{ order.deliveryDate }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </vue-html2pdf>
    </v-container>
</template>

<script>
import * as fb from '@/firebase'
import VueHtml2pdf from 'vue-html2pdf'

export default {
    name: 'Reports',

    components: {
        VueHtml2pdf,
    },

    data: () => ({
        orders: null,
        employees: null,
        products: null,
    }),

    methods: {
        generateOrderReport() {
            this.$refs.html2Pdf.generatePdf()
        },

        getUser(uid) {
            if (this.employees) {
                for (const employee of this.employees) {
                    if (employee.uid === uid) {
                        return employee.displayName;
                    }
                }
            }
            return null;
        },

        getProduct(id) {
            if (this.products) {
                for (const product of this.products) {
                    if (product.id === id) {
                        return product.productName;
                    }
                }
            }
            return null;
        },

        getTimeRequirement(id) {
            if (this.products) {
                for (const product of this.products) {
                    if (product.id === id) {
                        return product.timeRequirement;
                    }
                }
            }
            return null;
        },
    },
    async mounted() {
        this.orders = await fb.getOrders()
        this.employees = await fb.getEmployees()
        this.products = await fb.getFactoryItems()
    }
}
</script>

<style scoped>
table {
    border: 1px solid gray;
    border-collapse: collapse;
}

td,
th {
    border: 1px solid black;
    padding: 0.5em;
}
</style>