const { default: axios } = require("axios")
const { q_customer } = require("../queries/q_customer")
const endpoints = require("../Api/endpoints")
const moment = require("moment/moment")
const { Chunker } = require("../utils/chunker")
const producer = require("../kafka/producer/producer")

exports.Customer = async(req, res) => {
    try {
        // get sql data 
        let q_data = await q_customer()

        // preparing data
        q_data=q_data?.response.map(x => {
            x["customer_group"]=[]
            return  x 
        })

        // chunk data
        const chunked_q_data = Chunker(q_data)
        
        //send chunk of data to kafka
        chunked_q_data.map(async(q_data,i) => { 
            setTimeout(async() => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "2",
                    "customer": [...q_data],
            }
            await producer.send({
                topic: 'customer',
                messages: [{
                    value: JSON.stringify(so_q_data)
                }],
            })
                console.log(`sent customer data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
            }, 1000 * (i + 1))
        })

        // send response to the client
        res && res.json(chunked_q_data)
    } catch (error) {
        console.log("error in customer",error)
    }
}
