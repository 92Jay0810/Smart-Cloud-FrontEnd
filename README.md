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

| categoryid-questionid | optionid                  |
| --------------------- | ------------------------- |
| 0-0                   | SharedVpc                 |
| 0-0                   | SelfBuildVpc              |
| 0-1                   | OpenServiceYes            |
| 0-1                   | OpenServiceNo             |
| 0-2                   | CloudDns                  |
| 0-2                   | SelfBuildDns              |
| 0-2                   | DnsNo                     |
| 0-3                   | ExternalServiceYes        |
| 0-3                   | ExternalServiceNo         |
| 0-4                   | WebCacheYes               |
| 0-4                   | WebCacheNo                |
| 0-5                   | ConnectionOnpremise       |
| 0-5                   | ConnectionSamePlatform    |
| 0-5                   | ConnectionCrossPlatform   |
| 1-0                   | ArchitectureMicroservices |
| 1-0                   | ArchitectureNtier         |
| 1-0                   | ArchitectureEbaf          |
| 1-0                   | ArchitectureMonolith      |
| 1-1                   | ServiceLess10             |
| 1-1                   | ServiceOver10             |
| 1-2                   | Stateful                  |
| 1-2                   | Statless                  |
| 1-3                   | GpuYes                    |
| 1-3                   | GpuNo                     |
| 2-0                   | DatabasePostgreSql        |
| 2-0                   | DatabaseMysql             |
| 2-0                   | DatabaseMssql             |
| 2-0                   | DatabaseNoSql             |
| 2-1                   | DataCacheYes              |
| 2-1                   | DataCacheNo               |
| 2-2                   | HighAvailabilityYes       |
| 2-2                   | HighAvailabilityNo        |
| 3-0                   | ShareStroageYes           |
| 3-0                   | ShareStroageNo            |
| 3-1                   | DocumentOver1GbYes        |
| 3-1                   | DocumentOver2GbNo         |
| 3-2                   | StorageActive             |
| 3-2                   | StroageStandby            |
| 4-0                   | HsmYes                    |
| 4-0                   | HsmNo                     |
| 4-1                   | HighSecuityYes            |
| 4-1                   | HighSecuityNo             |
| 4-2                   | PersonalInformationYes    |
| 4-2                   | PersonalInformationNo     |

Example request format for networking, computing, database, storage, and security specifications:

```json
{
  "headers": {
    "authorizationToken": "idToken",
    "Content-Type": "application/json"
  },
  "body": {
    "body": {
      "query": {
        "0-0": "SelfBuildVpc",
        "0-1": "OpenServiceYes",
        "0-2": "CloudDns",
        "0-3": "ExternalServiceYes",
        "0-4": "WebCacheYes",
        "0-5": "ConnectionOnpremise",
        "1-0": "ArchitectureNtier",
        "1-1": "ServiceLess10",
        "1-2": "Stateful",
        "1-3": "GpuYes",
        "2-0": "DatabasePostgreSql",
        "2-1": "DataCacheYes",
        "2-2": "HighAvailabilityYes",
        "3-0": "ShareStroageYes",
        "3-1": "DocumentOver2GbNo",
        "3-2": "StroageStandby",
        "4-0": "HsmYes",
        "4-1": "HighSecuityYes",
        "4-2": "PersonalInformationNo"
      },
      "session_id": "93ab9d74-de47-466d-aa95-bdef291bfed7",
      "timestamp": "20240816091444209",
      "user_id": "a9fac56c-a0b1-70f2-8745-2271e009c474",
      "verify": "true"
    }
  }
}
```

- authorizationToken for Api Gateway Authorizer sourceToken

## Response Format

### Error Response

when error happen the response json need contain `errorCode`：

```json
{
  "body": {
    "errorMessage": "Error Content "
  }
}
```

### Normal Response

if no error

```json
{
  "body": {
    "s3_object_name": "xxx.png",
    "errorMessage": ""
  }
}
```

# Conversation Request and Response Formats

## Request Format

**we can add seesion id in future**

```json
{
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "body": {
      "prompt": "user input message",
      "session_id": "1234567",
      "verify": "true",
      "timestamp": "20240815155244",
      "user_id": "09003903222"
    }
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
