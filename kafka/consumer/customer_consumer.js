const { default: axios } = require('axios')
const { Kafka } = require('kafkajs')
const endpoints = require('../../Api/endpoints')
require('dotenv').config('../../.env')

const kafka = new Kafka({
    clientId: 'trezik-producer',
    brokers: ['localhost:9092']
})

const consumer = kafka.consumer({ groupId: 'test-group' })

const run = async () => {
    // Consuming
    await consumer.connect()
    await consumer.subscribe({ topics: ['customer'] } )

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            await SendDataBody(endpoints.customer, message.value.toString())
        },
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
        console.log("new error");
    }
}
