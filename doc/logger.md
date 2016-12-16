#Logger

By default `PeerData` uses `ConsoleLogger` with log level **Error**

##Configure logger

###Set log level
```javascript
import PeerData, {LogLevel} from 'peer-data';

let logger = PeerData.logger;
logger.logLevel = LogLevel.INFO;
```

###Override logger

Create custom logger class remember to implement [Logger](../src/app/logger/logger.ts) interface

```javascript
import PeerData from 'peer-data';

class Logger{}

PeerData.logger = new Logger();
```