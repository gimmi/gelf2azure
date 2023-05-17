**gelf2azure is a Docker container that receive logs in GELF format from UDP, and forward it to Azure Monitor using REST API.**

This is designed to integrate nicely with [gelf built-in Docker logging plugin](https://docs.docker.com/config/containers/logging/gelf/) in input, and [Azure Monitor HTTP Data Collector API](https://docs.microsoft.com/en-us/azure/azure-monitor/logs/data-collector-api) in output.

As an extra bonus, it also expose a tiny web application that shows the logs as they arrive, providing a tail-like experience.

![](https://user-images.githubusercontent.com/6589/114262006-ce20a480-99dd-11eb-924f-1cb0c322dbcd.png)


### Getting started

Open a terminal and launch gelf2azure docker container:

```
docker run --rm -it -p 12201:12201/udp -p 54313:54313 gimmi/gelf2azure:latest
```

Open with your browser http://127.0.0.1:54313

Open another terminal and send sample log from a Docker container

```
docker run --rm -it \
  --name my_container \
  --log-driver gelf \
  --log-opt gelf-address=udp://127.0.0.1:12201 \
  alpine echo 'Hello world!'
```

You should see the log "Hello world!" appear in the browser window:

![](https://raw.githubusercontent.com/gimmi/gelf2azure/main/docs/browser.png)

Message can be sent from any source, as long as GELF format is used.

With `netcat`

```
nc.exe -u 127.0.0.1 12201
{ "host": "example.org", "short_message": "xoxo", "timestamp": 1602850875.683, "_container_name": "agitated_goldberg" }
```

Or in bash

```
echo -n '{"host":"example.org","short_message":"xoxo","timestamp":1602850875.683,"_container_name":"agitated_goldberg"}' > /dev/udp/127.0.0.1/12201
```

### Configuration Options

Configuration is done by passing environment variables:

| Environment Variable | Default | Description                                                                                                          |
|:---------------------|:--------|:---------------------------------------------------------------------------------------------------------------------|
| AZURE_CUSTOMER_ID    |         | `CustomerID` (AKA Workspace ID) parameter for [Azure API][1]. Leaving this unset will disable sending data to Azure. |
| AZURE_SHARED_KEY     |         | `SharedKey` (AKA Primary Key) parameter for [Azure API][1]                                                           |
| AZURE_LOG_TYPE       |         | `Log-Type` parameter for [Azure API][1]                                                                              |
| AZURE_BATCH_MS       | 5000    | How often data is collected for send to Azure Monitor                                                                |
| AZURE_TIMEOUT_MS     | 30000   | Timeout for Azure Monitor REST call                                                                                  |
| HTTPS_PROXY          |         | Set proxy if needed, something like `http://my.proxy.com:80`                                                         |
| DEBUG                |         | Use value `app:*` to enable internal logging. Useful for troubleshooting                                             |

### Create Azure Log Analytics Workspace

Execute the following commands in Azure CLI:

```
az monitor log-analytics workspace create \
    --subscription my_subs \
    --resource-group my_group \
    --location westeurope \
    --workspace-name my-la-ws
{
  "customerId": "THIS IS AZURE_CUSTOMER_ID"
}

az monitor log-analytics workspace get-shared-keys \
    --subscription my_subs \
    --resource-group my_group \
    --workspace-name my-la-ws
{
  "primarySharedKey": "THIS IS AZURE_SHARED_KEY"
}
```

### Setup Docker to send logs to gelf2azure

gelf2azure is designed to be used with [gelf built-in Docker logging plugin](https://docs.docker.com/config/containers/logging/gelf/). To enable it, modify `/etc/docker/daemon.json` as follows:

```json
{
    "log-driver": "gelf",
    "log-opts": {
        "gelf-address": "udp://172.16.0.13:12201"
    }
}
```

### Other projects with similar goals

- [logspout-loganalytics](https://github.com/veyalla/logspout-loganalytics)

### Build from sources

```
docker build --pull --no-cache -t gimmi/gelf2azure:latest .
```

[1]: https://docs.microsoft.com/en-us/azure/azure-monitor/platform/data-collector-api
