# Project Setup and Commands

## Starting the Project

- **Command:** `npm start`
- **Description:** Starts the project on `localhost:3000`.

## Building the Project to Static File

- **Command:** `npm run build`
- **Description:** Builds the project into a static website, which is outputted to the `build` folder.

---

# Service Servey Request and Response Formats

## Request Format

Example request format for networking, computing, database, storage, and security specifications:

```json
{
  "body": {
    "Networking": [
      "Shared VPC",
      "PublicService",
      "On-premise service",
      "NAT",
      "StaticWebCache",
      "On-premise"
    ],
    "Computing": [
      "Monolith",
      "number of cloud services <10",
      "Stateful",
      "GPU"
    ],
    "Database": ["PostgreSQL", "Cache"],
    "Storage": ["LargeFileStorage", "Active/Active"],
    "Security": ["HighSecurity", "PersonalDataProtection"],
    "timestamp": "20240812104835123"
  }
}
```

## Response Format

### Error Content

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

#### Normal Response

if no error

```json
{
  "body": {
    "s3_object_name": "xxx.png",
    "errorMessage": ""
  }
}
```

example

```json
{
  "body": {
    "s3_object_name": "aws_frontend_test.png",
    "errorMessage": "",
    "AIMessage": "成功修改您的要求"
  }
}
```

# Conversation Request and Response Formats

## Request Format

```json
{
  "body": {
    "prompt": "user input message"
  }
}
```

## Response Format

```json
{
  "body": {
    "s3_object_name": "xxx.png",
    "errorMessage": "errorMessage",
    "AIMessage": "AIMessage for user"
  }
}
```
