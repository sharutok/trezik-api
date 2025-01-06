const { execute_query } = require("../utils/oracle-connect")

//Import
exports.q_material = async () => {
    const q = `
            SELECT
            --aim.INVENTORY_ITEM_ID,
            aim.concatenated_segments "material_code",
            aim.DESCRIPTION "material_description",
            aim.PRIMARY_UOM_CODE "uom",
            (select max(b.reporting_code) from
            apps.jai_item_templ_hdr_v a,
            apps.jai_reporting_associations_v b
            where b.entity_id=a.template_hdr_id
            and b.effective_from is not null
            and b.effective_to is null
            and b.reporting_type_code='GST_HSN_CODE'
            and a.INVENTORY_ITEM_ID= aim.INVENTORY_ITEM_ID) "hsn_code"
            FROM
            apps.mtl_system_items_kfv aim
            where attribute1='IMPORTED'
            and organization_id in (83,93)
            and rownum<=1
            order by "material_code",inventory_item_id,description`
    const data = await execute_query(q)
    return data
}

//Export
exports.q_material_export = async () => {
    const q = `
            SELECT
            --aim.INVENTORY_ITEM_ID,
            aim.concatenated_segments  "material_code",
            aim.DESCRIPTION "material_description",
            --aim.INVENTORY_ITEM_STATUS_CODE,
           --CASE aim.INVENTORY_ITEM_STATUS_CODE
           --WHEN 'Active' THEN 'Y'
           --WHEN 'Inactive' THEN 'N'
            --END ENABLED_FLAG,
            (select max(b.reporting_code) from
            apps.jai_item_templ_hdr_v a,
            apps.jai_reporting_associations_v b
            where b.entity_id=a.template_hdr_id
            and b.effective_from is not null
            and b.effective_to is null
            and b.reporting_type_code='GST_HSN_CODE'
            and a.INVENTORY_ITEM_ID= aim.INVENTORY_ITEM_ID) "hsn_code",
            aim.PRIMARY_UOM_CODE "uom",
            aim.CATEGORY_ID,
            aim.DELIVERY_LEAD_TIME,
            aim.METHOD_OF_PACKING METHOD_OF_PACKING,
            aim.PACKING_SIZE STANDARD_PACK_SIZE,
            aim.BRAND_NAME BRAND_NAME,
            aim.AWS_CLASSIFICATION "AWS Code",
            aim.LENGTH LENGTH,
            aim.DIAMETER DIAMETER,
            aim.MINIMUM_ORDER_QUANTITY
            --aim.CREATION_DATE,
            --aim.LAST_UPDATE_DATE
            FROM
            AWL_COPS.COPS_ITEM_MASTER aim
            where
            aim.INVENTORY_ITEM_STATUS_CODE='Active'
            and aim.INVENTORY_ITEM_ID in (select cpl.INVENTORY_ITEM_ID from AWL_COPS.COPS_PRICE_LIST_DETAILS cpl where CURRENCY_CODE <>'INR')
   and rownum <=1`
    const data = await execute_query(q)
    return data
}