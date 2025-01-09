const { execute_query } = require("../utils/oracle-connect")

exports.q_purchase_order = async () => { 
    let final_data = []

    const unique_header_id = (await execute_query(po_unique_header_id()))?.response?.map(x => { return { HEADER_ID: x.HEADER_ID, VENDOR_ID:x.VENDOR_ID} })
    
    await Promise.all(
        unique_header_id?.map(async (x) => {

            const data1 = await execute_query(po_header(x))
            const data2 = await execute_query(po_lines(x))
            const data3=await execute_query(business_partners(x))
        
            data1?.response?.map(x => {
            x["material"] = data2?.response
            x["business_partners"] = data3?.response
            return x
            })  
            
        final_data.push(data1?.response)
    }))
    
    return final_data 
}

const po_unique_header_id= () => {
    return` 
           SELECT
           assa.vendor_site_id "VENDOR_ID",
            aa.po_header_id HEADER_ID
        --'Ador Welding Limited' "company"
        --  ,'2022' "company_code"
        --  ,ee.ORGANIZATION_ID "plant"
        --  ,hl_ship_to.location_code "ship_to_address"
        --  ,aa.SEGMENT1 "po_no"
        --  ,ff.vendor_name "vendor"
        --  --assa.ADDRESS_LINE1 || assa.ADDRESS_LINE2 || assa.ADDRESS_LINE3 || assa.city || assa.state || assa.country vendor_address,
        --  ,NULL "delivery_port"
        --  ,aa.CURRENCY_CODE "currency"
        --  ,aa.rate "currency_exchange_rate"
        --  ,dd.name "payment_term"
        --  ,flv.meaning "inco_term"
        --  ,NULL "mode_of_shipment"
        --  ,TO_CHAR (TRUNC (aa.CREATION_DATE),'DD-MON-YYYY') "po_date"
        --  ,aa.COMMENTS "remarks"
        --aa.po_header_id
        --       aa.CREATION_DATE,
        --       aa.LAST_UPDATE_DATE
    FROM
        apps.po_headers_all aa
        ,apps. ap_terms dd
       ,apps. hr_operating_units ee
        ,apps. ap_suppliers ff
        ,apps.ap_supplier_sites_All assa
        ,apps. fnd_lookup_values flv
       ,apps.hr_locations hl_ship_to
    WHERE 1=1
        AND aa.CURRENCY_CODE <> 'INR'
        AND aa.AUTHORIZATION_STATUS = 'APPROVED'
    --    AND bb.item_id = cc.inventory_item_id
        AND aa.terms_id = dd.term_id
       AND ee.organization_id = aa.org_id
        AND ff.vendor_id = aa.vendor_id
        AND flv.lookup_type IN ('FOB', 'FRIEGHT TERMS')
        and flv.tag = 'Y'
       AND flv.lookup_code = aa.fob_lookup_code
        AND assa.vendor_id = ff.vendor_id
        AND assa.ship_to_location_id = hl_ship_to.location_id
       and hl_ship_to.ship_to_location_id = aa.SHIP_TO_LOCATION_ID
       and aa.cancel_flag <> 'Y'
        --and aa.SEGMENT1 = 112502792
      AND rownum <= 3
        `
}

const po_header = (x) => {
    return  `
        SELECT
       ' Ador Welding Limited'                           "company",
       '2022'                                            "company_code",
       hl_ship_to.INVENTORY_ORGANIZATION_ID              "plant",
       hl_ship_to.location_code                          "ship_to_address",
       --aa.segment1                                       "po_no",
        hl_ship_to.INVENTORY_ORGANIZATION_ID||'-'||aa.segment1 "po_no",
       --ff.vendor_id,
       ff.vendor_name                                    "vendor"
       --assa.ADDRESS_LINE1 || assa.ADDRESS_LINE2 || assa.ADDRESS_LINE3 || assa.city || assa.state || assa.country vendor_address,
       ,
       NULL                            "delivery_port",
       aa.currency_code                                  "currency",
       aa.rate
       "currency_exchange_rate",
       dd.NAME                                           "payment_term",
       flv.meaning                                       "inco_term",
       NULL                                              "mode_of_shipment",
       To_char (Trunc (aa.creation_date), 'DD-MON-YYYY') "po_date",
       aa.comments                                       "remarks"
        --aa.po_header_id
        --       aa.CREATION_DATE,
        --       aa.LAST_UPDATE_DATE
        FROM   apps.po_headers_all aa,
       apps. ap_terms dd,
       apps. hr_operating_units ee,
       apps. ap_suppliers ff,
       apps.ap_supplier_sites_all assa,
       apps. fnd_lookup_values flv,
       apps.hr_locations hl_ship_to
        WHERE  1 = 1
       AND aa.currency_code <> 'INR'
       AND aa.authorization_status = 'APPROVED'
       --    AND bb.item_id = cc.inventory_item_id
       AND aa.terms_id = dd.term_id
       AND ee.organization_id = aa.org_id
       AND ff.vendor_id = aa.vendor_id
       AND flv.lookup_type IN ( 'FOB', 'FRIEGHT TERMS' )
       AND flv.tag = 'Y'
       AND flv.lookup_code = aa.fob_lookup_code
       AND assa.vendor_id = ff.vendor_id
       AND assa.ship_to_location_id = hl_ship_to.location_id
       AND hl_ship_to.ship_to_location_id = aa.ship_to_location_id
       -- and aa.SEGMENT1 = 412100917
       and aa.cancel_flag <> 'Y'
       and aa.po_header_id ='${x.HEADER_ID}'
       AND rownum <= 2
        `
}

const po_lines = (x) => {
        return `SELECT
               -- DISTINCT
                plla.PO_LINE_ID "item_code",
                cc.segment1|| '.'|| cc.segment2|| '.'|| cc.segment3|| '.'|| cc.segment4 "product_code",
                cc.description "product_name",
                bb.quantity "qty",
                cc.PRIMARY_UNIT_OF_MEASURE "measurement_unit",
            --  (
            --  SELECT
            --      DISTINCT MAX (jra.reporting_code)
            --  FROM
            --      apps.jai_item_templ_hdr jith,
            --      apps.jai_reporting_associations jra,
            --      apps.jai_regimes jr
            --  WHERE
            --      jith.template_hdr_id = jra.entity_id
            --      AND jra.reporting_usage = 'LR'
            --      AND jra.effective_to IS NULL
            --      AND jr.regime_id = jra.regime_id
            --      AND jr.regime_code = 'GST'
            --      AND jith.inventory_item_id = cc.inventory_item_id)
            --           HSN_CODE,
                ROUND ((bb.unit_price * bb.quantity),
                2)
                    "price"
            --  TO_CHAR (plla.NEED_BY_DATE,
            --  'DD-MON-YYYY')
            --           request_delivery_date,
--              , aa.po_header_id
--              ,bb.po_line_id
            --  aa.CREATION_DATE,
            --  aa.LAST_UPDATE_DATE
            FROM
                apps.po_headers_all aa,
                apps.po_lines_all bb,
                apps.mtl_system_items_b cc,
                apps.ap_terms dd,
                apps.hr_operating_units ee,
                apps.ap_suppliers ff,
            --    apps.ap_supplier_sites_All assa,
                apps.fnd_lookup_values flv,
           --    apps.hr_locations hl_ship_to,
                apps.PO_LINE_LOCATIONS_ALL plla
            WHERE
                aa.po_header_id = bb.po_header_id
--                and aa.segment1 = '412100917'
                AND aa.CURRENCY_CODE <> 'INR'
                AND aa.AUTHORIZATION_STATUS = 'APPROVED'
                and aa.cancel_flag <> 'Y'
                AND bb.item_id = cc.inventory_item_id
                AND aa.terms_id = dd.term_id
                AND ee.organization_id = aa.org_id
               AND ff.vendor_id = aa.vendor_id
                AND flv.lookup_type IN ('FOB', 'FRIEGHT TERMS')
                and flv.tag = 'Y'
                AND flv.lookup_code = aa.fob_lookup_code
            --    AND assa.vendor_id = ff.vendor_id
               -- AND assa.ship_to_location_id = hl_ship_to.location_id
                AND plla.po_header_id = aa.po_header_id
                AND plla.po_line_id = bb.po_line_id
                and plla.ship_to_organization_id =cc.organization_id
                -- and rownum <= 10
                and aa.po_header_id ='${x.HEADER_ID}'
                order by plla.PO_LINE_ID ASC  
                `
}

const business_partners = (x) => {
    return `
    SELECT DISTINCT
        '' "customer_code",
        assa.vendor_site_id "partner_code",
        aps.VENDOR_ID "vendor_code",
        'Ship-to location' "partner_type",
        aps.vendor_name "partner_name"
--        null "partner_address_1",
--        assa.address_line1  "partner_address_1",
        --assa.address_line2  "address2",
        --assa.address_line3  "address3",
        --assa.address_line4  "address4",
--        assa.zip  "zip code",
--        ftt.territory_short_name "country"
--        assa.state "state"
--        assa.city  "city"
--        apt.NAME  "payment_terms"
--        aps.invoice_currency_code "currency"
        --NULL "ie_code",
        --hz.person_first_name || person_middle_name || person_last_name  "person_name",
        --hz.email_address "person_email",
        --hz.primary_phone_number "person_number",
        -- (SELECT JPRL.REGISTRATION_NUMBER
        -- FROM
        -- apps.JAI_PARTY_REGS JPR,
        -- apps.JAI_PARTY_REG_LINES JPRL
        -- WHERE JPRL.PARTY_REG_ID = JPR.PARTY_REG_ID
        -- AND JPR.PARTY_SITE_ID = ASSA.VENDOR_SITE_ID
        -- AND JPR.PARTY_ID = aps.VENDOR_ID
        -- AND NVL(JPRL.EFFECTIVE_FROM, SYSDATE) <= SYSDATE --TO TAKE ACTIVE REG NUMBERS
        -- AND NVL(JPRL.EFFECTIVE_TO, SYSDATE) >= SYSDATE --TO TAKE ACTIVE REG NUMBERS
        -- AND REGISTRATION_TYPE_CODE = 'GST') "gst_number"
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
        AND assa.vendor_site_id = ${x.VENDOR_ID}
    `
}