const { default: axios } = require("axios")
const moment = require('moment')
const producer = require("../kafka/producer/producer")
const { Chunker } = require("../utils/chunker")
const { q_purchase_order } = require("../queries/q_purchase_order")


exports.PurchaseOrder = async (req, res) => {
    try {
        let q_data = await q_purchase_order()

        q_data = q_data?.response.map(x => {
            x["business_partners"] = []
            x["material"] = []
            return x
        })


        const chunked_q_data = Chunker(q_data)

        chunked_q_data.map(async (q_data, i) => {
            setTimeout(async () => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "1",
                    "purchaseOrder": [...q_data],
                }
                await producer.send({
                    topic: 'purchaseorder',
                    messages: [
                        { value: JSON.stringify(so_q_data) },
                    ],
                })
                console.log(`sent purchase-order data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
            }, 1000 * (i + 1))
        })
        res && res.json(chunked_q_data)

    } catch (error) {
        console.log("error in vendor", error)
    }
}