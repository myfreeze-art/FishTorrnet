# Security policy

## Supported versions

Security fixes go into the latest release. Please update before reporting.

## Reporting a vulnerability

Do not open a public issue for security problems. Use [private vulnerability reporting](https://github.com/myfreeze-art/FishTorrnet/security/advisories/new) on GitHub instead.

Please include:

- the FishTorrnet version and your system;
- what an attacker can do and under which conditions;
- steps or a proof of concept to reproduce it.

We will confirm that we received the report, keep you informed while we work on a fix and credit you in the release notes if you wish.

## Scope

Most useful are reports about:

- the HTTP API and its access key, including remote access from other devices;
- FishGuard checks that can be bypassed;
- parsing of .torrent files, magnet links and resume data from other clients;
- the desktop app's handling of links and files passed by the system.
