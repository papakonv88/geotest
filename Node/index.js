const express = require('express');
const { Pool } = require('pg');
const cors = require('cors')

const app = express();

app.use(express.json())
app.use(cors({
    origin: '*' // allow requests from all origins
}));

const pool = new Pool({ // Heroku database credentials
    user: 'bbnqrmbfpxezne',
    host: 'ec2-34-248-169-69.eu-west-1.compute.amazonaws.com',
    database: 'd2l7sv3ke8pp1t',
    password: '46804a1e50e86ef6d4a0a34bc88d831305e751cdfd7ebfd4838658e862348b16',
    port: 5432,
    ssl: { rejectUnauthorized: false }
})


app.get('/location', async (req, res) => { // Endpoint that takes coordinates as params and return intersecting polygon from fields table
    const { location } = req.query // url must be type of: http://localhost:3000/location?location={lon},{lat}
    if (location) {
        let locationParse = location.split(',') || null
        if (locationParse) {
            if (locationParse.length == 2) { // Check if coords are valid
                let longitude = (locationParse[0] <= 180 && locationParse[0] >= -180) ? locationParse[0] : null
                let latitude = (locationParse[1] <= 90 && locationParse[1] >= -90) ? locationParse[1] : null
                if (longitude && latitude) {
                    try {
                        let query = { // SQL query to get the intersected polygon based on point coordinates (params of endpoint)
                            text: `SELECT ST_AsGeoJSON(f.*) FROM public.fields AS f(ID, geometry) WHERE ST_Intersects( "geometry" , ST_GeomFromText('POINT(${parseFloat(longitude)} ${parseFloat(latitude)})', 4326))`
                        }
                        let response = await pool.query(query)
                        if (response?.rows.length > 0) {
                            let geojson = JSON.parse(response.rows[0].st_asgeojson) // Assuming there are no overlaping fields thus only one polygon can be selected, parse geojson feature
                            res.json(geojson) // Send response as json
                        }

                    } catch (err) {
                        res.status(404).json({ err }) // If error send error response as json
                    }
                } else {
                    res.status(404).json({ error: 'Coordinates not valid' }) // If error send error response as json
                }

            } else {
                res.status(404).json({ error: 'Parameters are not in  valid format' }) // If error send error response as json
            }
        }
    } else {
        res.status(404).json({ error: 'No location query parameter' }) // If error send error response as json
    }
});


app.get('/delineated-areas', async (req, res) => { // Endpoint that returns all coverage polygons as a geojson feature collection
    let geojson = { // Initialize geojson
        type: "FeatureCollection",
        features: []
      }
    try {
        let query = {
            text: `SELECT ST_AsGeoJSON(f.*) FROM public.coverage AS f(name, way)` // SQL query to get all rows of coverage table as geojson
        }
        let response = await pool.query(query)  //  Execute query
        response.rows.forEach((feature) => {  // Iterate response row property and parse each geojson feature
            if (feature?.st_asgeojson) {
                geojson.features.push(JSON.parse(feature.st_asgeojson)) // Add parsed feature to geojson features array
            }
        })
        res.json(geojson) // Send response as json

    } catch (err) {
        res.status(400).json({ err }) // If error send error response as json
    }
})


app.listen(3000, () => console.log('Server listening on port 3000'));