Add a changeset for every beauty-sdk change a brand would notice:
`npm run changeset`. `npm run version-packages` turns them into a version
bump and CHANGELOG entry; tag the release `beauty-sdk-v<version>`.

Before tagging, run `npm run version-packages`, commit the version bump and
CHANGELOG, and only then tag `beauty-sdk-v<that version>`: CI rejects a tag
that differs from package.json.
