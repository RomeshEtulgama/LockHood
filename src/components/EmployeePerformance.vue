<template>
    <v-container fluid>
        <v-btn @click="generatePerformanceReport()">Generate Performance Report</v-btn>
        <vue-html2pdf :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="true"
            :paginate-elements-by-height="1400" filename="Performance Report" :pdf-quality="2"
            :manual-pagination="false" pdf-format="a4" pdf-orientation="portrait" pdf-content-width="1100px"
            ref="html2Pdf">
            <section slot="pdf-content">
                <div style="margin: 20px;">
                    <h1>Employee Performances Report</h1>

                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Approved</th>
                                <th>Assigned Orders</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="employee in employees" v-bind:key="employee.uid">
                                <td>{{ employee.displayName }}</td>
                                <td>{{ employee.email }}</td>
                                <td>{{ employee.approved }}</td>
                                <td style="white-space:pre;">{{ processAssignedOrders(employee) }}
                                </td>
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
        employees: null,
        orders: null,
        products: null
    }),

    methods: {
        generatePerformanceReport() {
            this.$refs.html2Pdf.generatePdf()
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

        processAssignedOrders(employee) {
            var orders = ""
            for (const orderId in employee.assignedOrders) {
                const order = employee.assignedOrders[orderId];
                orders += this.getCustomer(orderId) + ' --- ' + this.getLockType(orderId) + ' × ' + order.quantity + '\n'
            }
            return orders.trim();
        },

        getLockType(id) {
            for (const order of this.orders) {
                if (order.id === id) {
                    return this.getProduct(order.lockType);
                }
            }
            return null;
        }

        ,

        getCustomer(id) {
            for (const order of this.orders) {
                if (order.id === id) {
                    return order.customer;
                }
            }
            return null;
        }


    },
    async mounted() {
        this.employees = await fb.getEmployees()
        this.products = await fb.getFactoryItems()
        this.orders = await fb.getOrders()
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