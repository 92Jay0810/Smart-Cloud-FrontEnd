# Project Setup and Commands

## Starting the Project

- **Command:** `npm start`
- **Description:** Starts the project on `localhost:3000 or Cloud`.

## Building the Project to Static File

- **Command:** `npm run build`
- **Description:** Builds the project into a static website, which is outputted to the `build` folder.

---

# Service Servey Request and Response Formats

## Normal Mode

### From Request Format

user fill out the From , send query to backend

```json
{
  "headers": {
    "authorizationToken": "idToken",
    "Content-Type": "application/json"
  },
  "body": {
    "query": {
      "0-0": "aws",
      "1-0": "SelfBuildVpc",
      "1-1": "OpenServiceYes",
      "1-2": "CloudDns",
      "1-3": "ExternalServiceYes",
      "1-4": "WebCacheYes",
      "1-5": "ConnectionOnpremise",
      "2-0": "ArchitectureNtier",
      "2-1": "ServiceLess10",
      "2-2": "Stateful",
      "2-3": "GpuYes",
      "3-0": "DatabasePostgreSql",
      "3-1": "DataCacheYes",
      "3-2": "HighAvailabilityYes",
      "4-0": "ShareStroageYes",
      "4-1": "DocumentOver2GbNo",
      "4-2": "StroageStandby",
      "5-0": "diagrams"
    },
    "session_id": "93ab9d74-de47-466d-aa95-bdef291bfed7",
    "timestamp": "20240816091444209",
    "user_id": "a9fac56c-a0b1-70f2-8745-2271e009c474",
    "tool": "diagrams"
  }
}
```

- authorizationToken for Api Gateway Authorizer sourceToken

### Response Format

#### Error Response

when error happen the response json need contain `errorCode`：

```json
{
  "headers": {
    "authorizationToken": "idToken",
    "Content-Type": "application/json"
  },
  "body": {
    "body": {
      "error_message": "Error Content "
    }
  }
}
```

#### Normal Response

with tool draw io

```json
{
  "body": {
    "error_message": "",
    "drawio_xml": ""
  }
}
```

with tool diagrams

```json
{
  "body": {
    "s3_object_name": "xxx.png",
    "error_message": "",
    "s3_python_code": ".."
  }
}
```

### Normal Mode Conversation

#### Request Format

with tool diagrams

```json
{
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "prompt": "user input message",
    "session_id": "1234567",
    "timestamp": "20240815155244",
    "user_id": "09003903222",
    "tool": "drawio"
  }
}
```

#### Response Format

```json
{
  "body": {
    "s3_object_name": "xxx.png",
    "errorMessage": "errorMessage",
    "s3_python_code": "..",
    "ai_message": "AIMessage for user"
  }
}
```

with tool draw io

```json
{
  "body": {
    "errorMessage": "errorMessage",
    "ai_message": "AIMessage for user"
  }
}
```

## Quick mode

### template select request

```json
{
  "headers": {
    "authorizationToken": "idToken",
    "Content-Type": "application/json"
  },
  "body": {
    "template": "website",
    "session_id": "93ab9d74-de47-466d-aa95-bdef291bfed7",
    "timestamp": "20240816091444209",
    "user_id": "a9fac56c-a0b1-70f2-8745-2271e009c474",
    "tool": "diagrams"
  }
}
```

### template select response

```json
{
  "body": {
    "s3_object_name": "xxx.png",
    "errorMessage": "errorMessage",
    "s3_python_code": "..",
    "ai_message": "AIMessage for user"
  }
}
```
