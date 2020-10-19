### Run in docker

```
docker build --pull -t gelf2azure:latest .

docker run --rm -it `
    -p 12201:12201/udp `
    -p 8080:8080 `
    -v 'C:\Users\gimmi\Sources\gelf2azure:/data' `
    -e DEBUG=app:* `
    gelf2azure:latest `
    file:///data/config.json
```

### Send test messages

```
nc.exe -u 127.0.0.1 12201
{ "host": "example.org", "short_message": "xoxo", "timestamp": 1602850875.683, "_container_name": "agitated_goldberg" }
```

### Send message from Docker container

```
docker run --rm -it --log-driver gelf –-log-opt gelf-address=udp://172.16.0.13:12201 alpine echo 'Some thing'
```
