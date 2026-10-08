#!/usr/bin/env bash
# Diff Aikido findings: baseline (published image) vs candidate (CI-built image).
# Usage: aikido-sbom-diff.sh [candidate.json]
#
# Env: AIKIDO_CLIENT_ID / AIKIDO_CLIENT_SECRET  REST credentials (read-only)
#      BASELINE_IMAGE / BASELINE_ENV            baseline container repo, matched by
#                                               name suffix and env path segment
#      CANDIDATE_CONTAINER_NAME                 CI container repo (default insomnia-mockbin-ci)
#      OUT_DIR                                  output dir (default out)
#
# Key = (package, CVE id). RESOLVED = baseline only, REMAINING = both, NEW = candidate only.
# Exits 1 only if NEW has a high/critical finding; without a baseline it reports only.
set -euo pipefail

API="https://app.aikido.dev/api"
BASELINE_IMAGE="${BASELINE_IMAGE:-kong/insomnia-mockbin}"
BASELINE_ENV="${BASELINE_ENV:-production}"
BASELINE_LABEL="${BASELINE_IMAGE} (${BASELINE_ENV})"
CANDIDATE_CONTAINER_NAME="${CANDIDATE_CONTAINER_NAME:-insomnia-mockbin-ci}"
OUT_DIR="${OUT_DIR:-out}"
CANDIDATE_FILE="${1:-${OUT_DIR}/candidate.json}"

if [[ -z "${AIKIDO_CLIENT_ID:-}" || -z "${AIKIDO_CLIENT_SECRET:-}" ]]; then
  echo "::warning::AIKIDO_CLIENT_ID / AIKIDO_CLIENT_SECRET not set; skipping diff"
  exit 0
fi
mkdir -p "${OUT_DIR}"

# Credentials go to curl via a config on stdin/fd, never argv (visible in ps)
TOKEN="$(printf 'user = "%s:%s"\n' "${AIKIDO_CLIENT_ID}" "${AIKIDO_CLIENT_SECRET}" \
  | curl -fsS -K - -X POST "${API}/oauth/token" -H "Content-Type: application/json" \
      -d '{"grant_type":"client_credentials"}' | jq -r '.access_token // empty')"
[[ -n "${TOKEN}" ]] || { echo "Failed to obtain Aikido access token" >&2; exit 2; }
[[ -z "${GITHUB_ACTIONS:-}" ]] || echo "::add-mask::${TOKEN}"

api_get() {
  curl -fsS -K <(printf 'header = "Authorization: Bearer %s"\n' "${TOKEN}") "$@"
}

# Match a container repo by image (exact, or name ending in "/<image>") and optional
# env (a path segment ending in "-<env>"), so internal registry paths never appear
# in source or logs.
# shellcheck disable=SC2016 # jq program, not shell
MATCH='def matches($img; $env):
  . == $img
  or ((endswith("/" + $img))
      and ($env == "" or (split("/") | any(endswith("-" + $env)))));'

# Print open issues of the single matching container repo; return 3 if not exactly one.
# Only ids are logged: names include internal paths and CI logs are public.
fetch_container_issues() {
  local image="$1" env="${2:-}" ids
  ids="$(api_get -G "${API}/public/v1/containers" --data-urlencode "filter_name=${image##*/}" \
    | jq -r --arg img "${image}" --arg env "${env}" "${MATCH}"'
        (if type == "array" then . else (.containers // .items // []) end)
        | map(select(.name | matches($img; $env))) | .[].id')" || return 2
  if [[ "$(grep -c . <<<"${ids}")" != "1" ]]; then
    echo "note: $(grep -c . <<<"${ids}") container repos match '${image}' (env '${env}'); need exactly 1" >&2
    return 3
  fi
  echo "note: '${image}' (env '${env}') resolved to container repo id ${ids}" >&2
  api_get -G "${API}/public/v1/issues/export" \
    --data-urlencode "format=json" \
    --data-urlencode "filter_container_repo_id=${ids}" \
    --data-urlencode "filter_status=open"
}

NORMALISE='
  [ .[]
    | { package: (.affected_package // .package // .package_name // .name // "unknown"),
        id: (.cve_id // .cve // .vulnerability_id // .aikido_id // .rule_id // (.id | tostring)),
        severity: ((.severity // "unknown") | tostring | ascii_downcase),
        version: (.installed_version // .version // null) }
    | select(.id != null) ]
  | unique_by([.package, .id])'

# --- baseline ---
HAS_BASELINE=true
rc=0
BASELINE_RAW="$(fetch_container_issues "${BASELINE_IMAGE}" "${BASELINE_ENV}")" || rc=$?
case "${rc}" in
  0) ;;
  3) HAS_BASELINE=false; BASELINE_RAW="[]"
     echo "::warning::No single Aikido baseline container found for ${BASELINE_LABEL}; reporting without gating" ;;
  *) echo "Failed to fetch baseline issues" >&2; exit 2 ;;
esac
BASELINE="$(jq "${NORMALISE}" <<<"${BASELINE_RAW}")"

# --- candidate: scanner output, else the CI container repo's open issues ---
CANDIDATE="[]"
CANDIDATE_SOURCE="scanner-output"
if [[ -s "${CANDIDATE_FILE}" ]]; then
  CANDIDATE="$(jq '[ .. | objects
      | select(has("cve_id") or has("cve") or has("vulnerability_id") or has("aikido_id")) ]' \
    "${CANDIDATE_FILE}" 2>/dev/null | jq "${NORMALISE}" 2>/dev/null || echo "[]")"
fi
if [[ "$(jq length <<<"${CANDIDATE}")" == "0" ]]; then
  CANDIDATE_SOURCE="api:${CANDIDATE_CONTAINER_NAME}"
  CANDIDATE="$(jq "${NORMALISE}" <<<"$(fetch_container_issues "${CANDIDATE_CONTAINER_NAME}" || echo '[]')")"
fi

# --- diff ---
jq -n --argjson b "${BASELINE}" --argjson c "${CANDIDATE}" \
  --arg bn "${BASELINE_LABEL}" --arg src "${CANDIDATE_SOURCE}" --argjson hb "${HAS_BASELINE}" '
  def key: [.package, .id] | @json;
  ($b | map({(key): .}) | add // {}) as $bm |
  ($c | map({(key): .}) | add // {}) as $cm |
  { baseline: $bn, has_baseline: $hb, candidate_source: $src,
    resolved:  [$b[] | select($cm[key] == null)],
    remaining: [$c[] | select($bm[key] != null)],
    new:       (if $hb then [$c[] | select($bm[key] == null)] else [] end),
    findings_no_baseline: (if $hb then [] else $c end) }
  | .counts = (with_entries(select(.value | type == "array")) | map_values(length))
' >"${OUT_DIR}/aikido-diff.json"

# --- summary (markdown cells are escaped: values come from external data) ---
{
  echo "## Aikido SBOM diff"
  echo
  jq -r '
    def esc: tostring | gsub("[|\\n\\r]"; " ");
    def rows(st; arr): arr[] | "| \(st) | \(.package | esc) | \(.id | esc) | \(.severity | esc) | \(.version // "" | esc) |";
    "Baseline: `\(.baseline | esc)` | Candidate: `\(.candidate_source | esc)`", "",
    if .has_baseline then
      "| Resolved | Remaining | New |", "|---|---|---|",
      "| \(.counts.resolved) | \(.counts.remaining) | \(.counts.new) |", "",
      (if (.counts.resolved + .counts.remaining + .counts.new) == 0 then "No findings."
       else "| Status | Package | Id | Severity | Version |", "|---|---|---|---|---|",
            rows("NEW"; .new), rows("REMAINING"; .remaining), rows("RESOLVED"; .resolved) end)
    else
      "**NO BASELINE**: findings are reported without gating.", "",
      (if .counts.findings_no_baseline == 0 then "No findings."
       else "| Package | Id | Severity | Version |", "|---|---|---|---|",
            (.findings_no_baseline[] | "| \(.package | esc) | \(.id | esc) | \(.severity | esc) | \(.version // "" | esc) |") end)
    end' "${OUT_DIR}/aikido-diff.json"
} >>"${GITHUB_STEP_SUMMARY:-/dev/stdout}"

BLOCKING="$(jq '[.new[] | select(.severity == "high" or .severity == "critical")] | length' "${OUT_DIR}/aikido-diff.json")"
if [[ "${BLOCKING}" -gt 0 ]]; then
  echo "::error::${BLOCKING} new high/critical Aikido finding(s) in candidate image"
  exit 1
fi
