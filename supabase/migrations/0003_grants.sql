-- Tables created in the SQL editor are not readable by the API roles by default.
-- Only the server (secret key = service_role) gets access; anon and
-- authenticated stay locked out, so the browser can only reach data via /api.
grant select, insert, update, delete on public.profiles, public.runs to service_role;
