const express = require('express');
const rbush = require('rbush');
const turf = require('@turf/turf');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json({ limit: '200mb' }));  // Increase the limit here

// Generate a token
const YOUR_SECRET_KEY = process.env; // You should set this to a secure value

app.post('/token', (req, res) => {
    try {
        // Create a new token with an empty payload
        const token = jwt.sign({}, YOUR_SECRET_KEY, { expiresIn: '1h' });

        // Return the token
        res.json({ token });
    } catch (e) {
        // Handle any errors
        console.error(e);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Protect the endpoint with express-jwt
app.post('/intersections', expressJwt({ secret: YOUR_SECRET_KEY, algorithms: ['HS256'] }), (req, res) => {
    try {
        const longLineString = req.body.longLine;  // Long GeoJSON LineString
        const lineStrings = req.body.lines;  // Array of 50 GeoJSON LineStrings

        const intersections = [];

        const tree = rbush();

        lineStrings.forEach((lineString, index) => {
            const id = `L${(index + 1).toString().padStart(2, '0')}`;  // Generate an ID for the line
            const [start, end] = lineString.coordinates;
            const bbox = {
                minX: Math.min(start[0], end[0]),
                minY: Math.min(start[1], end[1]),
                maxX: Math.max(start[0], end[0]),
                maxY: Math.max(start[1], end[1]),
                line: { id, line: lineString }
            };
            tree.insert(bbox);
        });

        lineStrings.forEach((lineString1, index1) => {
            const id1 = `L${(index1 + 1).toString().padStart(2, '0')}`;  // ID of the line
            const [start1, end1] = lineString1.coordinates;
            const bbox1 = {
                minX: Math.min(start1[0], end1[0]),
                minY: Math.min(start1[1], end1[1]),
                maxX: Math.max(start1[0], end1[0]),
                maxY: Math.max(start1[1], end1[1])
            };
            const potentialIntersections = tree.search(bbox1);

            potentialIntersections.forEach(bbox2 => {
                if (id1 !== bbox2.line.id) {  // Exclude self-intersection
                    const intersect = turf.lineIntersect({ type: "Feature", geometry: longLineString }, { type: "Feature", geometry: bbox2.line.line });
                    if (intersect.features.length > 0) {
                        intersections.push({
                            id1: id1,
                            id2: bbox2.line.id,
                            points: intersect.features.map(feature => feature.geometry.coordinates)
                        });
                    }
                }
            });
        });

        res.json(intersections);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.listen(3000, () => {
    console.log('App is running on port 3000');
});
