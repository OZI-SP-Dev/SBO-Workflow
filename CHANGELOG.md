# Changelog

All notable changes to this project will be documented in this file.
Include any required SharePoint changes that will be needed to deploy you PR
Update the version number in package.json when submitting your PR

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

## [1.2.0] 2024-02-21

## Added

- Added SBA PCR email capability
  - Added the SBAPCREmail as a plain text field that supports .mil and .gov email addresses (Will remove SBAPCR field from SP after burn in)
  - Added PCREmails list, which when a record is added to it, it will kick off a PowerAutomate to send email to PCR
  - Added a status indicator for those "In Queue" or "Errored"
  - Removed the auto email sent from tool on change to SBA PCR and instead send it via PowerAutomate when PCR email succeeds
  - If the documents total more than 35MB, then the above process is ignored, and they must acknowledge they manually sent outside of the tool

## [1.1.0] 2023-03-28

- Setting to v 1.1.0 as file was not kept up to date, but this has been in production for over 1 year

### Changed

- Upgraded package dependencies to latest minor of currently in use major versions
- Upgraded fluentui from 7 to fluentui 8
- Migrated from uifabric 7 to fluentui 8
- Removed unused jest dependencies
- "Prettier" formatted many files
- Replaced getElementById with Ref
- Replaced useEffect based file management with more straightforward change event based management
- Added types to InternalError handlers (still needs reworked)

## [0.0.2] 2021-01-05

### Fixed

- Solicitation number special character restrictions added to prevent # % " \* : < > ? / \ |

## [0.0.1] 2020-12-16

### Added

- Page Header and placeholder routes

### Types of changes

- Added for new features.
- Changed for changes in existing functionality.
- Deprecated for soon-to-be removed features.
- Removed for now removed features.
- Fixed for any bug fixes.
- Security in case of vulnerabilities.
