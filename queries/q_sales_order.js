const { execute_query } = require("../utils/oracle-connect")

exports.q_sales_order = async () => {
	let final_data = []
	const bill_to_and_ship_to = []
	
	const data = await execute_query(q())
	
	const unique = data?.response?.map(x => {
		
		bill_to_and_ship_to.push( x.SHIP_TO, x.BILL_TO)
		
		return ({
			HEADER_ID: x.HEADER_ID,
			PARTY_NAME: x.PARTY_NAME,
	
		})
	})
	
	const data3 = await Promise.all(bill_to_and_ship_to.map(async (x) => {	
		const a = await execute_query(q3(x))
		return a?.response[0]
	}))
	

	await Promise.all(unique.map(async (x) => {
		const data1 = await execute_query(q1(x))
		const data2 = await execute_query(q2(x))


		data1?.response?.map(x => {
			x["material"] = data2?.response?.length ? data2?.response : []	
			x["business_partner"] = data3?.length ? data3 : []
			return x
		})
		final_data.push(...data1?.response)
	}))
	return final_data
}

// unique id
const q = () => {
	return `
	SELECT
	hp.party_name,
	ooh.ship_to_org_id SHIP_TO,
	ooh.invoice_to_org_id BILL_TO,
	ooh.header_id
	--ooh.creation_date,
	--ooh.last_update_date,
		FROM
	apps.oe_order_headers_all ooh,
	apps.gl_daily_rates gdr,
	apps.hz_cust_accounts hca,
	apps.hz_parties hp,
	apps.hr_operating_units hou
	WHERE
	hou.organization_id = ooh.org_id
	AND TRUNC(gdr.conversion_date) = TRUNC(ooh.creation_date)
	AND hca.cust_account_id = ooh.sold_to_org_id
	AND hca.party_id = hp.party_id
	AND gdr.from_currency = transactional_curr_code
	AND gdr.from_currency <> 'INR'
	AND gdr.conversion_type = '1000'
	AND ooh.cust_po_number IS NOT null
	--and order_number='10250213'
	and ooh.CANCELLED_FLAG <> 'Y'
	AND rownum <= 10`
}

// header
const q1 = (x) => {
	return `
		SELECT
        hca.account_number "buyer_code",
        -- ooh.org_id plant,
        'Ador Welding Limited' "company",
--      hou.name "plant",
        ooh.SHIP_FROM_ORG_ID "plant",
        order_number "order_no",
        hp.party_name "buyer",
        ooh.cust_po_number "po_no",
        ooh.attribute6 "po_date",
        transactional_curr_code "document_currency",
        gdr.conversion_rate "exchange_rate",
        --ooh.payment_term_id "payment_term",
        apps.rt.name "payment_term",
        ooh.fob_point_code "inco_term_1",
        --ooh.freight_terms_code ,
        ordered_date "so_date",
        ooh.attribute5 "special_instruction",
        -- ooh.sold_to_org_id "customer_id",
        --ooh.ship_to_org_id "place_of_delivery",
        ccs.city "place_of_delivery",
        'NA' "vessel_flight_no",
        'NA' "port_of_loading",
        'NA' "port_of_dispatch_text",
        --ooh.ship_to_org_id "final_destination",
        ccs.city "final_destination",
        --'NA' "country_final_destination"
        ccs.country "country_final_destination"
        --ooh.ship_from_org_id 
        --ooh.invoice_to_org_id 
        -- ooh.creation_date
        -- ooh.last_update_date,
        -- ooh.cancelled_flag,
        -- ooh.open_flag,
        -- ooh.booked_flag,
        -- ooh.flow_status_code,
        -- ooh.booked_date,
        -- gdr.conversion_rate
        FROM
        apps.oe_order_headers_all ooh,
        apps.gl_daily_rates gdr,
        apps.hz_parties hp,
        apps.hz_cust_accounts hca,
        apps.hr_operating_units hou,
        apps.cops_customer_sites ccs,
        apps.ra_terms rt
        WHERE
        1=1
        AND rt.TERM_ID=ooh.payment_term_id
        AND hou.organization_id = ooh.org_id
        AND TRUNC (gdr.conversion_date) = TRUNC (ooh.creation_date)
        AND hca.cust_account_id = ooh.sold_to_org_id
        AND hca.party_id = hp.party_id
        AND gdr.from_currency = transactional_curr_code
        AND gdr.from_currency <> 'INR'
        AND gdr.conversion_type = '1000'
        AND ccs.SITE_USE_ID=ooh.ship_to_org_id
		and ooh.CANCELLED_FLAG <> 'Y'
       	and ooh.header_id='${x.HEADER_ID}'`
 } 


// LINES
const q2 = (x) => {
	return `
		SELECT
		--ooh.header_id,
		--	ooh.org_id plant,
		hou.name "plant",
		--	order_number order_no,
		--	hp.party_name buyer,
		ool.inventory_item_id "item_code",
		ordered_item "material_code",
		ool.ordered_quantity "quantity",
		ool.unit_selling_price "price",
		--	ool.unit_list_price,
		ool.pricing_quantity_uom "unit_of_measurement",
		msi.description "material"
		--	ool.line_number,
		--	ool.ordered_quantity * ool.unit_selling_price total
		--	gdr.conversion_rate
		FROM
		apps.oe_order_headers_all ooh,
		apps.oe_order_lines_all ool,
		apps.mtl_system_items_kfv msi,
		apps.gl_daily_rates gdr,
		apps.hz_cust_accounts hca,
		apps.hz_parties hp,
		apps.hr_operating_units hou
		WHERE
		ooh.header_id = ool.header_id
		AND hou.organization_id = ooh.org_id
		AND msi.inventory_item_id = ool.inventory_item_id
		AND ool.ship_from_org_id = msi.organization_id
		AND TRUNC (gdr.conversion_date) = TRUNC (ooh.creation_date)
		AND hca.cust_account_id = ooh.sold_to_org_id
		AND hca.party_id = hp.party_id
		AND gdr.from_currency = transactional_curr_code
		AND gdr.from_currency <> 'INR'
		AND gdr.conversion_type = '1000'
		and ooh.CANCELLED_FLAG <> 'Y'
		and ool.flow_status_code <> 'CANCELLED'
		and ooh.header_id='${x.HEADER_ID}'
		` }

// business patner
const q3 = (x) => {
	return `
			SELECT
    '' "vendor_code",
    --ccs.SITE_USE_ID "customer_code",
    cca.ACCOUNT_NUMBER "customer_code",
    ccs.SITE_USE_ID "partner_code",
    cca.PARTY_NAME "partner_name",
    --cca.EMAIL_ADDRESS "partner_email_id",
    --cca.PARTY_NAME "partner",
    --ccs.CUST_ACCOUNT_ID ,
    --ccs.LOCATION_ID,
    --ccs.LOCATION,
    --ccs.SITE_USE_ID,
    --ccs.SITE_USE_CODE "patner",
     CASE ccs.SITE_USE_CODE
           WHEN 'BILL_TO' THEN 'Bill-to party'
           WHEN 'SHIP_TO' THEN 'Ship-to party'
            END "partner_type"
    -- ccs.STATUS,
    -- ccs.ADDRESS1 "partner_address_1",
    -- ccs.ADDRESS2 "partner_address_2",
    -- ccs.ADDRESS3 "partner_address_3",
    -- ccs.ADDRESS4 "partner_address_4",
    --ccs.CITY "city",
    --ccs.STATE,
    --ccs.POSTAL_CODE,
    --ccs.COUNTRY "country"
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
		AND ccs.SITE_USE_ID = '${x}'
		` }



