# geotest

<b>For Task 1, a postgresql database was initialized via Heroku and postgis extension was installed.</b>

<b>Node folder</b>

To run -->

npm install  <br></br> 
node <b>index.js</b>  <br></br> 
(runs on port 3000)  <br></br> 

Contains the Express-Node Js Server with two endpoints: <br></br> 
--> /location (<b>task 3</b>), the url must be type of: http://localhost:3000/location?location={lon},{lat} <br></br>
--> /delineated-areas (<b>task 5</b>)
                                                       
                                                       
<b>Script folder</b>

To run (with Conda env) -->

conda env create -f <b>pythonenv.yml</b>  <br></br> 
conda activate geotest03  <br></br> 
python ./../.../<b>toPostgis.py</b> argument(shapefile path)  <br></br> 

<b>Tasks 2 and 4</b> are being performed






