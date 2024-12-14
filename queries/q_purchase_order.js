const { execute_query } = require("../utils/oracle-connect")

exports.q_purchase_order = async() => {
    const q = `
      SELECT
    DISTINCT
       'Ador Welding Limited'
           "company",
    ee.name
           "plant",
    aa.SEGMENT1
           "po_no",
--  TO_CHAR (TRUNC (aa.CREATION_DATE),'DD-MON-YYYY')po_date,
    ff.vendor_name "vendor",
--  NULL Delivery_port,
    aa.CURRENCY_CODE "currency",
    aa.rate "currency_exchange_rate",
    dd.name "payment_term",
    flv.meaning "inco_term",
    NULL "mode_of_shipment",
    cc.segment1
       || '.'
       || cc.segment2
       || '.'
       || cc.segment3
       || '.'
       || cc.segment4
           "item_code",
    cc.description
           "product_name",
    bb.quantity "qty",
    cc.PRIMARY_UNIT_OF_MEASURE
           "measurement_unit" ,
    (
    SELECT
        DISTINCT max(jra.reporting_code)
    FROM
        apps.jai_item_templ_hdr jith,
        apps.jai_reporting_associations jra,
        apps.jai_regimes jr
    WHERE
        jith.template_hdr_id = jra.entity_id
        AND jra.reporting_usage = 'LR'
        AND jra.effective_to IS NULL
        AND jr.regime_id = jra.regime_id
        AND jr.regime_code = 'GST'
        AND jith.inventory_item_id = cc.inventory_item_id)
           "hsn_code",
    ROUND ((bb.unit_price * bb.quantity),
    2)
           "price"
FROM
    apps.po_headers_all aa,
    apps.po_lines_all bb,
    apps.mtl_system_items_b cc,
    apps.ap_terms dd,
    apps.hr_operating_units ee,
    apps.po_vendors ff,
    apps.fnd_lookup_values flv
WHERE
    aa.po_header_id = bb.po_header_id
    AND aa.CURRENCY_CODE <> 'INR'
    AND bb.item_id = cc.inventory_item_id
    AND aa.terms_id = dd.term_id
    AND ee.organization_id = aa.org_id
    AND ff.vendor_id = aa.vendor_id
    AND flv.lookup_type = 'FOB'
    AND flv.lookup_code = aa.fob_lookup_code
    and rownum <=1`
    const data = await execute_query(q)
    return data
}