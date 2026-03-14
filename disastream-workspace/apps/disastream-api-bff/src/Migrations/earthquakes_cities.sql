ALTER TABLE earthquakes ADD IF NOT EXISTS "nearestCityId" integer;

UPDATE earthquakes AS eq
SET "nearestCityId" = (
    SELECT c.id
    FROM cities AS c
	WHERE ST_DWithin(eq.point::geography, c.geom::geography, 3500000) 
    ORDER BY eq.point <-> c.geom
    LIMIT 1
);

select * from earthquakes;