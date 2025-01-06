const { execute_query } = require("../utils/oracle-connect")

// unique id
const q = () => {
	return `
	SELECT
	hp.party_name,
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
	AND rownum <= 2
	`
}

// header
const q1 = (HEADER_ID) => {
	return `
				SELECT
		hca.account_number "buyer_code",
		-- ooh.org_id plant,
		'Ador Welding Limited' "company",
		hou.name "plant",
		order_number "order_no",
		hp.party_name "buyer",
		ooh.cust_po_number "po_no",
		ooh.attribute6 "po_date",
		transactional_curr_code "document_currency",
		gdr.conversion_rate "exchange_rate",
		--ooh.payment_term_id "payment_term",
		'30 NET' "payment_term",
		ooh.fob_point_code "inco_term_1",
		--ooh.freight_terms_code ,
		ordered_date "so_date",
		ooh.attribute5 "special_instruction",
		-- ooh.sold_to_org_id "customer_id",
		ooh.ship_to_org_id "place_of_delivery",
		'NA' "vessel_flight_no",
		'NA' "port_of_loading",
		'NA' "port_of_dispatch_text",
		ooh.ship_to_org_id "final_destination",
		'NA' "country_final_destination"
		-- ooh.ship_from_org_id,
		-- ooh.invoice_to_org_id
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
		apps.hr_operating_units hou
		WHERE
		hou.organization_id = ooh.org_id
		AND TRUNC (gdr.conversion_date) = TRUNC (ooh.creation_date)
		AND hca.cust_account_id = ooh.sold_to_org_id
		AND hca.party_id = hp.party_id
		AND gdr.from_currency = transactional_curr_code
		AND gdr.from_currency <> 'INR'
		AND gdr.conversion_type = '1000'
		and ooh.header_id='${HEADER_ID}'
		`
 } 


// business patner
const q3 = (PARTY_NAME) => {
	return `
			SELECT
		cca.PARTY_NAME "partner_name",
			CASE ccs.SITE_USE_CODE
			WHEN 'BILL_TO' THEN 'Bill-to party'
			WHEN 'SHIP_TO' THEN 'Ship-to party'
				END "partner_type"
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
		AND cca.PARTY_NAME='${PARTY_NAME}'
		` }



// LINES
const q2 = (HEADER_ID) => {
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
		and ooh.header_id='${HEADER_ID}'
		` }


// exports.q_sales_order = async () => {
// 	try {
// 		const q = `
//  	SELECT
// 	ooh.header_id,
// 	ooh.org_id "plant",
// 	hou.name,
// 	order_number "order_no",
// 	hp.party_name "buyer",
// 	ooh.cust_po_number "po_no",
// 	ooh.attribute6 "po_date",
// 	transactional_curr_code "document_currency",
// 	gdr.conversion_rate "exchange_rate",
// 	ooh.payment_term_id "payment_term",
// 	ooh.fob_point_code,
// 	ooh.freight_terms_code,
// 	ordered_date so_date,
// 	ooh.attribute5 Additioanl_Remarks,
// 	ooh.sold_to_org_id customer_id,
// 	ooh.ship_from_org_id,
// 	ooh.ship_to_org_id,
// 	ooh.invoice_to_org_id,
// 	ooh.creation_date,
// 	ooh.last_update_date,
// 	ooh.cancelled_flag,
// 	ooh.open_flag,
// 	ooh.booked_flag,
// 	ooh.flow_status_code,
// 	ooh.booked_date,
// 	--ool.header_id,
// 	ool.inventory_item_id,
// 	ordered_item item_code,
// 	ool.ordered_quantity,
// 	ool.unit_selling_price,
// 	ool.unit_list_price,
// 	ool.pricing_quantity_uom,
// 	msi.description item_description,
// 	ool.line_number,
// 	ool.ordered_quantity * ool.unit_selling_price total,
// 	gdr.conversion_rate
// FROM
// 	apps.oe_order_headers_all ooh,
// 	apps.oe_order_lines_all ool,
// 	apps.mtl_system_items_kfv msi,
// 	apps.gl_daily_rates gdr,
// 	apps.hz_cust_accounts hca,
// 	apps.hz_parties hp,
// 	apps.hr_operating_units hou
// WHERE
// 	ooh.header_id = ool.header_id
// 	AND hou.organization_id = ooh.org_id
// 	AND msi.inventory_item_id = ool.inventory_item_id
// 	AND ooh.ship_from_org_id = msi.organization_id
// 	AND trunc(gdr.conversion_date)= trunc(ooh.creation_date)
// 	AND hca.cust_account_id = ooh.sold_to_org_id
// 	AND hca.party_id = hp.party_id
// 	AND gdr.from_currency = transactional_curr_code
// 	AND gdr.from_currency <> 'INR'
// 	AND gdr.conversion_type = '1000'
// 	AND ooh.ORDER_NUMBER = 10250155
// ORDER BY
// 	line_number
// 	-- hz_cust_accounts  cus.awl_customer_details_mv  all_objects hz_partIES`
// 		const data = await execute_query(q)
// 		return data
// 	} catch (error) {
// 		console.log("error in excuting q_sales_order");
// 	}
// }

exports.q_sales_order = async () => {
	let final_data = []
	const data = await execute_query(q)
	const unique_ = []
	data?.response?.map(x => {
		unique_.push({ HEADER_ID: x.HEADER_ID, PARTY_NAME: x.PARTY_NAME })
	})

	await Promise.all(unique_.map(async (x) => {
		const data1 = await execute_query(q1(x.HEADER_ID))
		const data2 = await execute_query(q2(x.HEADER_ID))
		const data3 = await execute_query(q3(x.PARTY_NAME))

		data1?.response?.map(x => {
			x["material"] = data2?.response
			x["business_partner"] = data3?.response
			return x
		})
		final_data.push(...data1?.response)
	}))
	return final_data
}
