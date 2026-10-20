#!/usr/bin/env bash
# Merges a pull request from the class photo upload page once its tests have
# passed, then starts the deploy. Run by .github/workflows/merge-class-photos.yml.
#
# Needs REPO, HEAD_BRANCH and HEAD_SHA (from the Tests run) and GH_TOKEN.
# DRY_RUN=1 runs every check and says what it would do, without merging.
set -euo pipefail

BOT='asmbly-class-photos-upload[bot]'
BASE='main'
IMAGES_DIR='app/src/lib/images'
# The upload page adds one .jpg and removes other images of the same class with
# these extensions (image_extensions in configs/class_photo_upload.json in
# asmbly-facilities-and-maintenance-tracking-automation).
ADDED_PATTERN="^${IMAGES_DIR}/[^/]+\.jpg$"
REMOVED_PATTERN="^${IMAGES_DIR}/[^/]+\.(avif|gif|heif|jpeg|jpg|png|tiff|webp)$"

skip() {
  echo "Not merging: $1"
  exit 0
}

refuse() {
  echo "::error::Not merging: $1 It needs a person to review it."
  exit 1
}

# The key the class list matches an image by: simplifyName in getClassImage
# (app/src/lib/models/neonEventInstance.js).
fuzzy_key() {
  local key
  key=$(tr '[:upper:]' '[:lower:]' <<<"${1##*/}")
  key=${key//[[:space:]:_-]/}
  key=${key/&/and}
  echo "${key%%.*}"
}

number=$(gh api -X GET "repos/$REPO/pulls" -f state=open -f base="$BASE" -f head="${REPO%%/*}:$HEAD_BRANCH" |
  jq -r '.[0].number // empty')
[[ -n $number ]] || skip "there is no open pull request from $HEAD_BRANCH into $BASE."

# The list above leaves out changed_files, so read the whole pull request.
pr=$(gh api "repos/$REPO/pulls/$number")
[[ $(jq -r .user.login <<<"$pr") == "$BOT" && $(jq -r .user.type <<<"$pr") == Bot ]] ||
  skip "#$number was not opened by $BOT."
[[ $(jq -r .head.repo.full_name <<<"$pr") == "$REPO" ]] || skip "#$number is not from a branch in $REPO."
# A newer commit gets its own test run, which decides for it.
[[ $(jq -r .head.sha <<<"$pr") == "$HEAD_SHA" ]] || skip "#$number has moved past the tested commit $HEAD_SHA."

others=$(gh api --paginate "repos/$REPO/pulls/$number/commits" |
  jq -r --arg bot "$BOT" '.[] | select(.author.login != $bot) | .sha[0:7]' | paste -sd ' ' -)
[[ -z $others ]] || refuse "#$number has commits that $BOT didn't make: $others."

files=$(gh api --paginate "repos/$REPO/pulls/$number/files" |
  jq -r '.[] | [.status, .filename, .previous_filename // ""] | @tsv')
[[ -n $files ]] || refuse "#$number changes no files."
[[ $(wc -l <<<"$files") -eq $(jq -r .changed_files <<<"$pr") ]] ||
  refuse "#$number lists a different number of files than it changes."

added=()
removed=()
while IFS=$'\t' read -r status filename previous; do
  case $status in
    added | modified) [[ $filename =~ $ADDED_PATTERN ]] && added+=("$filename") ;;
    removed) [[ $filename =~ $REMOVED_PATTERN ]] && removed+=("$filename") ;;
    renamed) [[ $previous =~ $REMOVED_PATTERN && $filename =~ $ADDED_PATTERN ]] &&
      removed+=("$previous") && added+=("$filename") ;;
    *) false ;;
  esac || refuse "#$number has $status file $filename, which the upload page never changes."
done <<<"$files"

[[ ${#added[@]} -eq 1 ]] || refuse "#$number adds or replaces ${#added[@]} photos instead of one."
photo=${added[0]}
key=$(fuzzy_key "$photo")
# classDefault.jpg, lasersDefault.jpg and the rest are the fallbacks for classes without a photo.
[[ $key != *default ]] || refuse "#$number changes $photo, which matches a fallback image."
if ((${#removed[@]})); then
  for path in "${removed[@]}"; do
    [[ $(fuzzy_key "$path") == "$key" ]] || refuse "#$number removes $path, which isn't an image of the same class as $photo."
  done
fi

if [[ ${DRY_RUN:-} == 1 ]]; then
  echo "Dry run: would merge #$number at $HEAD_SHA and start build-and-push.yml."
  exit 0
fi

# sha makes GitHub refuse the merge if the pull request moved since these checks.
gh api -X PUT "repos/$REPO/pulls/$number/merge" -f merge_method=squash -f sha="$HEAD_SHA" >/dev/null
echo "Merged #$number."

# A merge made with the workflow's token doesn't start push workflows, so start the deploy here.
gh workflow run build-and-push.yml --repo "$REPO" --ref "$BASE"
echo "Started build-and-push.yml on $BASE."
