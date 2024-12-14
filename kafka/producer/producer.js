
const { Kafka,Partitioners } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'trezik-producer',
    brokers: ['localhost:9092',],
    retry: {
        initialRetryTime: 300,  // Initial retry delay in milliseconds
        retries: 5,             // Number of retry attempts
        factor: 2,              // Exponential backoff factor
        multiplier: 1.5         // Delay multiplier between retries
    }
})

const producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner,
    allowAutoTopicCreation: true,  
    transactionTimeout: 30000,     
})

const run = async () => {
    await producer.connect()
}

run().catch(console.error)

module.exports=producer