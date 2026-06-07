export const REQUIRED_FIELDS = {
  product: [
    'product_id',
    'color',
    'listing_price',
    'cost_price',
    'gender',
    'detail_product_group',
    'size',
    'age_group',
    'activity_group',
    'lifestyle_group',
  ],
  'sale-report': ['product_id', 'sold_quantity', 'distribution_channel', 'branch_id', 'month'],
  'inventory-report': ['product_id', 'plant', 'calendar_year_week', 'quantity'],
};

export type EntityType = 'product' | 'sale-report' | 'inventory-report';

/**
 * Pattern function to check if the input Excel file contains fields matching the corresponding entity.
 * @param headers List of actual headers extracted from the Excel file
 * @param entityType The entity type ('product', 'sale-report', 'inventory-report')
 */
export function validateExcelHeaders(
  headers: string[],
  entityType: EntityType,
): { isValid: boolean; missingFields: string[] } {
  const requiredFields = REQUIRED_FIELDS[entityType];
  if (!requiredFields) {
    return {
      isValid: false,
      missingFields: [`Unknown entity type: ${entityType}`],
    };
  }

  const lowerHeaders = headers.map((h) => h.trim().toLowerCase());
  const missingFields = requiredFields.filter((field) => {
    const f = field.toLowerCase();
    if (f === 'calendar_year_week') {
      return (
        !lowerHeaders.includes('calendar_year_week') && !lowerHeaders.includes('calendar_yeer_week')
      );
    }
    return !lowerHeaders.includes(f);
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
