const { execute_query } = require("../utils/oracle-connect")

exports.q_patner = async () => {
    const q = `
    SELECT
    cca.ACCOUNT_NUMBER "partner_code",
    ccs.SITE_USE_ID "partner",
    cca.EMAIL_ADDRESS "partner_email_id",
    --cca.PARTY_NAME "partner",
    --ccs.CUST_ACCOUNT_ID "partner_code",
    ccs.LOCATION_ID,
    ccs.LOCATION,
    ccs.SITE_USE_ID,
    ccs.SITE_USE_CODE,
    ccs.STATUS,
    ccs.ADDRESS1 "partner_address_1",
    ccs.ADDRESS2 "partner_address_2",
    ccs.ADDRESS3 "partner_address_3",
    ccs.ADDRESS4 "partner_address_4",
    ccs.CITY "city",
    --ccs.STATE,
    --ccs.POSTAL_CODE,
    ccs.COUNTRY "country"
    --ccs.ATTRIBUTE1 TYPE,
    --ccs.ATTRIBUTE2 GST,
    --ccs.OPERATING_UNIT_ID,
    --cod.ORGANIZATION_ID,
    --cca.currency_code
    FROM
    apps.cops_customer_accounts cca,
    apps.cops_customer_sites ccs,
    apps.HZ_CUST_SITE_USES_ALL hcsua,
    apps.jai_party_regs jpr,
    apps.cops_organization_definitions cod
    WHERE
    1 = 1
    AND cca.cust_Account_id = ccs.cust_Account_id
    AND ccs.SITE_USE_ID = hcsua.SITE_USE_ID
    AND hcsua.cust_acct_site_id = jpr.party_site_id
    AND cod.operating_unit_id = jpr.org_id
    AND jpr.item_category_list LIKE '%' || cod.ORGANIZATION_CODE || '%'
    AND cca.currency_code = 'USD'
    AND ccs.STATUS='A'
    AND rownum <=10`
    const data = await execute_query(q)
    return data
}

//purchase