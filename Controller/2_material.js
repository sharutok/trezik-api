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

        // const chunked_q_data = Chunker(q_data?.response)
        let final_data=[]
        q_data?.response.map(async (q_data_, i) => {
                const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "2",
                    "material": [q_data_],
            }
            
            final_data.push(so_q_data)
                await producer.send({
                    topic: 'material',
                    messages: [
                        { value: JSON.stringify(so_q_data) },
                    ],
                })

                console.log(`sent material-import data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
        })
        res.json(final_data)
        
    } catch (error) {
        console.log("error in material", error)
    }
}

exports.MaterialExport = async (req, res) => {
    try {
        let q_data = await q_material_export()
        

        // const chunked_q_data = Chunker(q_data?.response)

        let final_data=[]
        q_data?.response?.map(async (q_data_, i) => {
            const so_q_data = {
                    "domain": "AdorTest",
                    "user_type": "2",
                "material": [{ ...q_data_,...{
                    "material_attribute_class": "Material",
                    "material_attributes": [
                        {
                            "label": "AWS Code",
                            "value": q_data_?.["AWS Code"]
                        },
                        {
                            "label": "Size",
                            "value": q_data_?.["LENGTH"]
                        },
                        {
                            "label": "Diameter",
                            "value": q_data_?.["DIAMETER"]
                        },
                        {
                            "label": "Brand Name",
                            "value": q_data_?.["BRAND_NAME"]
                        },
                        {
                            "label": "Method of Packing",
                            "value": q_data_?.["METHOD_OF_PACKING"]
                        },
                        {
                            "label": "Standard Pack Size",
                            "value": q_data_?.["STANDARD_PACK_SIZE"]
                        }
                    ],
                } },
                        ],
                   
                }
                final_data.push(so_q_data)
                await producer.send({
                    topic: 'material',
                    messages: [
                        { value: JSON.stringify(so_q_data) },
                    ],
                })
                console.log(`sent material-export data at ${moment().format("DD-MM-YYYY hh:mm:ss a")}`);
        })
        res.json( final_data )
        
    } catch (error) {
        console.log("error in material", error)
    }
}





