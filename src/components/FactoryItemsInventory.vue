<template>
    <v-card :loading="loading">
        <v-card-title>
            Factory Items
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line
                hide-details></v-text-field>
            <v-spacer></v-spacer>

            <!-- Add Product -->
            <v-dialog v-model="dialog" max-width="400px" persistent>
                <template v-slot:activator="{ on, attrs }">
                    <!-- Add New Item -->
                    <v-btn color="success" dark v-bind="attrs" v-on="on" class="mx-2" small>
                        Add Product
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Product</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <!-- Basic Details -->
                            <v-form ref="form" v-model="valid" lazy-validation>
                                <v-row>
                                    <!-- Name -->
                                    <v-col cols="12" sm="6" md="8" lg="8">
                                        <v-text-field v-model="product_info.productName" label="Product Name"
                                            :rules="[() => !!product_info.productName || 'Product Name is required',]"
                                            required></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row v-for="(item, i) in product_info.required_raw_items" :key="i">
                                    <v-col cols="12" lg="8" md="6" sm="12">
                                        <v-select v-model="item.rawItem" :items="rawItems" item-text="itemName"
                                            item-value="id" label="Raw Item" dense></v-select>
                                    </v-col>
                                    <v-col cols="12" lg="4" md="6" sm="12">
                                        <v-text-field v-model="item.quantity" type="number" label="Quantity"
                                            dense></v-text-field>
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-btn @click="addRequiredItem()">Add Item</v-btn>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-container>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
                        <v-btn v-if="editExistingProduct" color="blue darken-1" text @click="updateProduct"> Edit
                        </v-btn>
                        <v-btn v-else color="blue darken-1" text @click="save"> Save </v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <v-btn class="mx-2" icon @click="refreshProducts">
                <v-icon>mdi-refresh</v-icon>
            </v-btn>
        </v-card-title>

        <v-data-table :headers="headers" :items="products" :items-per-page="10" :search="search" class="elevation-1"
            dense>
            <!-- Required Raw Item -->
            <template v-slot:[`item.required_raw_items`]="{ item }">
                <v-list dense class="py-0">
                    <ul>
                        <li v-for="(rItem, i) in item.required_raw_items" :key="i">
                            <span>
                                {{ rItem.rawItem }}
                            </span>
                            <span>
                                × {{ rItem.quantity }}
                            </span>
                        </li>
                    </ul>
                </v-list>
            </template>
            <!-- Actions -->
            <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="editProduct(item)">
                    mdi-pencil
                </v-icon>
                <v-icon small @click="showConfirmation(item)">
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>

        <!-- Delete Confirmation -->
        <v-dialog v-model="confirmationDialog" max-width="290">
            <v-card>
                <v-card-title class="headline">Confirm Deletion</v-card-title>
                <v-card-text>Are you sure you want to delete this item?</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="green darken-1" text @click="deleteItem(deletingItem)">Delete</v-btn>
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
            loading: true,
            headers: [
                { text: 'Product Name', value: 'productName' },
                { text: 'Required Raw Items', value: 'required_raw_items' },
                { text: "Actions", value: "actions", align: "right", sortable: false },
            ],
            products: [],
            rawItems: [],
            search: "",

            product_info: {
                productName: "",
                required_raw_items: [{ rawItem: "", quantity: 0 }]
            },

            dialog: false,
            valid: true,
            editExistingProduct: false,

            confirmationDialog: false,
            deletingItem: null
        }
    },

    methods: {
        async refreshProducts() {
            this.loading = true
            this.products = await fb.getFactoryItems()
            this.rawItems = await fb.getRawItems()
            this.loading = false
        },


        close() {
            this.dialog = false
            this.editExistingProduct = false
        },

        async save() {
            this.loading = true
            await fb.addFactoryItem(this.product_info)
            await this.refreshProducts()
            this.close()
            this.loading = false
        },

        showConfirmation(item) {
            this.deletingItem = item
            this.confirmationDialog = true
        },

        async deleteItem(item) {
            this.loading = true
            await fb.deleteFactoryItem(item.id)
            await this.refreshProducts()
            this.confirmationDialog = false
            this.deletingItem = null
            this.loading = false
        },

        async updateQuantity(item) {
            this.loading = true
            await fb.updateFactoryItemQuantity(item.id, item.quantity)
            this.loading = false
        },

        addRequiredItem() {
            this.product_info.required_raw_items.push({ rawItem: "", quantity: 0 })
        },

        async editProduct(item) {
            this.loading = true
            this.product_info = await fb.getFactoryItem(item.id)
            this.editExistingProduct = item.id;
            this.dialog = true
            this.loading = false
        },

        async updateProduct() {
            this.loading = true
            await fb.updateFactoryItem(this.editExistingProduct, this.product_info)
            await this.refreshProducts()
            this.close()
            this.loading = false
        }
    },

    async mounted() {
        await this.refreshProducts()
    }
}
</script>

<style>
.w-100 {
    width: 100px;
}
</style>