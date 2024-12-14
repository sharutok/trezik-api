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
    await consumer.subscribe({ topics: ['purchaseorder'] })

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            await SendDataBody(endpoints.purchaseOrder, message.value.toString())
        },
    })
}

run().catch(console.error)



const SendDataBody = async (api, data) => {
    try {
        const response = await axios.post(api, data, {
            headers: {
                'x-api-key': "eyJpdiI6ImdOZlRVVkdDZkUxUXRBYy9FVkJMYUE9PSIsInZhbHVlIjoiSVN1Rkd0ZHV1UFZSaTNZRmZ6TitnTmtYc3MvNmw5UHQrK2tpa1pGVEh1bzFhTERkZUpibWVtWEhHOXhUN3dwaCIsIm1hYyI6IjljYmE1YjQ0M2RjN2NlMTZlYjA4ZWE3NDkxYTMyZDAyN2ExNjA5NzRjNTRjZDI3OGRkZDRlNjcwMzMxYTk1YTciLCJ0YWciOiIifQ==",
                'Content-Type': 'application/json'
            },
        })
        const res = JSON.stringify(response.data)
        console.log(res);

    } catch (error) {
        console.log("new error");
    }
}
