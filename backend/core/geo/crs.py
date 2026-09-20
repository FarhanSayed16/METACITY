import math

def wgs84_to_local(lat: float, lon: float, ref_lat: float, ref_lon: float) -> tuple[float, float]:
    """
    Equirectangular approximation to convert WGS84 coordinates into local metric coordinates.
    The origin (0,0) is defined by (ref_lat, ref_lon).
    Returns (x_meters, y_meters).
    """
    R = 6371000 # Earth radius in meters
    dlat = math.radians(lat - ref_lat)
    dlon = math.radians(lon - ref_lon)
    
    x = R * dlon * math.cos(math.radians(ref_lat))
    y = R * dlat
    
    return x, y

def local_to_wgs84(x: float, y: float, ref_lat: float, ref_lon: float) -> tuple[float, float]:
    """
    Convert local metric coordinates back to WGS84.
    Returns (lat, lon).
    """
    R = 6371000
    
    dlat = y / R
    dlon = x / (R * math.cos(math.radians(ref_lat)))
    
    lat = ref_lat + math.degrees(dlat)
    lon = ref_lon + math.degrees(dlon)
    
    return lat, lon
