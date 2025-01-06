const { execute_query } = require("../utils/oracle-connect")

// Customer Sites
exports.q_patner_customer = async () => {
    const q = `
    SELECT
    ccs.SITE_USE_ID "partner_code",
    --ccs.SITE_USE_ID "partner_firm_name",
    cca.PARTY_NAME "partner_firm_name",
    cca.EMAIL_ADDRESS "partner_email_id",
    --cca.PARTY_NAME "partner",
    --ccs.CUST_ACCOUNT_ID "partner_code",
    --ccs.LOCATION_ID,
    --ccs.LOCATION,
    --ccs.SITE_USE_ID,
    --ccs.SITE_USE_CODE "patner",
     CASE ccs.SITE_USE_CODE
           WHEN 'BILL_TO' THEN 'Bill-to party'
           WHEN 'SHIP_TO' THEN 'Ship-to party'
            END "partner",
    --ccs.STATUS,
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
    AND cca.currency_code <> 'INR'
    AND ccs.STATUS='A'
    AND rownum <=1`
    const data = await execute_query(q)
    return data
}

//Vendor or Supplier Sites
exports.q_patner_vendor = async () => {
    const q = `    
SELECT DISTINCT
assa.vendor_site_id "partner_code",
'Ship-to location' "partner",
aps.vendor_name "partner_firm_name",
null "partner_address_1",
assa.address_line1  "partner_address_1",
--assa.address_line2  "address2",
--assa.address_line3  "address3",
--assa.address_line4  "address4",
assa.zip  "zip code",
ftt.territory_short_name "country",
assa.state "state",
assa.city  "city",
apt.NAME  "payment_terms",
aps.invoice_currency_code "currency",
--NULL "ie_code",
--hz.person_first_name || person_middle_name || person_last_name  "person_name",
--hz.email_address "person_email",
--hz.primary_phone_number "person_number",
(SELECT JPRL.REGISTRATION_NUMBER
FROM
apps.JAI_PARTY_REGS JPR,
apps.JAI_PARTY_REG_LINES JPRL
WHERE JPRL.PARTY_REG_ID = JPR.PARTY_REG_ID
AND JPR.PARTY_SITE_ID = ASSA.VENDOR_SITE_ID
AND JPR.PARTY_ID = aps.VENDOR_ID
AND NVL(JPRL.EFFECTIVE_FROM, SYSDATE) <= SYSDATE --TO TAKE ACTIVE REG NUMBERS
AND NVL(JPRL.EFFECTIVE_TO, SYSDATE) >= SYSDATE --TO TAKE ACTIVE REG NUMBERS
AND REGISTRATION_TYPE_CODE = 'GST') "gst_number"
--aps.CREATION_DATE,
--aps.LAST_UPDATE_DATE,
--hou.NAME "ou_name",
--hps.party_site_name "partner",
--hl_ship_to.location_code  "ship_to_location",
--hl_bill_to.location_code  "bill_to_location",
--party_site_number,
--aps.enabled_flag,
--assa.vendor_site_id,
--assa.vendor_site_code,
--DECODE(SIGN(NVL(aps.END_DATE_ACTIVE, SYSDATE + 1) - SYSDATE),-1, 'INACTIVE','ACTIVE') active_status,
--aps.vendor_id
FROM apps.ap_suppliers         aps,
apps.ap_supplier_sites_all assa,
apps.hr_operating_units   hou,
apps.ap_terms_tl          apt,
apps.hz_contact_points    hcpe,
apps.hz_parties                hz,
apps.hz_party_sites       hps,
apps.hr_locations         hl_ship_to,
apps.fnd_territories_tl   ftt,
apps.hr_locations         hl_bill_to
WHERE aps.vendor_id = assa.vendor_id
AND HCPe.OWNER_TABLE_NAME = 'HZ_PARTY_SITES'
AND HPS.PARTY_ID = aps.party_id
AND hz.party_id = aps.party_id
AND HCPe.PRIMARY_FLAG = 'Y'
AND HPS.STATUS = 'A'
AND HCPe.OWNER_TABLE_ID = HPS.PARTY_SITE_ID
AND HCPe.CONTACT_POINT_TYPE = 'EMAIL'
AND aps.END_DATE_ACTIVE IS NULL
AND aps.invoice_currency_code <> 'INR'
AND assa.country = ftt.territory_code
AND assa.org_id = hou.organization_id
AND assa.terms_id = apt.term_id
AND assa.ship_to_location_id = hl_ship_to.location_id
AND assa.bill_to_location_id = hl_bill_to.location_id
AND ROWNUM <= 1`
    const data = await execute_query(q)
    return data
    
}