#!/bin/sh
# DO_NOT_TOUCH guard — portable copy. Install per clone:
#   cp OPERATIONS/guard_pre-push.sh .git/hooks/pre-push
# Blocks pushes to 'main' (production / Vercel auto-deploy) unless ALLOW_MAIN_PUSH=1.
# See OPERATIONS/DO_NOT_TOUCH.md.
while read local_ref local_sha remote_ref remote_sha; do
  case "$remote_ref" in
    refs/heads/main)
      if [ "$ALLOW_MAIN_PUSH" != "1" ]; then
        echo "" 1>&2
        echo "==================================================================" 1>&2
        echo " DO_NOT_TOUCH guard: push to 'main' BLOCKED." 1>&2
        echo " main = production (Vercel auto-deploys finacalleos.com)." 1>&2
        echo " Production changes need Anthony's explicit approval." 1>&2
        echo " See OPERATIONS/DO_NOT_TOUCH.md. To proceed WITH approval:" 1>&2
        echo "     ALLOW_MAIN_PUSH=1 git push <remote> <branch>" 1>&2
        echo "==================================================================" 1>&2
        exit 1
      fi
      ;;
  esac
done
exit 0
