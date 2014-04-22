-- Function: get_domains_n_bbox

CREATE FUNCTION get_domains_n_bbox(lname character varying, geom character varying, gid character varying, radius numeric, bbox geometry) RETURNS SETOF record
    LANGUAGE plpgsql
    AS $$DECLARE
    lid_new    integer;
    dmn_number integer := 1;
    outr       record;
    innr       record;
    r          record;

BEGIN

    DROP TABLE IF EXISTS tmp;
    EXECUTE 'CREATE TEMPORARY TABLE tmp AS SELECT '||gid||' as gid, '||geom||' as geom FROM '||lname||' WHERE '||geom||' && '||quote_literal(bbox::text)||'::geometry';
    ALTER TABLE tmp ADD COLUMN dmn integer;
    ALTER TABLE tmp ADD COLUMN chk boolean DEFAULT FALSE;
    EXECUTE 'UPDATE tmp SET dmn = '||dmn_number||', chk = FALSE WHERE gid = (SELECT MIN(gid) FROM tmp)';

    LOOP
        LOOP
            FOR outr IN EXECUTE 'SELECT gid, geom FROM tmp WHERE dmn = '||dmn_number||' AND NOT chk' LOOP
                FOR innr IN EXECUTE 'SELECT gid, geom FROM tmp WHERE dmn IS NULL and ' || quote_literal(outr.geom::text) ||'::geometry && tmp.geom' LOOP
                    IF ST_DWithin(ST_SetSRID(outr.geom, 900913), ST_SetSRID(innr.geom, 900913), radius) THEN
                    --IF ST_DWithin(outr.geom, innr.geom, radius) THEN
                        EXECUTE 'UPDATE tmp SET dmn = '||dmn_number||', chk = FALSE WHERE gid = '||innr.gid;
                    END IF;
                END LOOP;
                EXECUTE 'UPDATE tmp SET chk = TRUE WHERE gid = '||outr.gid;
            END LOOP;
            SELECT INTO r dmn FROM tmp WHERE dmn = dmn_number AND NOT chk LIMIT 1;
            EXIT WHEN NOT FOUND;
       END LOOP;
       SELECT INTO r dmn FROM tmp WHERE dmn IS NULL LIMIT 1;
       IF FOUND THEN
           dmn_number := dmn_number + 1;
           EXECUTE 'UPDATE tmp SET dmn = '||dmn_number||', chk = FALSE WHERE gid = (SELECT MIN(gid) FROM tmp WHERE dmn IS NULL LIMIT 1)';
       ELSE
           EXIT;
       END IF;
    END LOOP;

    RETURN QUERY EXECUTE 'SELECT ST_Centroid(ST_Collect(geom)) as hull, array_agg(gid) as ids  FROM tmp GROUP by dmn';

    RETURN;
END
$$;



-- Table: ogrgeojson

-- DROP TABLE ogrgeojson;

CREATE TABLE ogrgeojson
(
  ogc_fid serial NOT NULL,
  wkb_geometry geometry(Point,4326),
  geom_3857 geometry(Point,3857),
  ddbid character varying,
  type character varying,
  year integer,
  CONSTRAINT ogrgeojson_pk PRIMARY KEY (ogc_fid)
)
WITH (
  OIDS=FALSE
);

-- Index: ogrgeojson_geom_idx

-- DROP INDEX ogrgeojson_geom_idx;

CREATE INDEX ogrgeojson_geom_idx
  ON ogrgeojson
  USING gist
  (wkb_geometry);
