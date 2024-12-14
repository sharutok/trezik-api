const url ="https://openapi.trezix.io/api/v1"
const endpoints = {
    customer: `${url}/storeCustomer`,
    material: `${url}/storeMaterial`,
    vendor: `${url}/storeVendor`,
    purchaseOrder: `${url}/storePurchaseOrder`,
    SalesOrder: `${url}/storeSalesOrder`
}

module.exports=endpoints