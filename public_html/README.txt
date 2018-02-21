This is a Game-engine and CMS for an adventure game a'la gamebooks we know from the 80ies. 
To try it out get the code and


1) Download and install Node
2) Start-up MongoDB locally:

- open cmd-prompt and go to mongoDB(C:\Program Files\MongoDB 2.6 Standard\bin) and paste in:
            mongod.exe --dbpath <location of db>
    since the storage is at that location instead default location

- to create new database, open new cmd-prompt go to C:\Program Files\MongoDB 2.6 Standard\bin and write mungo
    for further info look up at http://docs.mongodb.org/manual/tutorial/getting-started/
3) Start up node-server in new cmd-prompt and folder of the project by typing node server.js 
