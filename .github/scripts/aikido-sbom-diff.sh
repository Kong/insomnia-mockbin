#!/usr/bin/env bash
# Diff Aikido findings: baseline (published image) vs candidate (CI-built image).
# Usage: aikido-sbom-diff.sh [candidate.json]
#
# Env: AIKIDO_CLIENT_ID / AIKIDO_CLIENT_SECRET  REST credentials (read-only)
#      BASELINE_IMAGE / BASELINE_ENV            baseline container repo, matched by
#                                               name suffix and env path segment
#      OUT_DIR                                  output dir (default out)
#      AIKIDO_ISSUE_URL_TEMPLATE                Aikido issue link, {group_id} and {issue_id} are substituted
#                                               (default https://app.aikido.dev/issues/{group_id}/detail?singleIssueFilter={issue_id}&status=open;
#                                               empty disables links)
#      AIKIDO_CODE_REPO_ID / AIKIDO_CODE_REPO   code repo for codebase dependency links: numeric id, else
#                                               resolved by name (default Kong/insomnia-mockbin; must match
#                                               exactly once, otherwise the code columns show —)
#      AIKIDO_MAX_TASK_LOOKUPS                 max Jira task lookups (default 50)
#      AIKIDO_TASK_CONCURRENCY                  parallel task lookups (default 4; keep low, API rate-limits)
#      AIKIDO_PREFETCH_ONLY=1                   fetch only the baseline into ${OUT_DIR}/baseline-prefetch.json
#                                               and exit; a later full run reuses it (falls back to
#                                               fetching inline if the file is missing or invalid)
#      AIKIDO_RENDER_FROM                   render the summary from an existing
#                                               aikido-diff.json and exit (offline, no API)
#
# Key = (package, CVE id). RESOLVED = baseline only, REMAINING = both, NEW = candidate only.
# Exits 1 only if NEW has a high/critical finding; without a baseline it reports only.
set -euo pipefail

API="https://app.aikido.dev/api"
BASELINE_IMAGE="${BASELINE_IMAGE:-kong/insomnia-mockbin}"
BASELINE_ENV="${BASELINE_ENV:-production}"
BASELINE_LABEL="${BASELINE_IMAGE} (${BASELINE_ENV})"
OUT_DIR="${OUT_DIR:-out}"
# Not inlined as a ${VAR-default}: the "}" in {group_id} would end the expansion early
ISSUE_URL_TEMPLATE='https://app.aikido.dev/issues/{group_id}/detail?singleIssueFilter={issue_id}&status=open'
ISSUE_URL_TEMPLATE="${AIKIDO_ISSUE_URL_TEMPLATE-${ISSUE_URL_TEMPLATE}}"
MAX_TASK_LOOKUPS="${AIKIDO_MAX_TASK_LOOKUPS:-50}"
TASK_CONCURRENCY="${AIKIDO_TASK_CONCURRENCY:-4}"
CODE_REPO="${AIKIDO_CODE_REPO:-Kong/insomnia-mockbin}"
CANDIDATE_FILE="${1:-${OUT_DIR}/candidate.json}"

# --- summary renderer (GitHub-flavoured markdown; every external value is escaped) ---
# Reads an aikido-diff.json. Findings are grouped per package; NEW findings come from the
# ephemeral scan and are not persisted in Aikido, so they never have issue/ticket links.
# shellcheck disable=SC2016 # jq program, not shell
SUMMARY_JQ='
  def esc: tostring | gsub("[|\\n\\r]"; " ") | gsub("<"; "&lt;") | gsub(">"; "&gt;");
  def sevrank: ({"critical":0,"high":1,"medium":2,"low":3}[.] // 4);
  def okurl: type == "string" and test("^https://[^\\s()<>\\[\\]]+$");
  def tlabel: if . == "container" then "container" else "codebase dependency" end;
  def counts_line($arr): ["critical","high","medium","low"]
    | map(. as $s | "\($s) \($arr | map(select(.severity == $s)) | length)")
    | join(" · ");
  # installed -> target: resolved shows the candidate version (or "removed"), else the fix version
  def bump($sec):
    (.version // null) as $v
    | (if $sec == "resolved" then
         (if (.candidate_version != null and .candidate_version != $v) then .candidate_version
          elif (.package_removed // false) then "removed"
          else .fixed_version end)
       else .fixed_version end) as $to
    | if $v != null and $to != null then "`\($v | esc) → \($to | esc)`"
      elif $v != null then "`\($v | esc)`" else "—" end;
  def jlinks(f): [ .[] | (f)[]
      | select(.url | okurl) | {u: .url, l: ((.key // "link") | esc)} ]
    | unique | map("[\(.l)](\(.u))") | if length == 0 then "—" else join(", ") end;
  # one link per finding: label #<issue_id> (old JSON without issue_id: #<group_id>)
  def links($u; $i; $g): [ .[] | select(.[$u] | okurl) | {u: .[$u], l: ("#" + ((.[$i] // .[$g] // "link") | esc))} ]
    | unique | map("[\(.l)](\(.u))") | if length == 0 then "—" else join(", ") end;
  def prep($sec):
    map(. + {bump: bump($sec)})
    | group_by([.type, .package, .bump])
    | map({ type: .[0].type, package: .[0].package, bump: .[0].bump,
            sev: (map(.severity) | sort_by(sevrank) | .[0]),
            ids: (map(.id) | unique | map(esc) | join(", ")),
            aikido: links("issue_url"; "issue_id"; "group_id"),
            jira: jlinks(.tickets // (if .ticket_url then [{url: .ticket_url, key: .ticket_key}] else [] end)),
            aikido_code: links("code_issue_url"; "code_issue_id"; "code_group_id"),
            jira_code: jlinks(.code_tickets // []) })
    | sort_by([(.type == "container" | not), (.sev | sevrank), .package]);
  # Codebase rows get a second Aikido + Jira pair for the code repo (own issue, own ticket);
  # OS packages exist only in the container repo, so their table keeps the single pair.
  def table($rows; $t):
    if $t == "container" then
      "| Severity | Type | Package | Bump | Ids | Aikido | Jira |",
      "|---|---|---|---|---|---|---|",
      ($rows[] | "| \(.sev | esc) | \(.type | tlabel) | \(.package | esc) | \(.bump) | \(.ids) | \(.aikido) | \(.jira) |")
    else
      "| Severity | Type | Package | Bump | Ids | Aikido (container) | Jira (container) | Aikido (code) | Jira (code) |",
      "|---|---|---|---|---|---|---|---|---|",
      ($rows[] | "| \(.sev | esc) | \(.type | tlabel) | \(.package | esc) | \(.bump) | \(.ids) | \(.aikido) | \(.jira) | \(.aikido_code) | \(.jira_code) |")
    end;
  def section($title; $sec; $open):
    if length == 0 then empty else
      (prep($sec)) as $all | ($all[:100]) as $rows
      | "<details\(if $open then " open" else "" end)><summary><b>\($title) (\(length) finding\(if length == 1 then "" else "s" end) in \($all | length) package\(if ($all | length) == 1 then "" else "s" end))</b></summary>", "",
        (("container", "codebase") as $t | ($rows | map(select(.type == $t))) as $g
          | if ($g | length) == 0 then empty else
              "**\(if $t == "container" then "Container: base image / OS packages" else "Codebase: application dependencies" end)**", "",
              table($g; $t), "" end),
        (if ($all | length) > 100 then "…and \($all | length - 100) more packages; see the `aikido-sbom-diff` artifact for the full JSON.", "" else empty end),
        "</details>", "" end;
  def banner:
    if .has_baseline | not then "⚠️ **No baseline found:** findings are reported without gating."
    elif ([.new[] | select(.severity == "high" or .severity == "critical")] | length) > 0 then
      "❌ **Blocking:** \([.new[] | select(.severity == "high" or .severity == "critical")] | length) new high/critical finding(s) in the candidate image."
    else "✅ **No new high/critical findings.**" end;
  "## Aikido SBOM diff", "",
  banner, "",
  "Baseline: `\(.baseline | esc)` · Candidate: `\(.candidate_source | esc)`", "",
  (if .has_baseline then
     "| 🆕 New | ➡️ Remaining | ✅ Resolved |", "|---|---|---|",
     "| \(.counts.new) | \(.counts.remaining) | \(.counts.resolved) |", "",
     (if (.counts.new + .counts.remaining + .counts.resolved) == 0 then "✨ **No findings in baseline or candidate.**", ""
      else
        "New: \(counts_line(.new))  ", "Remaining: \(counts_line(.remaining))  ", "Resolved: \(counts_line(.resolved))", "",
        (if .counts.new == 0 then "🆕 **No new findings.**", "" else (.new | section("🆕 New"; "new"; true)) end),
        "> New findings come from the ephemeral scan and are not persisted in Aikido, so they have no issue or Jira links (shown as —). Code columns apply to codebase dependencies only (— when the code repo issue is not found).", "",
        (.remaining | section("➡️ Remaining"; "remaining"; true)),
        (.resolved | section("✅ Resolved"; "resolved"; false))
      end)
   else
     (if .counts.findings_no_baseline == 0 then "✨ **No findings.**", ""
      else (.findings_no_baseline | section("Findings (no baseline)"; "new"; true)) end)
   end)'

render_summary() { # $1 = aikido-diff.json
  jq -r "${SUMMARY_JQ}" "$1"
}

if [[ -n "${AIKIDO_RENDER_FROM:-}" ]]; then
  render_summary "${AIKIDO_RENDER_FROM}"
  exit 0
fi

if [[ -z "${AIKIDO_CLIENT_ID:-}" || -z "${AIKIDO_CLIENT_SECRET:-}" ]]; then
  echo "::warning::AIKIDO_CLIENT_ID / AIKIDO_CLIENT_SECRET not set; skipping diff"
  exit 0
fi
mkdir -p "${OUT_DIR}"

get_token() {
  # Credentials go to curl via a config on stdin/fd, never argv (visible in ps)
  TOKEN="$(printf 'user = "%s:%s"\n' "${AIKIDO_CLIENT_ID}" "${AIKIDO_CLIENT_SECRET}" \
    | curl -fsS -K - -X POST "${API}/oauth/token" -H "Content-Type: application/json" \
        -d '{"grant_type":"client_credentials"}' | jq -r '.access_token // empty')"
  [[ -n "${TOKEN}" ]] || { echo "Failed to obtain Aikido access token" >&2; exit 2; }
  [[ -z "${GITHUB_ACTIONS:-}" ]] || echo "::add-mask::${TOKEN}"
}

# Aikido rate-limits the REST API (HTTP 429); curl retries 408/429/5xx with a fixed delay
api_get() {
  curl -fsS --retry 6 --retry-delay 20 --retry-max-time 240 \
    -K <(printf 'header = "Authorization: Bearer %s"\n' "${TOKEN}") "$@"
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

# shellcheck disable=SC2016 # jq program, not shell
NORMALISE='
  # Issue type: "container" (base image / OS package) or "codebase" (our app npm deps).
  # Single place to adjust. Order: scanner purl/ecosystem, then file path, then an apk-style
  # version revision (e.g. 2.44-r7). Aikido export attack_surface is deliberately unused:
  # every issue of a container repo is likely "docker_container". Heuristic, unverified.
  def classify:
    ((.purl // .package_url // "") | tostring | ascii_downcase) as $purl
    | ((.ecosystem // .package_manager // .package_type // "") | tostring | ascii_downcase) as $eco
    | ((.affected_file // .file // .path // "") | tostring) as $file
    | ((.installed_version // .version // "") | tostring) as $ver
    | if ($purl | test("^pkg:(apk|deb|rpm|alpine|debian)")) or ($eco | test("^(apk|deb|dpkg|rpm|alpine|debian|os)")) then "container"
      elif ($purl | startswith("pkg:npm")) or ($eco | test("^(npm|yarn|pnpm|node)")) then "codebase"
      elif ($file | test("/usr/local/lib/node_modules/|^/usr/lib/|^/lib/")) then "container"
      elif ($file | test("node_modules|package(-lock)?\\.json|yarn\\.lock|pnpm-lock")) then "codebase"
      elif ($ver | test("-r[0-9]+$")) then "container"
      else "codebase" end;
  def fixed:
    (.patched_versions // .fix_versions // .fixed_version // .patched_version // .fix_version // .fixed_in // null)
    | if type == "array" then (if length == 0 then null else join(", ") end)
      elif . == "" then null else . end;
  [ .[]
    | { package: (.affected_package // .package // .package_name // .name // "unknown"),
        id: (.cve_id // .cve // .vulnerability_id // .aikido_id // .rule_id // (.id | tostring)),
        severity: ((.severity // "unknown") | tostring | ascii_downcase),
        version: (.installed_version // .version // null),
        type: classify,
        fixed_version: fixed,
        group_id: (.group_id // null),
        issue_id: (.id // null | if . == null then null else tostring end),
        container_repo_id: (.container_repo_id // null),
        issue_url: null, tickets: [] }
    | select(.id != null) ]
  | unique_by([.package, .id])'

# --- baseline: needs only the Aikido API, not the candidate, so the workflow can prefetch it
# (AIKIDO_PREFETCH_ONLY=1) in the background while the scanner runs. Sets BASELINE and
# HAS_BASELINE; exits 2 if the baseline cannot be fetched.
build_baseline() {
get_token
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

# --- code repo (codebase dependency findings only; best effort, never fails the job) ---
# A codebase dependency issue group spans the container repo (our baseline) and the code repo;
# each location has its own issue id and its own Jira ticket. The code repo is resolved by
# AIKIDO_CODE_REPO_ID, else by name (AIKIDO_CODE_REPO) via the code repositories list, and must
# match exactly once. Any failure only leaves the code columns as —.
resolve_code_repo_id() {
  local ids
  if [[ -n "${AIKIDO_CODE_REPO_ID:-}" ]]; then
    [[ "${AIKIDO_CODE_REPO_ID}" =~ ^[0-9]+$ ]] || return 3
    echo "${AIKIDO_CODE_REPO_ID}"
    return 0
  fi
  # name is "<owner>/<repo>" or the bare repo name, compared case-insensitively
  ids="$(api_get -G "${API}/public/v1/repositories/code" \
      --data-urlencode "filter_name=${CODE_REPO##*/}" --data-urlencode "per_page=200" \
    | jq -r --arg r "${CODE_REPO}" '
        ($r | ascii_downcase) as $full | ($full | split("/") | last) as $base
        | (if type == "array" then . else (.repositories // .items // []) end)
        | map(select((.id | type == "number") and (.name | type == "string")
                     and ((.name | ascii_downcase) as $n | $n == $full or $n == $base)))
        | .[].id')" || return 2
  if [[ "$(grep -c . <<<"${ids}")" != "1" ]]; then
    echo "note: $(grep -c . <<<"${ids}") code repos match '${CODE_REPO}'; need exactly 1" >&2
    return 3
  fi
  echo "${ids}"
}

# Open issues of the code repo (same export as the container repo, different filter)
fetch_code_issues() { # $1 = code repo id
  api_get -G "${API}/public/v1/issues/export" \
    --data-urlencode "format=json" \
    --data-urlencode "filter_code_repo_id=${1}" \
    --data-urlencode "filter_status=open"
}

# --- link enrichment (baseline only; best effort, never fails the job) ---
# Aikido per-finding link from a URL template; Jira links from the issue group's tasks.
CODE_REPO_ID=""
CODE_ISSUES="[]"
if [[ "${HAS_BASELINE}" == "true" ]] && jq -e 'any(.[]; .type == "codebase")' <<<"${BASELINE}" >/dev/null 2>&1; then
  rc=0
  CODE_REPO_ID="$(resolve_code_repo_id)" || rc=$?
  if [[ "${rc}" == "0" ]]; then
    echo "note: code repo resolved to id ${CODE_REPO_ID}" >&2
    CODE_RAW="$(fetch_code_issues "${CODE_REPO_ID}")" || CODE_RAW=""
    CODE_ISSUES="$(jq "${NORMALISE}" <<<"${CODE_RAW}" 2>/dev/null)" || CODE_ISSUES=""
    [[ -n "${CODE_ISSUES}" ]] || { CODE_ISSUES="[]"; echo "note: code repo issues unavailable; code columns will be empty" >&2; }
  else
    CODE_REPO_ID=""
    echo "note: code repo not resolved (rc ${rc}); code columns will be empty" >&2
  fi
fi
# Match baseline codebase findings to the code repo's own issue by (package, id)
BASELINE="$(jq --argjson c "${CODE_ISSUES}" '
  ($c | map(select(.issue_id != null and .group_id != null)
            | {(([.package, .id] | @json)): {i: .issue_id, g: .group_id}}) | add // {}) as $cm
  | map(. as $r | $cm[[$r.package, $r.id] | @json] as $m
        | if $r.type == "codebase" and $m != null
          then . + {code_issue_id: $m.i, code_group_id: $m.g} else . end)' <<<"${BASELINE}" 2>/dev/null || echo "${BASELINE}")"
# {group_id}/{issue_id} are substituted only from [0-9A-Za-z_-]+ values over an https template
BASELINE="$(jq --arg t "${ISSUE_URL_TEMPLATE}" '
  def safe: tostring | test("^[0-9A-Za-z_-]+$");
  def mkurl($g; $i):
    if ($t | startswith("https://"))
       and ((($t | contains("{group_id}")) and (($g // "") | safe | not)) | not)
       and ((($t | contains("{issue_id}")) and (($i // "") | safe | not)) | not)
    then ($t | gsub("\\{group_id\\}"; ($g // "" | tostring)) | gsub("\\{issue_id\\}"; ($i // "" | tostring)))
    else null end;
  map(.issue_url = mkurl(.group_id; .issue_id)
      | if .code_issue_id != null then .code_issue_url = mkurl(.code_group_id; .code_issue_id) else . end)' \
  <<<"${BASELINE}" 2>/dev/null || echo "${BASELINE}")"
# Lookups run with bounded concurrency (rate-limit safe: api_get still retries 429). Each
# worker writes its own file; results are merged afterwards so the output is deterministic.
# A failed lookup leaves an empty file and only means no ticket link for that group.
# One fetch per unique group id serves both repos: a group's tasks cover every scope, and each
# task is filtered by its scope = {type, id} when merged below:
#   container ticket: type container_repo (or container) with id == the finding's container repo
#     id (string/int tolerant); a task with no scope at all falls back to its title ending in the
#     baseline image path (titles embed "<registry>/<image>");
#   code ticket: type code_repo with id == the resolved code repo id (no title fallback).
# Anything else (foreign scope, no match) is not linked: never guess.
lookup_task() { # $1 = group id, $2 = result file
  api_get "${API}/public/v1/issues/groups/${1}/tasks" 2>/dev/null \
    | jq -c --arg g "${1}" '
        (if type == "array" then . else (.tasks // []) end)
        | map(select(type == "object" and ((.url // "") | type == "string") and ((.url // "") | startswith("https://")))
              | {url: .url, key: ((.url | capture("(?<k>[A-Z][A-Z0-9]+-[0-9]+)") | .k) // null),
                 title: (.title // null | if type == "string" then . else null end),
                 st: (if (.scope | type) == "object" then (.scope.type // "" | tostring) else null end),
                 sid: (if (.scope | type) == "object" then (.scope.id // "" | tostring) else null end)})
        | select(length > 0) | {g: $g, tasks: .}' \
      >"$2" 2>/dev/null || : >"$2"
}
TASK_DIR="$(mktemp -d)"
trap 'rm -rf "${TASK_DIR}"' EXIT
lookups=0
while read -r gid; do
  [[ "${gid}" =~ ^[0-9A-Za-z_-]+$ ]] || continue
  if (( lookups >= MAX_TASK_LOOKUPS )); then
    echo "note: Jira lookup cap (${MAX_TASK_LOOKUPS}) reached; remaining groups have no ticket link" >&2
    break
  fi
  lookups=$((lookups + 1))
  # Wait for a free slot (wait -n needs bash >= 4.3; otherwise wait for all running jobs)
  while (( $(jobs -rp | wc -l) >= TASK_CONCURRENCY )); do wait -n 2>/dev/null || wait; done
  lookup_task "${gid}" "${TASK_DIR}/${gid}" &
done < <(jq -r '([.[] | .group_id | select(. != null) | tostring] | unique)
  + ([.[] | .code_group_id | select(. != null) | tostring] | unique) | .[]' <<<"${BASELINE}" | awk '!seen[$0]++')
wait
TASKS="$(cat "${TASK_DIR}"/* 2>/dev/null | jq -sc 'map({(.g): .tasks}) | add // {}' 2>/dev/null)" || TASKS=""
[[ -n "${TASKS}" ]] || TASKS="{}"
BASELINE="$(jq --argjson m "${TASKS}" --arg img "${BASELINE_IMAGE}" --arg code "${CODE_REPO_ID}" '
  # container repo per group: first container_repo_id seen in the group
  (map(select(.group_id != null and .container_repo_id != null))
   | group_by(.group_id | tostring)
   | map({key: (.[0].group_id | tostring), value: (.[0].container_repo_id | tostring)}) | from_entries) as $repos
  | def cmine($repo): if .st != null then
        (.st | test("^(container_repo|container)$")) and $repo != "" and .sid == $repo
      else (.title != null) and (.title | rtrimstr(" ") | endswith("/" + $img)) end;
    def kmine: $code != "" and .st == "code_repo" and .sid == $code;
    def tix: map({url: .url, key: .key}) | unique_by(.url);
  map((((.group_id // "") | tostring) as $g | ((.code_group_id // "") | tostring) as $cg
        | (if $g != "" and $m[$g] != null then .tickets = ($m[$g] | map(select(cmine($repos[$g] // ""))) | tix) else . end)
        | (if $cg != "" and $m[$cg] != null then .code_tickets = ($m[$cg] | map(select(kmine)) | tix) else . end)))' <<<"${BASELINE}")"
}

PREFETCH_FILE="${OUT_DIR}/baseline-prefetch.json"
if [[ "${AIKIDO_PREFETCH_ONLY:-}" != "1" ]] && [[ -s "${PREFETCH_FILE}" ]] \
  && jq -e '(.has_baseline | type == "boolean") and (.baseline | type == "array")' "${PREFETCH_FILE}" >/dev/null 2>&1; then
  echo "note: using prefetched baseline" >&2
  HAS_BASELINE="$(jq -r '.has_baseline' "${PREFETCH_FILE}")"
  BASELINE="$(jq -c '.baseline' "${PREFETCH_FILE}")"
else
  build_baseline
fi
if [[ "${AIKIDO_PREFETCH_ONLY:-}" == "1" ]]; then
  jq -n --argjson b "${BASELINE}" --argjson hb "${HAS_BASELINE}" '{has_baseline: $hb, baseline: $b}' \
    >"${PREFETCH_FILE}.tmp" && mv "${PREFETCH_FILE}.tmp" "${PREFETCH_FILE}"
  exit 0
fi

# --- candidate: ephemeral scanner output only (nothing is persisted in Aikido) ---
CANDIDATE="[]"
CANDIDATE_SOURCE="scanner-output"
if [[ -s "${CANDIDATE_FILE}" ]]; then
  CANDIDATE="$(jq '[ .. | objects
      | select(has("cve_id") or has("cve") or has("vulnerability_id") or has("aikido_id")) ]' \
    "${CANDIDATE_FILE}" 2>/dev/null | jq "${NORMALISE}" 2>/dev/null | jq 'map(.issue_id = null)' 2>/dev/null || echo "[]")"
fi

# --- diff ---
jq -n --argjson b "${BASELINE}" --argjson c "${CANDIDATE}" \
  --arg bn "${BASELINE_LABEL}" --arg src "${CANDIDATE_SOURCE}" --argjson hb "${HAS_BASELINE}" '
  def key: [.package, .id] | @json;
  ($b | map({(key): .}) | add // {}) as $bm |
  ($c | map({(key): .}) | add // {}) as $cm |
  ($c | group_by(.package) | map({(.[0].package): (map(.version) | map(select(. != null)) | sort | .[0])}) | add // {}) as $cv |
  { baseline: $bn, has_baseline: $hb, candidate_source: $src,
    resolved:  [$b[] | select($cm[key] == null)
                | . as $r | $r + {candidate_version: $cv[$r.package], package_removed: ($cv | has($r.package) | not)}],
    # remaining: candidate record plus the baseline issue/ticket links
    remaining: [$c[] | select($bm[key] != null) | . as $r | $bm[key] as $o
                | $r + {group_id: $o.group_id, issue_id: $o.issue_id, issue_url: $o.issue_url, tickets: $o.tickets,
                        code_issue_id: $o.code_issue_id, code_group_id: $o.code_group_id,
                        code_issue_url: $o.code_issue_url, code_tickets: ($o.code_tickets // []),
                        fixed_version: ($r.fixed_version // $o.fixed_version)}],
    new:       (if $hb then [$c[] | select($bm[key] == null)] else [] end),
    findings_no_baseline: (if $hb then [] else $c end) }
  | .counts = (with_entries(select(.value | type == "array")) | map_values(length))
' >"${OUT_DIR}/aikido-diff.json"

# --- summary ---
render_summary "${OUT_DIR}/aikido-diff.json" >>"${GITHUB_STEP_SUMMARY:-/dev/stdout}"

BLOCKING="$(jq '[.new[] | select(.severity == "high" or .severity == "critical")] | length' "${OUT_DIR}/aikido-diff.json")"
if [[ "${BLOCKING}" -gt 0 ]]; then
  echo "::error::${BLOCKING} new high/critical Aikido finding(s) in candidate image"
  exit 1
fi
