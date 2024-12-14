const express = require('express')
const { Customer } = require('../Controller/1_customer')

const { MaterialExport, MaterialImport } = require('../Controller/2_material')
const { Vendor } = require('../Controller/3_vendor')
const { PurchaseOrder } = require('../Controller/5_purchase-order')
const { SalesOrder } = require('../Controller/6_sales-order')
const { Patner } = require('../Controller/4_patner')

const router = express.Router()

router.get("/customer",Customer)
router.get("/material-export",MaterialExport)
router.get("/material-import",MaterialImport)
router.get("/vendor",Vendor)
router.get("/purchase-order", PurchaseOrder)
router.get("/salesforce-order", SalesOrder)
router.get("/patner", Patner)

module.exports=router