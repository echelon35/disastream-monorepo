CREATE INDEX idx_earthquakes_point ON earthquakes USING GIST (point);
CREATE INDEX idx_floods_point ON floods USING GIST (point);
CREATE INDEX idx_eruptions_point ON eruptions USING GIST (point);
CREATE INDEX idx_hurricanes_point ON hurricanes USING GIST (point);
CREATE INDEX idx_cities_point ON cities USING GIST (geom);