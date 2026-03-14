ALTER TABLE hurricanes ADD "nearestCityId" integer;

UPDATE hurricanes AS hu
SET "nearestCityId" = (
    SELECT c.id
    FROM cities AS c
	WHERE ST_DWithin(hu.point::geography, c.geom::geography, 3500000) 
    ORDER BY hu.point <-> c.geom
    LIMIT 1
);

select * from hurricanes;