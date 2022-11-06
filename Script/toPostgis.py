import sys

import geopandas as gpd
from sqlalchemy import create_engine
from geoalchemy2 import Geometry
from shapely.geometry.polygon import Polygon
from shapely.geometry.multipolygon import MultiPolygon

def appendShp(shapefile):
    try:
        # If polygons convert to multipolygons else do nothing
        shapefile["geometry"] = [MultiPolygon([feature]) if isinstance(feature, Polygon)
        else feature for feature in shapefile["geometry"]]
        # Append to postgis table named fields
        shapefile.to_postgis("fields", con, index=False, if_exists='append')
    except:
        print('Something went wrong..')

def appendCoverage(shapefile, fileName):
    try:
        shpHull = shapefile.unary_union.convex_hull # Create coverage polygon using geopandas Convex hull
        shpHulltoWKT =  shpHull.wkt # Convert polygon to wkt format
        con.execute("INSERT INTO public.coverage VALUES (%s, %s)", (fileName, shpHulltoWKT)) # Append to coverage table
    except:
        print('Something went wrong..')

# Database connection
postgresql_url = "postgresql://bbnqrmbfpxezne:46804a1e50e86ef6d4a0a34bc88d831305e751cdfd7ebfd4838658e862348b16@ec2-34-248-169-69.eu-west-1.compute.amazonaws.com:5432/d2l7sv3ke8pp1t"
con = create_engine(postgresql_url)

# Get arguments from user
if len(sys.argv) > 1:
    shpPath = sys.argv[1] # Scripts accepts only one shapefile as argument
    if shpPath.endswith('.shp'):
        shpNameArr = shpPath.split("\\")
        shpFileName = shpNameArr[len(shpNameArr) - 1].replace('.shp', '') # Parse user parameter to get the name of the shapefile
        try: 
            gdf = gpd.read_file(r'{}'.format(shpPath)) # Read shapefile
            appendShp(gdf)
            appendCoverage(gdf, shpFileName)
        except:
            print('Something went wrong..')


