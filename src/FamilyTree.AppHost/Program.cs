var builder = DistributedApplication.CreateBuilder(args);

// Add Keycloak for identity management
var keycloak = builder.AddContainer("keycloak", "quay.io/keycloak/keycloak", "26.0")
    .WithVolume("familytree-keycloak-data", "/opt/keycloak/data")
    .WithBindMount("../../keycloak", "/opt/keycloak/data/import", isReadOnly: true)
    .WithHttpEndpoint(port: 8080, targetPort: 8080, name: "http")
    .WithEnvironment("KC_BOOTSTRAP_ADMIN_USERNAME", "admin")
    .WithEnvironment("KC_BOOTSTRAP_ADMIN_PASSWORD", "admin")
    .WithEnvironment("KC_HEALTH_ENABLED", "true")
    .WithEnvironment("KC_HTTP_ENABLED", "true")
    .WithEnvironment("KC_HOSTNAME_STRICT", "false")
    .WithEnvironment("KC_PROXY_HEADERS", "xforwarded")
    .WithArgs("start-dev", "--import-realm")
    .WithLifetime(ContainerLifetime.Persistent);

// Add MongoDB as a container
var mongodb = builder.AddContainer("mongodb", "mongo", "8.0")
    .WithVolume("familytree-mongodb-data", "/data/db")
    .WithEndpoint(port: 27017, targetPort: 27017, name: "mongodb")
    .WithLifetime(ContainerLifetime.Persistent);

// Add the API service
var api = builder.AddProject<Projects.FamilyTree_Api>("api")
    .WithEnvironment("ConnectionStrings__familytree", "mongodb://localhost:27017/familytree")
    .WithEnvironment("Authentication__Authority", "http://localhost:8080/realms/familytree")
    .WithEnvironment("Authentication__Audience", "familytree-api")
    .WaitFor(mongodb)
    .WaitFor(keycloak)
    .WithExternalHttpEndpoints();

// Add the frontend as a container with Node 22
var frontend = builder.AddContainer("frontend", "node", "22-alpine")
    .WithBindMount("../../frontend", "/app")
    .WithArgs("sh", "-c", "cd /app && npm install && npm run dev -- --host 0.0.0.0 --port 3000")
    .WithHttpEndpoint(port: 3000, targetPort: 3000, name: "http")
    .WithEnvironment("API_URL", "http://host.docker.internal:5000")
    .WithEnvironment("VITE_KEYCLOAK_URL", "http://localhost:8080")
    .WithEnvironment("VITE_KEYCLOAK_REALM", "familytree")
    .WithEnvironment("VITE_KEYCLOAK_CLIENT_ID", "familytree-frontend")
    .WaitFor(api)
    .WaitFor(keycloak);

builder.Build().Run();
