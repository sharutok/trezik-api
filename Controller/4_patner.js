const { default: axios } = require("axios")
const moment = require('moment')
const producer = require("../kafka/producer/producer")
const { Chunker } = require("../utils/chunker")
const { z } = require("zod")
const { q_patner } = require("../queries/q_patner")

exports.Patner = async (req, res) => {
    try {
        let q_data = await q_patner()

        q_data = q_data?.response.map(x => {
            x["contact_person"] = []
            return x
        })

        const chunked_q_data = Chunker(q_data)

        chunked_q_data.map(async (q_data, i) => {
            setTimeout(async () => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "1",
                    "partner": [...q_data],
                }
                await producer.send({
                    topic: 'partner',
                    messages: [
                        { value: JSON.stringify(so_q_data) },
                    ],
                })
                console.log(`sent partner data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
            }, 1000 * (i + 1))
        })
        res && res.json(chunked_q_data)

    } catch (error) {
        console.log("error in partner", error)
    }
}