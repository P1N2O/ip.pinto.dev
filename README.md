# ip.8080.li
A simple HTTP server that returns the visitor's IP address in Plain Text, JSON, JSONP or XML format along with optional geographic information.

## Usage
#### Get IP Only
```bash
# Plain Text
curl -L ip.8080.li

# JSON
curl -L ip.8080.li/ip.json # [OR] curl -L ip.8080.li?format=json

# JSONP
curl -L ip.8080.li/ip.jsonp # [OR] curl -L ip.8080.li?format=jsonp

# XML
curl -L ip.8080.li/ip.xml # [OR] curl -L ip.8080.li?format=xml
```

#### Get IP and Geographic Info
```bash
# Plain Text
curl -L ip.8080.li/geo

# JSON
curl -L ip.8080.li/geo.json # [OR] curl -L ip.8080.li/geo?format=json

# JSONP
curl -L ip.8080.li/geo.jsonp # [OR] curl -L ip.8080.li/geo?format=jsonp

# XML
curl -L ip.8080.li/geo.xml # [OR] curl -L ip.8080.li/geo?format=xml
```

## Install dependencies
```bash
bun install
```

## Run Dev Server
```bash
bun run dev
```

## Run Production Server (Bun)
```bash
bun run start
```

## Run Production Server (Docker)
```bash
docker compose up -d --build
```

## LICENSE
[MIT License](LICENSE)