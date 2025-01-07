const { default: axios } = require("axios")
const moment = require('moment')
const producer = require("../kafka/producer/producer")
const { Chunker } = require("../utils/chunker")
const { q_sales_order } = require("../queries/q_sales_order")


exports.SalesOrder = async (req, res) => {
    try {
        let q_data = await q_sales_order()
        let final_data=[]

        q_data?.map(async (q_data, i) => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "2",
                    "salesOrder": [q_data],
                }
            final_data.push(so_q_data)
                await producer.send({
                    topic: 'salesorder',
                    messages: [
                        { value: JSON.stringify(so_q_data) },
                    ],
                })
                console.log(`sent sales-order data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
            })
        res && res.json(final_data)

    } catch (error) {
        console.log("error in vendor", error)
    }
}