# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

## [0.0.12] - 2019-07-14

### Fixed
- audio icon on sidebar tab in system theme
- fix themed handling for favicons

## [0.0.11] - 2019-07-07

### Changed
- sidebar name & icon

### Fixed
- scrollbar and fixed footer action in sidebar for system theme

### Removed
- pinned tab rendering code

## [0.0.10] - 2019-07-01

### Added
- "system" theme using `prefers-color-scheme` media
- locales for Japanese and Traditional Chinese
- search progress indicator
- drag tab group to new window

### Changed
- search style updates

### Fixed
- text interaction weirdness for search
- drag active group to other window

## [0.0.9] - 2019-03-31

### Added
- use sync for config settings
- incremental display search results
- use native hilighted tabs for multi-drag

### Fixed
- scrollbar display on windows

## [0.0.8] - 2019-02-24

### Added
- integration for native browser highlighted tabs

### Changed
- default to dark theme

### Fixed
- skip search for `about:` urls

## [0.0.7] - 2018-10-14

### Added
- hover for full group name
- audible icon for tab group in action

### Changed
- action tab group open improvements

## [0.0.6] - 2018-08-29

### Added
- handling for favicons blocked by tracking protection

### Changed
- improve search interactions
- styling improvements to browser action
- sidebar closed on launch

### Fixed
- selection bug for drag & drop

## [0.0.5] - 2018-08-24

### Added
- browser action with group list
- extension icon
- shift-click for multiple select drag

### Changed
- minor UI improvements

## [0.0.4] - 2018-05-09

### Added
- support for multi-account containers
- allow dragging to url bar, native tabs, library, and bookmarks

### Changed
- search styling updates and performance improvements

### Fixed
- search clear error
- consistency improvements to state load on browser launch

## [0.0.3] - 2018-04-29

### Added
- tab search
- dynamic feature detection for contextual identities & tabhide

### Changed
- drag and drop improvements
  - drag over group to open
  - native drag handling
    - from url bar
    - from link
    - from bookmark
    - from bookmark folder
  - ctrl-click to select and drag multiple tabs at a time
  - ui animations
- smaller view for tabs

### Fixed
- improve native index handling of multi-tab moves
- active tab group detection during move to new group
- prevent closing last tab group in a window

[Unreleased]: https://github.com/amccausl/tabulate/compare/master...develop
[0.0.12]: https://github.com/amccausl/tabulate/compare/v0.0.11...v0.0.12
[0.0.11]: https://github.com/amccausl/tabulate/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/amccausl/tabulate/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/amccausl/tabulate/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/amccausl/tabulate/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/amccausl/tabulate/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/amccausl/tabulate/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/amccausl/tabulate/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/amccausl/tabulate/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/Quicksaver/Tab-Groups/compare/master...amccausl:v0.0.3
