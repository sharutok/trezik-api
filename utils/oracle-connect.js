const { default: axios } = require("axios")



exports.execute_query = async(query) => {
    try {
        const data = await axios.post("http://10.202.65.161:7777/query-execute", 
            {
                "host":process.env.ORACLE_DEV_HOST,
                "service":process.env.ORACLE_DEV_SERVICE,
                "username":process.env.ORACLE_DEV_USERNAME,
                "password":process.env.ORACLE_DEV_PASSWORD,
                "query": query
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.ORACLE_CONNECT_AUTHENTICATION_TOKEN}`
                }
        }
        )
        return data?.data
        
    } catch (error) {
        console.log("error in executing query");
    }
}
