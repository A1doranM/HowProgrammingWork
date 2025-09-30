## Logging

Requirements:
- Support tty
- Support files
- Support custom Writable
- Support structured logging
- Support custom serializer and default serializer
- Support multiple colors
- Support application and module
- Support logging kind (not level)
- Generate multiple log functions

Additional requirements:
- Do not generate big files (divide periodically)
- Use sortable file names
- Do not write to the same file from different processes
- Delete old files
- Use buffering (flush by size and by timeout)
- Optimize Writable stream buffering
- Write multiline to single string
- Optimize stack for logging errors
- Write to multiple destinations
