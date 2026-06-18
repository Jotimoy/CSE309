# Non-Functional Requirements

- **Performance**: Image processing and OCR extraction should take no more than 3 seconds per image under normal network conditions.
- **Scalability**: The system must be capable of supporting up to 100 concurrent warehouse staff users and tracking up to 100,000 unique SKUs.
- **Availability**: The system should have an uptime of 99.9%, as warehouse operations cannot easily halt during business hours.
- **Security**: All user passwords must be hashed. Data in transit should be encrypted using TLS/SSL (HTTPS).
- **Usability**: The mobile interface for staff must have large buttons and high contrast to ensure ease of use in diverse warehouse lighting conditions.