# plainkit: vanilla ESM + CSS. No build. Sites copy src/ and css/.
#
# Quick start:
#   make help
#   make check
#   make preview

.DEFAULT_GOAL := help

PREVIEW_PORT := $(if $(strip $(PLAINKIT_PREVIEW_PORT)),$(PLAINKIT_PREVIEW_PORT),8091)
PREVIEW_PID  := .preview.pid

REQUIRED_FILES := \
	src/interceptor.js src/pubsub.js src/provider.js src/live.js \
	src/session.js src/locale.js src/bind.js src/dialog.js src/tabs.js \
	src/time.js src/index.js \
	css/tokens.css css/base.css css/layout.css css/forms.css \
	css/components.css css/live.css \
	pages/403.html pages/404.html pages/500.html \
	CHANGELOG.md AGENTS.md README.md LICENSE VERSION \
	40k-foot-view.md how-do-i.md canonical-layout-patterns.md \
	docs/agents/public-milestones.md \
	demo/index.html demo/sink.html demo/demo.js \
	demo/session.html demo/session.js \
	demo/restricted.html demo/restricted.js \
	demo/locale.html demo/locale.js demo/locales/de.json \
	demo/invite-qr.svg \
	demo/recipes/index.html \
	demo/recipes/login.html demo/recipes/login.js \
	demo/recipes/items.html demo/recipes/items.js \
	demo/recipes/settings.html demo/recipes/settings.js \
	demo/recipes/accounts.html \
	demo/recipes/table.html demo/recipes/table.js \
	demo/recipes/invite.html demo/recipes/invite.js \
	demo/recipes/status.html demo/recipes/status.js \
	demo/recipes/list.html demo/recipes/list.js \
	demo/recipes/room.html demo/recipes/room.js \
	demo/recipes/denied.html demo/recipes/denied.js \
	demo/recipes/dashboard.html demo/recipes/dashboard.js \
	demo/recipes/menu.html demo/recipes/menu.js \
	demo/recipes/activity.html demo/recipes/activity.js \
	demo/recipes/related.html demo/recipes/related.js \
	demo/recipes/popover.html demo/recipes/popover.js \
	demo/recipes/hint.html demo/recipes/hint-help.html

FORBIDDEN_SRC := \
	src/table.js src/pager.js src/sheet.js src/drawer.js src/menu.js \
	src/graph.js src/toast.js src/autofill.js src/timeline.js src/steps.js \
	src/popover.js src/hint.js src/dashboard.js src/chart.js src/metric.js \
	src/motion.js src/animate.js

.PHONY: help check preview preview-stop release

##@ General

help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} \
		/^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2 } \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) }' $(MAKEFILE_LIST)
	@echo ""
	@echo "Env:"
	@echo "  PLAINKIT_PREVIEW_PORT  override port (default 8091)"
	@echo "  VERSION                required for make release (stable X.Y.Z, no v prefix)"
	@echo ""
	@echo "  make release VERSION=X.Y.Z    write VERSION (no commit, tag, or push)"
	@echo ""

##@ Release

release: export RELEASE_VERSION := $(value VERSION)
release: ## Write VERSION=X.Y.Z (no commit, tag, or push)
	@sh scripts/release.sh

##@ Develop

check: ## Confirm toolkit files and architecture gates
	@for f in $(REQUIRED_FILES); do \
		test -f "$$f" || { echo "ERROR: missing $$f"; exit 1; }; \
	done
	@for f in $(FORBIDDEN_SRC); do \
		if test -f "$$f"; then echo "ERROR: forbidden $$f"; exit 1; fi; \
	done
	@grep -q 'docs/agents/public-milestones.md' AGENTS.md
	@grep -q '^# Changelog' CHANGELOG.md
	@grep -q 'keepachangelog.com' CHANGELOG.md
	@grep -q '## \[Unreleased\]' CHANGELOG.md
	@grep -q 'MIT License' LICENSE
	@grep -q '\[hidden\]' css/layout.css
	@grep -q 'pk-note\[hidden\]' css/components.css
	@grep -q 'pk-app' css/layout.css
	@grep -q 'pk-pager' css/layout.css
	@grep -q 'pk-table' css/components.css
	@grep -q 'pk-stat' css/components.css
	@grep -q 'pk-sheet' css/components.css
	@grep -q 'pk-popover' css/components.css
	@grep -q 'pk-hint' css/components.css
	@grep -q 'pk-hint-warn' css/components.css
	@grep -q 'pk-hint-err' css/components.css
	@grep -q 'pk-timeline' css/components.css
	@grep -q 'pk-steps' css/components.css
	@grep -q 'pk-qr' css/components.css
	@grep -q 'pk-pre' css/components.css
	@grep -q 'pk-roster' css/live.css
	@grep -q 'html\[data-theme="light"\]' css/tokens.css
	@grep -q 'pk-theme-light' css/tokens.css
	@grep -q -- '--pk-motion' css/tokens.css
	@grep -q 'prefers-reduced-motion' css/tokens.css
	@grep -q 'SessionProvider' src/index.js
	@grep -q 'applyLocale' src/index.js
	@grep -q 'redirectOnStatus' src/index.js
	@grep -q 'paintTimes' src/index.js
	@grep -q 'timeZone' src/index.js
	@grep -q 'noteZone' src/index.js
	@grep -q 'bindField' src/index.js
	@grep -q 'options.tick' src/live.js
	@grep -q 'send-dropped' src/live.js
	@grep -q 'session.guard' demo/restricted.js
	@grep -q 'pk-cover' pages/403.html
	@grep -q 'id="other"' demo/recipes/login.html
	@grep -q "tick: 'seconds'" demo/demo.js
	@grep -q "tick: 'seconds'" demo/recipes/room.js
	@grep -q 'send-dropped' demo/sink.html
	@grep -q 'live.css' demo/sink.html
	@grep -q 'live.css' demo/recipes/room.html
	@grep -q 'bindList' demo/recipes/table.js
	@grep -q 'replaceState' demo/recipes/table.js
	@if grep -q setInterval demo/demo.js demo/recipes/*.js; then \
		echo "ERROR: page scripts must not start their own clock"; \
		exit 1; \
	fi
	@if grep -E 'pushState' demo/recipes/*.js demo/demo.js; then \
		echo "ERROR: recipes must not use pushState"; \
		exit 1; \
	fi
	@if grep -E 'pages < 2' demo/recipes/table.js demo/recipes/list.js; then \
		echo "ERROR: pager must not hide or omit steps when pages < 2"; \
		exit 1; \
	fi
	@if grep -q 'items.create' demo/recipes/table.js; then \
		echo "ERROR: paged table must not use collection create() as the snapshot"; \
		exit 1; \
	fi
	@if grep -E 'pk-drawer|hamburger' css/components.css css/layout.css demo/recipes/menu.html demo/recipes/menu.js; then \
		echo "ERROR: no left drawer or hamburger library"; \
		exit 1; \
	fi
	@if grep -E 'new Graph|forceLayout|force-layout|neo4j|cypher' src/*.js demo/recipes/related.js demo/recipes/related.html; then \
		echo "ERROR: related records must not be a graph view"; \
		exit 1; \
	fi
	@if grep -E 'openDialog' demo/recipes/popover.js demo/recipes/popover.html; then \
		echo "ERROR: popover recipe must not use dialog helpers"; \
		exit 1; \
	fi
	@if grep -E 'popovertarget' demo/recipes/hint.html demo/recipes/hint-help.html; then \
		echo "ERROR: hint recipe must not use popovertarget"; \
		exit 1; \
	fi
	@if grep -E 'pk-btn-icon' demo/recipes/hint.html; then \
		echo "ERROR: hint recipe must not use pk-btn-icon"; \
		exit 1; \
	fi
	@if grep -E 'timeAgo|TimezoneProvider' src/time.js demo/recipes/activity.js demo/demo.js; then \
		echo "ERROR: no timeAgo or TimezoneProvider"; \
		exit 1; \
	fi
	@if grep -E 'pk-toast|notification-center' src/*.js css/components.css css/layout.css; then \
		echo "ERROR: no toast stack or notification center"; \
		exit 1; \
	fi
	@if grep -q 'pk-sheet' demo/recipes/activity.html demo/recipes/settings.html demo/recipes/table.html demo/recipes/dashboard.html demo/recipes/accounts.html; then \
		echo "ERROR: do not add a sheet to host the timezone toggle"; \
		exit 1; \
	fi
	@if grep -E '(^|[[:space:].])dash-' demo/recipes/dashboard.html demo/recipes/dashboard.js css/components.css css/layout.css css/forms.css; then \
		echo "ERROR: no dash- classes"; \
		exit 1; \
	fi
	@if grep -E 'data-chart-type|data-src' demo/recipes/dashboard.html demo/recipes/dashboard.js; then \
		echo "ERROR: no data-src / data-chart-type widgets"; \
		exit 1; \
	fi
	@if grep -Ei 'accounts\.google|googleapis|gsi/client' demo/recipes/login.js demo/recipes/login.html; then \
		echo "ERROR: login must not call Google"; \
		exit 1; \
	fi
	@if grep -E 'Reed-Solomon|qrcode|QRCode' src/*.js; then \
		echo "ERROR: kit must not encode QR codes"; \
		exit 1; \
	fi
	@if grep -E 'radial-gradient' css/layout.css css/forms.css css/components.css css/live.css; then \
		echo "ERROR: glow wash should be --pk-glow-wash, not a hardcoded ellipse"; \
		exit 1; \
	fi
	@if grep -E '\.ee-|--ee-' css/tokens.css css/base.css css/layout.css css/forms.css css/components.css css/live.css; then \
		echo "ERROR: default CSS still has .ee- or --ee-"; \
		exit 1; \
	fi
	@if grep -E 'gsap|lottie|anime\.js|velocity\.js' css/*.css src/*.js demo/*.js demo/recipes/*.js; then \
		echo "ERROR: no animation library"; \
		exit 1; \
	fi
	@echo "==> check passed"

preview: ## Serve demo at http://localhost:8091/demo/
	@command -v python3 >/dev/null || { echo "ERROR: python3 is required for preview"; exit 1; }
	@if [ -f "$(PREVIEW_PID)" ] && kill -0 $$(cat "$(PREVIEW_PID)") 2>/dev/null; then \
		echo "==> Preview already running at http://localhost:$(PREVIEW_PORT)/demo/"; \
		exit 0; \
	fi
	@echo "==> Preview -> http://localhost:$(PREVIEW_PORT)/demo/"
	@python3 -m http.server $(PREVIEW_PORT) --bind 127.0.0.1 >/dev/null 2>&1 & echo $$! > "$(PREVIEW_PID)"
	@echo "==> Open http://localhost:$(PREVIEW_PORT)/demo/"

preview-stop: ## Stop local preview
	@if [ -f "$(PREVIEW_PID)" ]; then \
		kill $$(cat "$(PREVIEW_PID)") 2>/dev/null || true; \
		rm -f "$(PREVIEW_PID)"; \
		echo "==> Preview stopped"; \
	else \
		echo "==> Preview not running"; \
	fi
