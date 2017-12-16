# usage-monitor-client
A tool made for automatically connect to a defined WebSocket server, emit identification event and start transmitting JSON packages containing host's resources usage.
## Basic setup
* change the WebSocket server address that is passed as a argument to the socket.io-client object creation in the `web/si-wc.js` file. The place is indicated with a corresponding commet.
* perform `docker-compose up -d --build` in the main repo catalog
#### optional steps for automatic deploy over rancher using gitlab
* change `RANCHER_ACCESS_KEY`, `RANCHER_SECRET_KEY`, `RANCHER_PROJECT_URL` accordingly in the `.gitlab-ci.yml` file
* move the repository to gitlab.com, pushing will automatically trigger CI pipeline that will ultimately deploy using rancher.
