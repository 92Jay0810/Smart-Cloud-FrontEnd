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
  "Security": ["HighSecurity", "PersonalDataProtection"]
}
```

## Response Format

### Error Codes

| Error Code ID | Error Content          |
| ------------- | ---------------------- |
| 101           | user login error       |
| 201           | Bad Request LLM        |
| 202           | LLM Request Timeout    |
| 301           | internal compile error |

### Response Structure

#### Error Response

when error happen the response json need contain `errorCode`：

```json
{
  "errorCode": "errorCodeID"
}
```

if no error

```json
{
  "imgsrc": "data:image/png;base64,base64EncodingString",
  "errorCode": ""
}
```

example

```json
{
  "imageSrc": "data:image/png;base64,iVBORw0KGgoAmQAAmQAAmQAAnECQEKP3G...466430 more characters",
  "errorCode": ""
}
```
