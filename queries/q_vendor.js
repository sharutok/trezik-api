const { execute_query } = require("../utils/oracle-connect")

exports.q_vendor = async () => {
    const q = `
      SELECT DISTINCT hou.NAME                                       ou_name,
                  aps.vendor_name                                "company_name",
--                  DECODE (
--                      SIGN (NVL (aps.END_DATE_ACTIVE, SYSDATE + 1) - SYSDATE),
--                      -1, 'INACTIVE',
--                      'ACTIVE')                                  active_status,
--                  aps.vendor_id,
                  aps.segment1                                   "vendor_code",
--                  party_site_number,
--                  aps.enabled_flag,
--                  assa.vendor_site_id,
--                  assa.vendor_site_code,
                  assa.address_line1                             "address1",
                  assa.address_line2                             "address2",
                  assa.address_line3                             "address3",
                  assa.city                                      "city",
                  assa.state                                     "state",
                  hcpe.EMAIL_ADDRESS                             "company_email",
                  apt.NAME                                       "payment_terms",
                  aps.invoice_currency_code                      "currency",
                  ftt.territory_short_name                       "country",
--                  hps.party_site_name                            supplier_site_name,
--                  hl_ship_to.location_code                       ship_to_location,
--                  hl_bill_to.location_code                       bill_to_location,
                  NULL                                           "ie_code",
                  (SELECT hcp.email_address
                     FROM apps.hz_party_sites hps, apps.hz_contact_points hcp
                    WHERE     1 = 1
                          AND hcp.owner_table_name = 'HZ_PARTY_SITES'
                          AND hps.party_id = aps.party_id
                          AND hcp.owner_table_id = hps.party_site_id
                          AND hcp.contact_point_type = 'EMAIL'
                          AND ROWNUM <= 1)                       "email",
                  (SELECT JPRL.REGISTRATION_NUMBER
                     FROM apps.JAI_PARTY_REGS JPR, apps.JAI_PARTY_REG_LINES JPRL
                    WHERE     JPRL.PARTY_REG_ID = JPR.PARTY_REG_ID
                          AND JPR.PARTY_SITE_ID = ASSA.VENDOR_SITE_ID
                          AND JPR.PARTY_ID = aps.VENDOR_ID
                          AND NVL (JPRL.EFFECTIVE_FROM, SYSDATE) <= SYSDATE --TO TAKE ACTIVE REG NUMBERS
                          AND NVL (JPRL.EFFECTIVE_TO, SYSDATE) >= SYSDATE --TO TAKE ACTIVE REG NUMBERS
                          AND REGISTRATION_TYPE_CODE = 'GST')    "gst_number"
                      ,aps.CREATION_DATE
                      ,aps.LAST_UPDATE_DATE
    FROM apps.ap_suppliers         aps,
         apps.ap_supplier_sites_all assa,
         apps.hr_operating_units   hou,
         apps.ap_terms_tl          apt,
         apps.hz_contact_points    hcpe,
         apps.hz_party_sites       hps,
         apps.hr_locations         hl_ship_to,
         apps.fnd_territories_tl   ftt,
         apps.hr_locations         hl_bill_to
   WHERE     aps.vendor_id = assa.vendor_id
         AND HCPe.OWNER_TABLE_NAME = 'HZ_PARTY_SITES'
         AND HPS.PARTY_ID = aps.party_id
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
         AND ROWNUM <= 50
ORDER BY aps.vendor_name
    `
    const data = await execute_query(q)
    return data
}

//purchase