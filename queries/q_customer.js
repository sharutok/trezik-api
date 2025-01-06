const { execute_query } = require("../utils/oracle-connect")

exports.q_customer = async() => {
    const q = `
        SELECT
         ACCOUNT_NUMBER "customer_code",
        null "inco_term_1",
        null "inco_term_2",
         PARTY_NAME "customer_name",
         CURRENCY_CODE "currency",
         ADDRESS1 "address",
         ADDRESS2 "address2",
         ADDRESS3 "address3",
         ADDRESS4 "address4",
         COUNTRY "country",
         PRIMARY_PHONE_NUMBER "mobile",
         EMAIL_ADDRESS "customer_email",
         TO_CHAR(FIRST_NAME || '' ||LAST_NAME) "contact_person"
        FROM AWL_COPS.COPS_CUSTOMER_ACCOUNTS
        WHERE currency_code <> 'INR'
        AND STATUS='A' 
        and rownum<=1`
    
    const data =await execute_query(q)
    return data

}

