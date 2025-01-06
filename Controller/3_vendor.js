const { default: axios } = require("axios")
const moment = require('moment')
const producer = require("../kafka/producer/producer")
const { Chunker } = require("../utils/chunker")
const { q_vendor } = require("../queries/q_vendor")
const { z } =require( "zod")

exports.Vendor = async (req, res) => {
    try {
        let q_data = await q_vendor()

        q_data = q_data?.response.map(x => {
            x["vendor_group"] = []
            x["contact_person"] = []
            const parsedEmail = z.string().email().safeParse(x["company_email"]);
            x["company_email"] = parsedEmail.success ? parsedEmail.data : "";
            return x
        })

        // const chunked_q_data = Chunker(q_data)
let final_data=[]
        q_data?.map(async (q_data, i) => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "2",
                    "vendor": [q_data],
                }
                final_data.push(so_q_data)
                await producer.send({
                    topic: 'vendor',
                    messages: [
                        { value: JSON.stringify(so_q_data) },
                    ],
                })
                console.log(`sent vendor data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
        })
        res && res.json(final_data)

    } catch (error) {
        console.log("error in vendor", error)
    }
}