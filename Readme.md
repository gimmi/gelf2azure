### Run in docker

```
docker build --pull `
    --build-arg HTTP_PROXY=http://my.proxy.com:80 `
    --build-arg HTTPS_PROXY=http://my.proxy.com:80 `
    -t gelf2azure:latest .

docker run --rm -it `
    -p 12201:12201/udp `
    -p 54313:54313 `
    -e DEBUG=app:* `
    -e HTTPS_PROXY=http://my.proxy.com:80 `
    -e AZURE_CUSTOMER_ID=TODO `
    -e AZURE_SHARED_KEY=TODO `
    -e AZURE_LOG_TYPE=TODO `
    -e AZURE_BATCH_MS=TODO `
    gelf2azure:latest
```

### Send test messages

```
nc.exe -u 127.0.0.1 12201
{ "host": "example.org", "short_message": "xoxo", "timestamp": 1602850875.683, "_container_name": "agitated_goldberg" }
```

### Send message from Docker container

```
docker run --rm -it --log-driver gelf --log-opt gelf-address=udp://172.16.0.13:12201 alpine echo 'Some thing'
```

### Setup Docker to send logs to gelf2azure

```
vi /etc/docker/daemon.json

{
    "log-driver": "gelf",
    "log-opts": {
        "gelf-address": "udp://172.16.0.13:12201"
    }
}
```
