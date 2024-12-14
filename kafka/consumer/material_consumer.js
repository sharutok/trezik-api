const { Kafka } = require('kafkajs')
const endpoints = require('../../Api/endpoints')
const { default: axios } = require('axios')
require('dotenv').config('../../.env')

const kafka = new Kafka({
    clientId: 'trezik-producer',
    brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'test-group-1' })

const run = async () => {
    await consumer.connect()
    await consumer.subscribe({ topics: ['material'] })
    await consumer.run({
        eachBatch: async ({ batch, heartbeat }) => {
            for (const message of batch.messages) {
                await SendDataBody(endpoints.material, message.value.toString())
            }
            await heartbeat()
        },
        batch: {
            size: 10,        
            timeout: 30000   
        }
    })
}


run().catch(console.error)



const SendDataBody = async (api, data) => {
    try {
        const response = await axios.post(api, data, {
            headers: {
                'x-api-key': process.env.TREZIX_X_API_KEY,
                'Content-Type': 'application/json'
            },
        })
        const res = JSON.stringify(response.data)
        console.log(res);
    } catch (error) {
        console.log("new error",error);
    }
}
