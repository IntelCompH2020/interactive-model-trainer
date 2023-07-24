-- Table: public.corpus_import

-- DROP TABLE IF EXISTS public.corpus_import;

CREATE TABLE IF NOT EXISTS public.corpus_import
(
    id uuid NOT NULL,
    path character varying(200) COLLATE pg_catalog."default" NOT NULL,
    status character varying(20) COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone,
    is_active character varying(20) COLLATE pg_catalog."default" NOT NULL,
    name character varying(200) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT corpus_import_pkey PRIMARY KEY (id),
    CONSTRAINT corpus_import_path_unique UNIQUE (path)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.corpus_import
    OWNER to "ic-interactive-model-trainer";