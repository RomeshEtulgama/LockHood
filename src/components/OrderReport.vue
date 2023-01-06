<template>
    <v-container fluid>
        <v-btn @click="generateOrderReport()">Generate Order Report</v-btn>
        <vue-html2pdf :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="true"
            :paginate-elements-by-height="1400" filename="Order Report" :pdf-quality="2" :manual-pagination="false"
            pdf-format="a4" pdf-orientation="portrait" pdf-content-width="800px" ref="html2Pdf">
            <section slot="pdf-content">
                <div style="margin: 20px;">
                    <h1>Orders Report</h1>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Quantity</th>
                                <th>Delivery Date</th>
                                <th>Accepted</th>
                                <th>Assigned Employees</th>
                                <th>Finished Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="order in orders" v-bind:key="order.id">
                                <td>{{ order.id }}</td>
                                <td>{{ order.customer }}</td>
                                <td>{{ order.quantity }}</td>
                                <td>{{ order.deliveryDate }}</td>
                                <td>{{ order.accepted }}</td>
                                <td>
                                    <template v-if="order.assignedEmployees">
                                        <template v-for="assignedEmployee in order.assignedEmployees">
                                            {{ assignedEmployee.employee }} ({{ assignedEmployee.quantity }})
                                        </template>
                                    </template>
                                </td>
                                <td>{{ order.finishedQuantity }}</td>
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
    }),

    methods: {
        generateOrderReport() {
            this.$refs.html2Pdf.generatePdf()
        }

    },
    async mounted() {
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