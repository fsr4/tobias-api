# TOP Tool API

## Develop locally
To run the project locally, you need Docker/Docker Compose installed on your computer. To start the API server, run the following docker command:
```sh
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

If you want to test the mailing functionality, you need to set up an SMTP server for sending mails. Just copy the `.env.sample` file and fill in your mail server login information. 
