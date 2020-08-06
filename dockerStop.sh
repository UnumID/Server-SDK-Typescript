# $(docker ps -a -q) will return all the running processes.  This can be changed to get selected processes
docker stop $(docker ps -a -q --filter "ancestor=verifierapp")