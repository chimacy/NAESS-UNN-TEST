-- Run after 001. Demo statistics (replace in Admin > Homepage > Association stats) and hero defaults.
update homepage_sections set config = '{"items":[{"label":"Add statistic (demo)","value":"0"}]}' where key = 'stats';
update homepage_sections set config = '{"overlay":true,"show_event":true}' where key = 'hero';
