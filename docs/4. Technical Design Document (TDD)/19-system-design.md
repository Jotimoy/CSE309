# System Design

## Architecture Overview
The system will follow a modern Client-Server Architecture (3-Tier).

1. **Presentation Layer (Frontend)**: A responsive Web App built with React.js or Vue.js, optimized for mobile devices (for scanning).
2. **Application Layer (Backend)**: A RESTful API server built with Node.js/Express or Python/FastAPI. Python is highly recommended to easily integrate with ML/OCR libraries like Tesseract or OpenCV.
3. **Data Layer**: A relational database, such as PostgreSQL or MySQL, ensuring ACID compliance for reliable inventory transactions.

## Third-party Integrations
- **Cloud Storage**: AWS S3 or Google Cloud Storage for temporarily storing images during OCR processing.