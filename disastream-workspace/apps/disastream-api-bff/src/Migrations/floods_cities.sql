ALTER TABLE floods ADD IF NOT EXISTS "nearestCityId" integer;

UPDATE floods AS fl
SET "nearestCityId" = (
    SELECT c.id
    FROM cities AS c
	WHERE ST_DWithin(fl.point::geography, c.geom::geography, 3500000) 
    ORDER BY fl.point <-> c.geom
    LIMIT 1
);

select * from floods;