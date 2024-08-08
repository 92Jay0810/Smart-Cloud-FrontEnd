### `npm start`

- to start a project in localhost:3000

### `npm run build`

- to build a static webstite in build folder

### `the request format`

- example

{
Networking: [
'Shared VPC',
'PublicService',
'On-premise service',
'NAT',
'StaticWebCache',
'On-premise'
],
Computing: [ 'Monolith', 'number of cloud services <10', 'Stateful', 'GPU' ],
Database: [ 'PostgreSQL', 'Cache' ],
Storage: [ 'LargeFileStorage', 'Active/Active' ],
Security: [ 'HighSecurity', 'PersonalDataProtection' ]
}

### `the response format`

errorCodeID errorContent
101 user login error
201 Bad Request LLM
202 LLM Request Timeout
301 internal compile error

- if has error
  {
  errorCode:'errorCodeID'
  }
- if no error
  {
  imgsrc:"data:image/png;base64,base64EncodingString"
  errorCode:''
  }
  example
  {
  imageSrc: 'data:image/png;base64,iVBORw0KGgoAmQAAmQAAmQAAnECQEKP3G'...466430 more characters,
  errorCode: ''
  }
