## Logging

### Requirements
-  [winston@3](https://github.com/winstonjs/winston/tree/2.x)

### Files
- combined.log
- error.log
- exception.log
- http_success.log
- http_error.log

### Log levels
- emerg: 0
- alert: 1
- crit: 2
- error: 3
- warning: 4
- notice: 5
- info: 6
- debug: 7
### How it works 
All log files are found in the logs directory. The logs are categorized into five main categories: combined.log, error.log, exception.log, http_success.log, and http_error.log. Logs are rotated daily with each day having a separate log file. Files are removed from the storage disk after a period of 30days.

### Combined
All log levels from 0 - 7 are stored here

### Error
All log levels from 0 - 3 are stored here

### Exception
Only unhandled exceptions are stored here 

### Http_sucess
All http request with status code <= 599 and status code >= 400 are stored here 

### Http_error
All http request with status code <= 399 and status code >= 100 are stored here 


