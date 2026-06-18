# Acceptance Criteria

## User Story: OCR Label Scanning
- **Scenario**: Staff scans a product label.
- **Given**: The user is on the "Scan Item" page with camera permissions enabled.
- **When**: The user captures an image of a clear product label.
- **Then**: The system should extract the text and populate the input fields within 3 seconds. The accuracy of the OCR must be at least 95% on clear images.

## User Story: Low Stock Alerts
- **Scenario**: An item falls below its reorder threshold.
- **Given**: The item "Widget A" has a minimum threshold of 50.
- **When**: The stock level drops to 49 after a transaction.
- **Then**: An automated alert should be immediately displayed on the Manager's dashboard and an email dispatched.