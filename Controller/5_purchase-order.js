const { default: axios } = require("axios")
const moment = require('moment')
const producer = require("../kafka/producer/producer")
const { q_purchase_order } = require("../queries/q_purchase_order")


exports.PurchaseOrder = async (req, res) => {
    try {
        let q_data = await q_purchase_order()
        let final_data=[]

        await Promise.all(q_data.map(async (q_data, i) => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "1",
                    "purchaseOrder": q_data,
            }
            
            final_data.push(so_q_data)

                await producer.send({
                    topic: 'purchaseorder',
                    messages: [{ value: JSON.stringify(so_q_data) }],
                })
                console.log(`sent purchase-order data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
        }))
        res && res.json(final_data)

    } catch (error) {
        console.log("error in vendor", error)
    }
}