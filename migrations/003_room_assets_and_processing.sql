ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS source_image_key text,
  ADD COLUMN IF NOT EXISTS mask_key text,
  ADD COLUMN IF NOT EXISTS cleaned_image_key text,
  ADD COLUMN IF NOT EXISTS source_content_type text,
  ADD COLUMN IF NOT EXISTS source_byte_size bigint,
  ADD COLUMN IF NOT EXISTS mask_content_type text,
  ADD COLUMN IF NOT EXISTS mask_byte_size bigint,
  ADD COLUMN IF NOT EXISTS cleaned_content_type text,
  ADD COLUMN IF NOT EXISTS cleaned_byte_size bigint,
  ADD COLUMN IF NOT EXISTS processing_job_id text,
  ADD COLUMN IF NOT EXISTS processing_error_code text,
  ADD COLUMN IF NOT EXISTS processing_error_message text,
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS processing_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS processing_attempts integer NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS rooms_processing_job_idx ON rooms(processing_job_id) WHERE processing_job_id IS NOT NULL;
