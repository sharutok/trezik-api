const { execute_query } = require("../utils/oracle-connect")


exports.q_vendor = async () => {
    const q = `
        SELECT DISTINCT aps.vendor_name "company_name",
    NVL(
        SUBSTR(hcpe.EMAIL_ADDRESS, 1 , INSTR(hcpe.EMAIL_ADDRESS, ';')),
        hcpe.EMAIL_ADDRESS
        ) "company_email",
        --aps.CREATION_DATE,
        --aps.LAST_UPDATE_DATE,
        --DECODE
        --      (SIGN(NVL(aps.END_DATE_ACTIVE, SYSDATE + 1) - SYSDATE),
        --            -1, 'INACTIVE',
        --        'ACTIVE') active_status,
        aps.vendor_id "vendor_code"
        FROM
        apps.ap_suppliers         aps,
        apps.hz_contact_points    hcpe,
        apps.hz_party_sites       hps
        WHERE
        HCPe.OWNER_TABLE_NAME = 'HZ_PARTY_SITES'
        AND HPS.PARTY_ID = aps.party_id
        AND HCPe.PRIMARY_FLAG = 'Y'
        AND HPS.STATUS = 'A'
        AND HCPe.OWNER_TABLE_ID = HPS.PARTY_SITE_ID
        AND HCPe.CONTACT_POINT_TYPE = 'EMAIL'
        AND aps.END_DATE_ACTIVE IS NULL
        AND aps.invoice_currency_code <> 'INR'
        AND ROWNUM <= 2
        ORDER BY aps.vendor_name`
            const data = await execute_query(q)
            return data
        }
        