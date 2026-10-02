#!/usr/bin/env bash
# Diff Aikido container findings: baseline (published image) vs candidate (CI-built image).
#
# Usage: aikido-container-diff.sh [candidate.json]
#
# Env:
#   AIKIDO_CLIENT_ID / AIKIDO_CLIENT_SECRET  OAuth client credentials (read-only scopes:
#                                            issues:read; containers:read is optional)
#   BASELINE_IMAGE            baseline image, matched as a name suffix (default: kong/insomnia-mockbin)
#   BASELINE_ENV              baseline environment path segment suffix   (default: production)
#   CANDIDATE_CONTAINER_NAME  candidate container repo name              (default: insomnia-mockbin-ci)
#   OUT_DIR                   output dir for aikido-diff.json (default: out)
#
# Key = (package, CVE or AIKIDO id).
#   RESOLVED  = baseline only, REMAINING = both, NEW = candidate only.
# Exit 1 only if NEW contains a high or critical finding.
#
# Candidate source: the local-scanner --gating-result-output JSON. Its exact schema is
# not documented, so we collect every object carrying a cve_id/cve/vulnerability_id/
# aikido_id field. If none are found, fall back to the open issues of the
# CANDIDATE_CONTAINER_NAME container repo via the REST API.
set -euo pipefail

API="https://app.aikido.dev/api"
BASELINE_IMAGE="${BASELINE_IMAGE:-kong/insomnia-mockbin}"
BASELINE_ENV="${BASELINE_ENV:-production}"
BASELINE_LABEL="${BASELINE_IMAGE} (${BASELINE_ENV})"
CANDIDATE_CONTAINER_NAME="${CANDIDATE_CONTAINER_NAME:-insomnia-mockbin-ci}"
OUT_DIR="${OUT_DIR:-out}"
CANDIDATE_FILE="${1:-${OUT_DIR}/candidate.json}"

if [[ -z "${AIKIDO_CLIENT_ID:-}" || -z "${AIKIDO_CLIENT_SECRET:-}" ]]; then
  echo "::warning::AIKIDO_CLIENT_ID / AIKIDO_CLIENT_SECRET not set; skipping Aikido diff"
  exit 0
fi

command -v jq >/dev/null || { echo "jq is required" >&2; exit 2; }
mkdir -p "${OUT_DIR}"

# --- auth ---------------------------------------------------------------------
TOKEN="$(curl -fsS -X POST "${API}/oauth/token" \
  -u "${AIKIDO_CLIENT_ID}:${AIKIDO_CLIENT_SECRET}" \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"client_credentials"}' | jq -r '.access_token // empty')"
if [[ -z "${TOKEN}" ]]; then
  echo "Failed to obtain Aikido access token" >&2
  exit 2
fi
if [[ -n "${GITHUB_ACTIONS:-}" ]]; then
  echo "::add-mask::${TOKEN}"
fi

# GET helper; prints body, returns non-zero on HTTP error (curl -f)
api_get() {
  curl -fsS -H "Authorization: Bearer ${TOKEN}" "$@"
}

# Fetch open issues for a container repo as a JSON array.
# The repo is matched by image (exact name, or a name ending in "/<image>") and, if
# given, an environment (one path segment ending in "-<env>"), so internal registry
# paths never need to appear in source or logs. Exactly one repo must match.
# Returns 3 (no output) if no single repo matches, so "no baseline" is distinguishable
# from "repo exists with 0 open issues".
# Prefers /containers (needs containers:read) to resolve the repo id; if that fails,
# falls back to the issue export (all statuses) filtered by container_repo_name;
# the repo counts as existing if any issue, open or closed, references it.
# shellcheck disable=SC2016 # jq program, not shell
MATCH='def matches($img; $env):
  . == $img
  or ((endswith("/" + $img))
      and ($env == "" or (split("/") | any(endswith("-" + $env)))));'
fetch_container_issues() {
  local image="$1" env="${2:-}" containers ids all names
  if containers="$(api_get -G "${API}/public/v1/containers" --data-urlencode "filter_name=${image##*/}")"; then
    ids="$(jq -r --arg img "${image}" --arg env "${env}" "${MATCH}"'
      (if type == "array" then . else (.containers // .items // []) end)
      | map(select(.name | matches($img; $env))) | .[].id' <<<"${containers}")"
  else
    echo "note: /containers request failed (see error above); filtering issue export by name" >&2
    all="$(api_get -G "${API}/public/v1/issues/export" --data-urlencode "format=json")"
    names="$(jq -r --arg img "${image}" --arg env "${env}" "${MATCH}"'
      [.[] | .container_repo_name // empty | select(matches($img; $env))] | unique | .[]' <<<"${all}")"
    if [[ "$(grep -c . <<<"${names}")" != "1" ]]; then
      echo "note: $(grep -c . <<<"${names}") container repos match '${image}' (env '${env}') in the issue export; need exactly 1" >&2
      return 3
    fi
    jq --arg n "${names}" '[.[] | select(.container_repo_name == $n and .status == "open")]' <<<"${all}"
    return 0
  fi
  # Ids only: container names include internal registry paths and logs are public
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

# Normalise to [{package, id, severity, version}] unique by key
NORMALISE='
  def sev: (.severity // "unknown") | tostring | ascii_downcase;
  [ .[]
    | { package: (.affected_package // .package // .package_name // .name // "unknown"),
        id: (.cve_id // .cve // .vulnerability_id // .aikido_id // .rule_id // (.id | tostring)),
        severity: sev,
        version: (.installed_version // .version // null) }
    | select(.id != null) ]
  | unique_by([.package, .id])'

# --- baseline -------------------------------------------------------------------
HAS_BASELINE=true
BASELINE_RAW="[]"
BASELINE_RC=0
BASELINE_RAW="$(fetch_container_issues "${BASELINE_IMAGE}" "${BASELINE_ENV}")" || BASELINE_RC=$?
if [[ "${BASELINE_RC}" -eq 3 ]]; then
  HAS_BASELINE=false
  BASELINE_RAW="[]"
  echo "::warning::No single Aikido baseline container found for ${BASELINE_LABEL}; reporting findings without gating"
elif [[ "${BASELINE_RC}" -ne 0 ]]; then
  echo "Failed to fetch baseline issues" >&2
  exit 2
fi
BASELINE="$(jq "${NORMALISE}" <<<"${BASELINE_RAW}")"

# --- candidate ------------------------------------------------------------------
CANDIDATE="[]"
CANDIDATE_SOURCE="none"
if [[ -s "${CANDIDATE_FILE}" ]]; then
  CANDIDATE="$(jq '[ .. | objects
      | select(has("cve_id") or has("cve") or has("vulnerability_id") or has("aikido_id")) ]' \
    "${CANDIDATE_FILE}" 2>/dev/null | jq "${NORMALISE}" 2>/dev/null || echo "[]")"
  CANDIDATE_SOURCE="scanner-output"
fi
if [[ "$(jq length <<<"${CANDIDATE}")" == "0" ]]; then
  echo "note: no CVE ids in ${CANDIDATE_FILE}; falling back to Aikido issues of '${CANDIDATE_CONTAINER_NAME}'" >&2
  CANDIDATE_RAW="$(fetch_container_issues "${CANDIDATE_CONTAINER_NAME}")" || CANDIDATE_RAW="[]"
  CANDIDATE="$(jq "${NORMALISE}" <<<"${CANDIDATE_RAW}")"
  CANDIDATE_SOURCE="api:${CANDIDATE_CONTAINER_NAME}"
fi

# --- diff -----------------------------------------------------------------------
jq -n --argjson b "${BASELINE}" --argjson c "${CANDIDATE}" \
  --arg bn "${BASELINE_LABEL}" --arg src "${CANDIDATE_SOURCE}" --argjson hb "${HAS_BASELINE}" '
  def key: [.package, .id] | @json;
  ($b | map({(key): .}) | add // {}) as $bm |
  ($c | map({(key): .}) | add // {}) as $cm |
  { baseline: $bn,
    has_baseline: $hb,
    candidate_source: $src,
    resolved:  [$b[] | select($cm[key] == null)],
    remaining: [$c[] | select($bm[key] != null)],
    new:       (if $hb then [$c[] | select($bm[key] == null)] else [] end),
    findings_no_baseline: (if $hb then [] else $c end) }
  | .counts = { resolved: (.resolved | length), remaining: (.remaining | length), new: (.new | length), findings_no_baseline: (.findings_no_baseline | length) }
' >"${OUT_DIR}/aikido-diff.json"

# --- summary --------------------------------------------------------------------
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/stdout}"
{
  echo "## Aikido container diff"
  echo
  if [[ "${HAS_BASELINE}" == "true" ]]; then
    jq -r '"Baseline: `\(.baseline)`  |  Candidate source: `\(.candidate_source)`",
           "",
           "| Resolved | Remaining | New |",
           "|---|---|---|",
           "| \(.counts.resolved) | \(.counts.remaining) | \(.counts.new) |"' "${OUT_DIR}/aikido-diff.json"
    echo
    jq -r '
      def rows(st; arr): arr[] | "| \(st) | \(.package) | \(.id) | \(.severity) | \(.version // "") |";
      if (.counts.resolved + .counts.remaining + .counts.new) == 0 then "No findings."
      else ("| Status | Package | Id | Severity | Version |", "|---|---|---|---|---|",
            rows("NEW"; .new), rows("REMAINING"; .remaining), rows("RESOLVED"; .resolved)) end' \
      "${OUT_DIR}/aikido-diff.json"
  else
    jq -r '"**NO BASELINE**: no single Aikido container repo found for `\(.baseline)`; findings are reported without gating.",
           "",
           "Candidate source: `\(.candidate_source)`",
           "",
           "### Findings (no baseline)",
           "",
           (if .counts.findings_no_baseline == 0 then "No findings."
            else ("| Package | Id | Severity | Version |", "|---|---|---|---|",
                  (.findings_no_baseline[] | "| \(.package) | \(.id) | \(.severity) | \(.version // "") |")) end)' \
      "${OUT_DIR}/aikido-diff.json"
  fi
} >>"${SUMMARY}"

BLOCKING="$(jq '[.new[] | select(.severity == "high" or .severity == "critical")] | length' "${OUT_DIR}/aikido-diff.json")"
if [[ "${BLOCKING}" -gt 0 ]]; then
  echo "::error::${BLOCKING} new high/critical Aikido finding(s) in candidate image"
  exit 1
fi
