# Intersection API

This project provides an API for detecting intersections between line strings in GeoJSON format.

## Requirements

* Node.js (v16.18.1 or later)
* NPM (v9.3.1 or later)

Dependencies:

* express
* rbush
* @turf/turf
* jsonwebtoken
* express-jwt
* body-parser

## Installation

First, clone the repository and navigate into the project directory:

``` 
git clone <repository-url>
```

#### Next, install the dependencies:

```
npm install

```


## Usage

Start the server:

```
npm run dev
```


The server will run on port 3000.

The API provides two endpoints:

1. `POST /token` - Generate a JWT token. This does not require any input. The token is returned in the response body.

2. `POST /intersections` - Detect intersections between line strings. This requires a JWT token in the `Authorization` header and a JSON body containing a long line string and an array of 50 other line strings.

Example request body for `/intersections`:

```json
{
    "longLine": {
        "type": "LineString",
        "coordinates": [[0,0], [10,10]]
    },
    "lines": [
        {
            "type": "LineString",
            "coordinates": [[0,0], [5,5]]
        },
        // 49 more line strings...
    ]
}
```

The response will be a JSON object containing details of the intersections.

