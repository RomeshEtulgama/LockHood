<template>
    <v-container fluid>
        <v-btn @click="generateInventoryReport()">Generate Inventory Report</v-btn>
        <vue-html2pdf :show-layout="false" :float-layout="true" :enable-download="true" :preview-modal="true"
            :paginate-elements-by-height="1400" filename="Inventory Report" :pdf-quality="2" :manual-pagination="false"
            pdf-format="a4" pdf-orientation="portrait" pdf-content-width="800px" ref="html2Pdf">
            <section slot="pdf-content">
                <div style="margin: 20px;">
                    <h1>Inventory Report</h1>
                    <h2>Product List</h2>
                    <table style="border: 1px solid black; border-collapse: separate;">
                        <tr>
                            <th style="border-right: 1px solid lightgray;">Product Name</th>
                            <th style="border-right: 1px solid lightgray;">Time Requirement</th>
                            <th>Raw Materials</th>
                        </tr>
                        <tr v-for="product in products" :key="product.id">
                            <td style="border-top: 1px solid black; border-right: 1px solid lightgray;">{{
                                product.productName
                            }}</td>
                            <td style="border-top: 1px solid black; border-right: 1px solid lightgray;">{{
                                product.timeRequirement
                            }} hours</td>
                            <td style="border-top: 1px solid black;">
                                <ul>
                                    <li v-for="item in product.required_raw_items" :key="item.rawItem">
                                        {{ item.quantity }} x {{ item.rawItem }}
                                    </li>
                                </ul>
                            </td>
                        </tr>
                    </table>
                    <br />
                    <h2>Raw Items List</h2>
                    <table style="border: 1px solid black; border-collapse: separate;">
                        <tr>
                            <th style="border-right: 1px solid lightgray;">Item Name</th>
                            <th style="border-right: 1px solid lightgray;">Quantity</th>
                            <th style="border-right: 1px solid lightgray;">Alert Quantity</th>
                        </tr>
                        <tr v-for="item in rawItems" :key="item.id">
                            <td style="border-top: 1px solid black; border-right: 1px solid lightgray;">{{
                                item.itemName
                            }}</td>
                            <td style="border-top: 1px solid black; border-right: 1px solid lightgray;">{{
                                item.quantity
                            }}</td>
                            <td style="border-top: 1px solid black; border-right: 1px solid lightgray;">{{
                                item.alertQuantity
                            }}</td>
                        </tr>
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
        products: null,
        rawItems: null,
    }),

    methods: {
        generateInventoryReport() {
            this.$refs.html2Pdf.generatePdf()
        }

    },
    async mounted() {
        this.products = await fb.getFactoryItems()
        this.rawItems = await fb.getRawItems()
    }
}
</script>

<style>

</style>