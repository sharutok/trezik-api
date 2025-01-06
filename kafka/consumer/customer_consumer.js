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
    await consumer.subscribe({ topics: ['customer', 'material', 'salesorder', 'purchaseorder', 'vendor', 'partner','businesspartner'] } )
    await consumer.run({
        eachBatch: async ({ batch, heartbeat }) => {
            for (const message of batch.messages) {
                try {
                    const handler = topicHandlers[batch.topic];
                    if (handler) {
                        await handler(message);
                    } else {
                        console.warn(`No handler for topic: ${topic}`);
                    }
                } catch (error) {
                    console.error(`Error handling message: ${message.value.toString()}`, error);
                }
            }
            await heartbeat()
        },
        batch: {
            size: 10,
            timeout: 30000
        }
    })
}

const topicHandlers = {
    'customer': async (message) => await SendDataBody(endpoints.customer, message.value.toString()),
    'material': async (message) => await SendDataBody(endpoints.material, message.value.toString()),
    'salesorder': async (message) => await SendDataBody(endpoints.SalesOrder, message.value.toString()),
    'purchaseorder': async (message) => await SendDataBody(endpoints.purchaseOrder, message.value.toString()),
    'vendor': async (message) => await SendDataBody(endpoints.vendor, message.value.toString()),
    'partner': async (message) => await SendDataBody(endpoints.partner, message.value.toString()),
    'businesspartner': async (message) => await SendDataBody(endpoints.businesspartner, message.value.toString())
};


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


