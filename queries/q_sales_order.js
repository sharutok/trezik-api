const { execute_query } = require("../utils/oracle-connect")

exports.q_sales_order = async () => {
	try {
		const q = `
 SELECT
	--	ooh.header_id,
		ooh.org_id "plant",
		order_number  "order_no",
		ooh.invoice_to_org_id "buyer" ,
		ooh.cust_po_number "po_no",
		ooh.attribute6 "po_date",
		transactional_curr_code "document_currency",
		gdr.conversion_rate "exchange_rate",
		ooh.payment_term_id "payment_term",
	--	ooh.fob_point_code,
		ooh.freight_terms_code "inco_term_1",
		ordered_date "so_date",
		ooh.attribute5  "special_instruction",
	--	ooh.sold_to_org_id customer_id,
	--	ooh.ship_from_org_id,
	--	ooh.ship_to_org_id,
	--	ooh.invoice_to_org_id,
	--	ooh.creation_date,
	--	ooh.last_update_date,
	--	ooh.cancelled_flag,
	--	ooh.open_flag,
	--	ooh.booked_flag,
	--	ooh.flow_status_code,
	--	ooh.booked_date,
	--	ool.header_id,
		ool.inventory_item_id "material_code",
		ordered_item  "item_code",
		ool.ordered_quantity "quantity",
		ool.unit_selling_price "price",
	--	ool.unit_list_price ,
		ool.pricing_quantity_uom "unit_of_measurement",
		msi.description "material_description",
	--	ool.line_number,
		ool.ordered_quantity * ool.unit_selling_price "total",
	--	gdr.conversion_rate,
		null payment_term_text,
		null description_of_goods,
		null Port_of_Loading_Text,
		null order_validity_date,
		null packing_instruction
	FROM
		apps.oe_order_headers_all ooh,
		apps.oe_order_lines_all ool,
		apps.mtl_system_items_kfv msi,
		apps.gl_daily_rates gdr
	WHERE
		ooh.header_id = ool.header_id
		AND msi.inventory_item_id = ool.inventory_item_id
		AND ooh.ship_from_org_id = msi.organization_id
		AND trunc(gdr.conversion_date)= trunc(ooh.creation_date)
		AND gdr.from_currency = 'USD'
		AND gdr.conversion_type = '1000'
		AND ooh.ORDER_NUMBER = 10250155
		and rownum<=100
	ORDER BY
		line_number`
		const data = await execute_query(q)
		return data
		
	} catch (error) {
		console.log("error in excuting q_sales_order");
		
	}
}

//purchase