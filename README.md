# Project Setup and Commands

### Starting the Project

- **Command:** `npm start`
- **Description:** Starts the project on `localhost:3000`.

### Building the Project

- **Command:** `npm run build`
- **Description:** Builds the project into a static website, which is outputted to the `build` folder.

---

# Request and Response Formats

## Request Format

Example request format for networking, computing, database, storage, and security specifications:

```json
{
  "Networking": [
    "Shared VPC",
    "PublicService",
    "On-premise service",
    "NAT",
    "StaticWebCache",
    "On-premise"
  ],
  "Computing": ["Monolith", "number of cloud services <10", "Stateful", "GPU"],
  "Database": ["PostgreSQL", "Cache"],
  "Storage": ["LargeFileStorage", "Active/Active"],
  "Security": ["HighSecurity", "PersonalDataProtection"],
  "timestamp": "20240812104835123"
}
```

## Response Format

### Error Codes

| Error Content          |
| ---------------------- |
| user login error       |
| Bad Request LLM        |
| LLM Request Timeout    |
| internal compile error |

### Response Structure

#### Error Response

when error happen the response json need contain `errorCode`：

```json
{
  "errorMessage": "Error Content "
}
```

if no error

```json
{
  "s3_object_name": "xxx.png",
  "errorMessage": ""
}
```

example

```json
{
  "s3_object_name": "cloud.png",
  "errorMessage": ""
}
```
