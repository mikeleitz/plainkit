#!/bin/sh
# Prepare version metadata only. Commit, tag, and publication stay outside this script.
set -eu
cd "$(dirname "$0")/.."
version=${RELEASE_VERSION-}
case "$version" in
    *[!0-9.]*|'')
        echo 'ERROR: supply a stable version: make release VERSION=X.Y.Z (digits and dots only)' >&2
        exit 1
        ;;
esac
if ! printf '%s\n' "$version" | LC_ALL=C grep -Eq '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'; then
    echo 'ERROR: supply a stable version: make release VERSION=X.Y.Z (no v prefix or leading zeroes)' >&2
    exit 1
fi
test -f VERSION || { echo 'ERROR: missing VERSION' >&2; exit 1; }
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT HUP INT TERM
printf '%s\n' "$version" > "$scratch/VERSION"
if ! cmp -s "$scratch/VERSION" VERSION; then
    temp=$(mktemp VERSION.XXXXXX)
    if ! cat "$scratch/VERSION" > "$temp" || ! chmod 644 "$temp" || ! mv "$temp" VERSION; then
        rm -f "$temp"
        echo 'ERROR: version preparation failed. Fix the filesystem error and rerun.' >&2
        exit 1
    fi
fi
printf 'Prepared version %s. No commit, tag, build, or publication performed.\n' "$version"
