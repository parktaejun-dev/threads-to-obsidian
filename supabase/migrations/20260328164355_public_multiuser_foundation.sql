BEGIN;

-- Uses the default legacy table prefix `threads_web_store`.
-- If production overrides THREADS_WEB_POSTGRES_TABLE, keep the default prefix or adapt this migration before applying it.

CREATE TABLE IF NOT EXISTS public.threads_web_store_bot_users (
  id TEXT PRIMARY KEY,
  threads_user_id TEXT,
  threads_handle TEXT NOT NULL,
  display_name TEXT,
  profile_picture_url TEXT,
  biography TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  access_token_ciphertext TEXT,
  token_expires_at TIMESTAMPTZ,
  email TEXT,
  granted_scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  scope_version INTEGER NOT NULL DEFAULT 0,
  last_scope_upgrade_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  last_login_at TIMESTAMPTZ,
  status TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_bot_users_threads_handle_uidx
  ON public.threads_web_store_bot_users (threads_handle);

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_bot_users_threads_user_id_uidx
  ON public.threads_web_store_bot_users (threads_user_id)
  WHERE threads_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS threads_web_store_bot_users_active_handle_idx
  ON public.threads_web_store_bot_users (status, threads_handle);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_users_active_user_id_idx
  ON public.threads_web_store_bot_users (status, threads_user_id);

CREATE TABLE IF NOT EXISTS public.threads_web_store_bot_login_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  requested_handle TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_login_tokens_user_status_idx
  ON public.threads_web_store_bot_login_tokens (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_login_tokens_expires_idx
  ON public.threads_web_store_bot_login_tokens (expires_at);

CREATE TABLE IF NOT EXISTS public.threads_web_store_bot_oauth_sessions (
  id TEXT PRIMARY KEY,
  state_hash TEXT NOT NULL UNIQUE,
  poll_token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  activation_code TEXT UNIQUE,
  activation_expires_at TIMESTAMPTZ,
  linked_session_token TEXT,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_oauth_sessions_status_idx
  ON public.threads_web_store_bot_oauth_sessions (status, expires_at, created_at DESC);

CREATE TABLE IF NOT EXISTS public.threads_web_store_bot_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  session_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_sessions_user_status_idx
  ON public.threads_web_store_bot_sessions (user_id, status, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_sessions_expires_idx
  ON public.threads_web_store_bot_sessions (expires_at);

CREATE TABLE IF NOT EXISTS public.threads_web_store_bot_extension_link_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  code_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_extension_link_sessions_user_status_idx
  ON public.threads_web_store_bot_extension_link_sessions (user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_extension_link_sessions_expires_idx
  ON public.threads_web_store_bot_extension_link_sessions (expires_at);

CREATE TABLE IF NOT EXISTS public.threads_web_store_bot_extension_access_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  linked_at TIMESTAMPTZ NOT NULL,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_extension_access_tokens_user_status_idx
  ON public.threads_web_store_bot_extension_access_tokens (user_id, status, linked_at DESC);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_extension_access_tokens_expires_idx
  ON public.threads_web_store_bot_extension_access_tokens (expires_at);

CREATE TABLE IF NOT EXISTS public.threads_web_store_bot_mention_jobs (
  id TEXT PRIMARY KEY,
  mention_id TEXT NOT NULL UNIQUE,
  mention_url TEXT,
  mention_author_handle TEXT,
  mention_author_user_id TEXT,
  mention_text TEXT,
  mention_published_at TIMESTAMPTZ,
  raw_summary_json JSONB,
  attempts INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  last_error TEXT,
  available_at TIMESTAMPTZ NOT NULL,
  leased_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_mention_jobs_claimable_idx
  ON public.threads_web_store_bot_mention_jobs (status, available_at, created_at);

CREATE TABLE IF NOT EXISTS public.threads_web_store_bot_archives (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  mention_id TEXT,
  mention_url TEXT NOT NULL,
  mention_author_handle TEXT NOT NULL,
  mention_author_display_name TEXT,
  note_text TEXT,
  target_url TEXT NOT NULL,
  target_author_handle TEXT,
  target_author_display_name TEXT,
  target_text TEXT NOT NULL,
  target_published_at TIMESTAMPTZ,
  media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  markdown_content TEXT NOT NULL,
  raw_payload_json TEXT,
  archived_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_bot_archives_mention_id_uidx
  ON public.threads_web_store_bot_archives (user_id, mention_id)
  WHERE mention_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_bot_archives_mention_url_uidx
  ON public.threads_web_store_bot_archives (user_id, mention_url);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_archives_user_updated_idx
  ON public.threads_web_store_bot_archives (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS threads_web_store_bot_archives_mention_lookup_idx
  ON public.threads_web_store_bot_archives (mention_id, mention_url);

CREATE TABLE IF NOT EXISTS public.threads_web_store_cloud_archives (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  canonical_url TEXT NOT NULL,
  shortcode TEXT NOT NULL,
  target_author_handle TEXT,
  target_author_display_name TEXT,
  target_title TEXT NOT NULL,
  target_text TEXT NOT NULL,
  target_published_at TIMESTAMPTZ,
  media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  markdown_content TEXT NOT NULL,
  raw_payload_json TEXT,
  content_hash TEXT NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_cloud_archives_canonical_url_uidx
  ON public.threads_web_store_cloud_archives (user_id, canonical_url);

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_cloud_archives_content_hash_uidx
  ON public.threads_web_store_cloud_archives (user_id, content_hash);

CREATE INDEX IF NOT EXISTS threads_web_store_cloud_archives_user_updated_idx
  ON public.threads_web_store_cloud_archives (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.threads_web_store_watchlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  target_handle TEXT NOT NULL,
  target_threads_user_id TEXT,
  target_display_name TEXT,
  target_profile_picture_url TEXT,
  include_text TEXT NOT NULL DEFAULT '',
  exclude_text TEXT NOT NULL DEFAULT '',
  media_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  auto_archive BOOLEAN NOT NULL DEFAULT FALSE,
  digest_cadence TEXT NOT NULL DEFAULT 'off',
  last_cursor TEXT,
  last_synced_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_watchlists_target_handle_uidx
  ON public.threads_web_store_watchlists (user_id, target_handle);

CREATE INDEX IF NOT EXISTS threads_web_store_watchlists_user_status_idx
  ON public.threads_web_store_watchlists (user_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.threads_web_store_search_monitors (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  author_handle TEXT,
  exclude_handles JSONB NOT NULL DEFAULT '[]'::jsonb,
  auto_archive BOOLEAN NOT NULL DEFAULT FALSE,
  search_type TEXT NOT NULL DEFAULT 'top',
  last_cursor TEXT,
  last_run_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS threads_web_store_search_monitors_user_status_idx
  ON public.threads_web_store_search_monitors (user_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.threads_web_store_search_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  monitor_id TEXT NOT NULL REFERENCES public.threads_web_store_search_monitors (id) ON DELETE CASCADE,
  external_post_id TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_display_name TEXT,
  text TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  media_type TEXT,
  media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  matched_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
  relevance_score DOUBLE PRECISION,
  archive_id TEXT,
  archived_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  raw_payload_json TEXT,
  status TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_search_results_monitor_external_uidx
  ON public.threads_web_store_search_results (user_id, monitor_id, external_post_id);

CREATE INDEX IF NOT EXISTS threads_web_store_search_results_user_status_idx
  ON public.threads_web_store_search_results (user_id, status, discovered_at DESC);

CREATE TABLE IF NOT EXISTS public.threads_web_store_tracked_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  source_id TEXT,
  external_post_id TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_display_name TEXT,
  text TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  media_type TEXT,
  media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  matched_terms JSONB NOT NULL DEFAULT '[]'::jsonb,
  relevance_score DOUBLE PRECISION,
  archive_id TEXT,
  archived_at TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  raw_payload_json TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_tracked_posts_source_external_uidx
  ON public.threads_web_store_tracked_posts (user_id, origin, COALESCE(source_id, ''), external_post_id);

CREATE INDEX IF NOT EXISTS threads_web_store_tracked_posts_user_origin_idx
  ON public.threads_web_store_tracked_posts (user_id, origin, discovered_at DESC);

CREATE TABLE IF NOT EXISTS public.threads_web_store_insights_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  external_post_id TEXT,
  canonical_url TEXT,
  title TEXT,
  likes BIGINT,
  replies BIGINT,
  reposts BIGINT,
  quotes BIGINT,
  views BIGINT,
  followers BIGINT,
  profile_views BIGINT,
  captured_at TIMESTAMPTZ NOT NULL,
  raw_payload_json TEXT
);

CREATE INDEX IF NOT EXISTS threads_web_store_insights_snapshots_user_kind_idx
  ON public.threads_web_store_insights_snapshots (user_id, kind, captured_at DESC);

CREATE INDEX IF NOT EXISTS threads_web_store_insights_snapshots_external_post_idx
  ON public.threads_web_store_insights_snapshots (user_id, external_post_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS public.threads_web_store_saved_views (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.threads_web_store_bot_users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  target_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS threads_web_store_saved_views_name_uidx
  ON public.threads_web_store_saved_views (user_id, name);

CREATE INDEX IF NOT EXISTS threads_web_store_saved_views_user_kind_idx
  ON public.threads_web_store_saved_views (user_id, kind, updated_at DESC);

COMMIT;
