const { default: axios } = require("axios")
const moment = require('moment')
const producer = require("../kafka/producer/producer")
const { Chunker } = require("../utils/chunker")
const { z } = require("zod")
const { q_patner_customer,q_patner_vendor } = require("../queries/q_patner")

exports.PatnerCustomer = async (req, res) => {
    try {
        let q_data = await q_patner_customer()

        q_data = q_data?.response.map(x => {
            x["contact_person"] = []
            return x
        })
        let final_data=[]
        q_data?.map(async (q_data_, i) => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "1",
                    "partner": [q_data_],
            }
            final_data.push(so_q_data)
            
            await producer.send({
                topic: 'partner',
                messages: [{ value: JSON.stringify(so_q_data) },],
            })
            console.log(`sent partner-customer data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
        })
        res && res.json(final_data)

    } catch (error) {
        console.log("error in partner", error)
    }
}
exports.PatnerVendor = async (req, res) => {
    try {
        let q_data = await q_patner_vendor()
        let final_data=[]
        q_data = q_data?.response.map(x => {
            x["contact_person"] = []
            return x
        })
        
        q_data?.map(async (q_data, i) => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "1",
                    "partner": [q_data],
            }
            final_data.push(so_q_data)
                await producer.send({
                    topic: 'partner',
                    messages: [
                        { value: JSON.stringify(so_q_data) },
                    ],
                })
            console.log(`sent partner-vendor data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
            
        })
        res && res.json(final_data)

    } catch (error) {
        console.log("error in partner", error)
    }
}