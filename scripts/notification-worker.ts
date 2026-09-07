import {setTimeout} from 'node:timers/promises';
import {processNextNotification} from '../src/server/notificationWorker';
import {maintenance} from '../src/server/maintenance';
import {database} from '../src/server/db';
let stopping=false;
process.on('SIGTERM',()=>{stopping=true;});process.on('SIGINT',()=>{stopping=true;});
async function main() {
  let nextMaintenance=0;
  while(!stopping) {
    try {
      if(Date.now()>=nextMaintenance){await maintenance();nextMaintenance=Date.now()+60000;}
      if(!await processNextNotification())await setTimeout(1000);
    }catch(error){console.error('worker-cycle-failed',error instanceof Error?error.name:'UnknownError');await setTimeout(5000);}
  }
  await database().end();
}
main().catch(()=>{console.error('worker-start-failed');process.exitCode=1;});
