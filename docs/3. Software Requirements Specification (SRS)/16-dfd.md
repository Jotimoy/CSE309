# Data Flow Diagram (DFD)

## Level 0 (Context Diagram)
- **External Entities**: Staff, Manager, System.
- **Flow**: 
  - Staff -> (Uploads Image/Data) -> System
  - System -> (Returns Extracted Text/Status) -> Staff
  - Manager -> (Requests Report) -> System
  - System -> (Delivers Dashboard Data) -> Manager

## Level 1 Diagram
- **Process 1**: Image Processing
  - Receives image from Staff. Sends to OCR Engine. OCR Engine returns text data.
- **Process 2**: Inventory Update
  - Receives text data. Updates Database. 
- **Process 3**: Alert Generation
  - Database triggers check. If stock low, sends alert to Manager.