const { default: axios } = require("axios")
const { q_customer } = require("../queries/q_customer")
const endpoints = require("../Api/endpoints")
const { q_material, q_material_export } = require("../queries/q_material")
const moment=require('moment')
const producer = require("../kafka/producer/producer")
const { Chunker } = require("../utils/chunker")

exports.MaterialImport = async (req, res) => {
    try {
        let q_data = await q_material()

        const chunked_q_data = Chunker(q_data?.response)

        chunked_q_data.map(async (q_data, i) => {
            setTimeout(async () => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "2",
                    "material": [...q_data],
                }
                await producer.send({
                    topic: 'material',
                    messages: [
                        { value: JSON.stringify(so_q_data) },
                    ],
                })
                console.log(`sent material data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
            }, 1000 * (i + 1))
        })
        res.json(chunked_q_data)
        
    } catch (error) {
        console.log("error in material", error)
    }
}

exports.MaterialExport = async (req, res) => {
    try {
        let q_data = await q_material_export()

        const chunked_q_data = Chunker(q_data?.response)

        chunked_q_data.map(async (q_data, i) => {
            setTimeout(async () => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "2",
                    "material": [...q_data],
                    "material_attribute_class": "Material",
                    "material_attributes": [
                        {
                            "label": "AWS Code",
                            "value": q_data[i]?.["AWS Code"]
                        },
                        {
                            "label": "Size",
                            "value": q_data[i]?.["LENGTH"]
                        },
                        {
                            "label": "Diameter",
                            "value": q_data[i]?.["DIAMETER"]
                        },
                        {
                            "label": "Brand Name",
                            "value": q_data[i]?.["BRAND_NAME"]
                        },
                        {
                            "label": "Method of Packing",
                            "value": q_data[i]?.["METHOD_OF_PACKING"]
                        },
                        {
                            "label": "Standard Pack Size",
                            "value": q_data[i]?.["STANDARD_PACK_SIZE"]
                        }
                    ],
                }
                await producer.send({
                    topic: 'material',
                    messages: [
                        { value: JSON.stringify(so_q_data) },
                    ],
                })
                console.log(`sent material data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
            }, 1000 * (i + 1))
        })
        res.json(chunked_q_data)
        
    } catch (error) {
        console.log("error in material", error)
    }
}





