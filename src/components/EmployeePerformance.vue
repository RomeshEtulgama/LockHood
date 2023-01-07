<template>
    <v-container fluid>
        <v-btn @click="generatePerformanceReport()">Generate Performance Report</v-btn>
        <vue-html2pdf :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="true"
            :paginate-elements-by-height="1400" filename="Performance Report" :pdf-quality="2"
            :manual-pagination="false" pdf-format="a4" pdf-orientation="landscape" pdf-content-width="1100px"
            ref="html2Pdf">
            <section slot="pdf-content">
                <div style="margin: 20px;">
                    <h1>Performances Report</h1>

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
                            <tr v-for="performance in performances" v-bind:key="performance.id">
                                <td>{{ performance.id }}</td>
                                <td>{{ performance.customer }}</td>
                                <td>{{ getProduct(performance.lockType) }}</td>
                                <td>{{ performance.quantity }}</td>
                                <td>{{ performance.deliveryDate }}</td>
                                <td>{{ performance.accepted ? "Accepted" : "Pending" }}</td>
                                <td>
                                    <template v-if="performance.assignedEmployees">
                                        <span v-for="assignedEmployee in performance.assignedEmployees"
                                            v-bind:key="assignedEmployee.uid">
                                            {{ getUser(assignedEmployee.uid) }} ({{ assignedEmployee.quantity }}) <br />
                                        </span>
                                    </template>
                                </td>
                                <td>{{
                                    performance.finishedQuantity ? (performance.finishedQuantity / performance.quantity
                                        >= 1 ? "Finished"
                                        :
                                        performance.finishedQuantity + ' / ' + performance.quantity) : ''
                                }}</td>
                                <td>{{
                                    performance.quantity * getTimeRequirement(performance.lockType) > 24 ?
                                        Math.floor(performance.quantity
                                            *
                                            getTimeRequirement(performance.lockType) / 24) + ' days' :
                                        Math.floor(performance.quantity *
                                            getTimeRequirement(performance.lockType)) + ' hours'
                                }}</td>
                                <td>{{ performance.deliveryDate }}</td>
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
        performances: null,
        employees: null,
        products: null,
    }),

    methods: {
        generatePerformanceReport() {
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
        this.performances = await fb.getPerformances()
        this.employees = await fb.getEmployees()
        this.products = await fb.getFactoryItems()
    }
}
</script>

<style scoped>
table {
    bperformance: 1px solid gray;
    bperformance-collapse: collapse;
}

td,
th {
    bperformance: 1px solid black;
    padding: 0.5em;
}
</style>